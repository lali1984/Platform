import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/ports/user-repository.port';
import { EventPublisher } from '../../domain/ports/event-publisher.port';
import { createUserRegisteredEvent } from '@platform/contracts';
import crypto from 'crypto';

export interface RegisterUserCommand {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface RegisterUserResult {
  success: boolean;
  user?: User;
  error?: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    try {
      // 1. Валидация email
      if (!this.isValidEmail(command.email)) {
        return {
          success: false,
          error: 'Invalid email format',
        };
      }

      // 2. Валидация пароля (синхронизирована с фронтендом)
      if (!this.isValidPassword(command.password)) {
        return {
          success: false,
          error: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
        };
      }

      // 3. Проверка уникальности email
      const emailExists = await this.userRepository.exists({ email: command.email });
      if (emailExists) {
        return {
          success: false,
          error: 'User with this email already exists',
        };
      }

      // 4. Проверка уникальности username (если предоставлен)
      if (command.username) {
        const usernameExists = await this.userRepository.exists({ username: command.username });
        if (usernameExists) {
          return {
            success: false,
            error: 'User with this username already exists',
          };
        }
      }

      // 5. Создание пользователя
      const user = await User.create({
        email: command.email,
        password: command.password,
        username: command.username,
        firstName: command.firstName,
        lastName: command.lastName,
      });

      // 6. Сохранение пользователя
      const savedUser = await this.userRepository.save(user);

      // 7. Публикация доменных событий
      await this.publishDomainEvents(user);

      // 8. Публикация интеграционного события (асинхронно)
      this.publishIntegrationEvent(savedUser, command.metadata).catch(error => {
        console.error('Failed to publish integration event:', error);
      });

      return {
        success: true,
        user: savedUser,
      };
    } catch (error) {
      console.error('RegisterUserUseCase error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    // 🔴 Синхронизировано с требованиями фронтенда
    return password.length >= 8 &&
           /[a-z]/.test(password) &&
           /[A-Z]/.test(password) &&
           /\d/.test(password) &&
           /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  }

  private async publishDomainEvents(user: User): Promise<void> {
    const events = user.getDomainEvents();
    for (const event of events) {
      try {
        const baseEvent = {
          eventId: crypto.randomUUID(),
          eventType: event.type,
          eventVersion: '1.0.0',
          timestamp: new Date().toISOString(),
          aggregateId: event.data.userId || undefined,
          payload: event.data,
          metadata: {
            sourceService: 'auth-service',
            correlationId: crypto.randomUUID(),
          },
        };

        await this.eventPublisher.publish(baseEvent as any);
      } catch (error) {
        console.error(`Failed to publish domain event ${event.type}:`, error);
      }
    }

    user.clearDomainEvents();
  }

  private async publishIntegrationEvent(
    user: User,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    if (!this.eventPublisher.isAvailable()) {
      console.warn('Event publisher not available, skipping integration event');
      return;
    }

    const event = createUserRegisteredEvent(
      user.id,
      user.email,
      user.firstName || '',
      {
        metadata: {
          ...metadata,
          sourceService: 'auth-service',
        },
      }
    );

    await this.eventPublisher.publish(event);
  }
}