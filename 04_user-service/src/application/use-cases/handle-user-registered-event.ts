import { Injectable, Logger } from '@nestjs/common';
import { CreateUserUseCase } from './create-user';
import { CreateUserDto } from '../dto/create-user';
import { UserRegisteredEventDto } from '../dto/user-registered-event';
import { UserRegisteredEvent } from '@platform/contracts';
import { UserStatus } from '../../domain/entities/user-profile';

@Injectable()
export class HandleUserRegisteredEventUseCase {
  private readonly logger = new Logger(HandleUserRegisteredEventUseCase.name);
  private readonly maxRetries = 3;
  private readonly retryDelays = [1000, 5000, 15000]; // exponential backoff

  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  async execute(event: UserRegisteredEventDto): Promise<void> {
    const eventId = event.eventId || 'unknown';
    this.logger.log(`📨 Processing UserRegistered event: ${eventId} for auth user: ${event.data.userId}`);

    try {
      // КРИТИЧЕСКАЯ ВАЛИДАЦИЯ: проверяем обязательные поля
      this.validateEvent(event);

      // Извлекаем имя из event.data.name
      const name = event.data.name || '';
      const nameParts = name.trim().split(/\s+/);
      
      let firstName = '';
      let lastName = '';
      
      if (nameParts.length === 1) {
        firstName = nameParts[0];
      } else if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      }
      
      // Если нет имени в событии, используем email как fallback
      if (!firstName && event.data.email) {
        firstName = event.data.email.split('@')[0];
      }

      // Маппинг UserRegistered → CreateUserDto
      const createUserDto: CreateUserDto = {
        // ⚠️ КРИТИЧЕСКИ ВАЖНО: передаем authUserId
        authUserId: event.data.userId,
        email: event.data.email,
        firstName: firstName || '',
        lastName: lastName || '',
        phone: event.metadata?.phone || undefined,
        avatarUrl: event.metadata?.avatarUrl || undefined,
        isVerified: false, // По умолчанию не верифицирован
        status: UserStatus.ACTIVE, // Новые пользователи всегда активны
        metadata: {
          source: 'auth-service-registration',
          originalEventId: event.eventId,
          correlationId: event.correlationId,
          registeredAt: event.data.registeredAt || new Date().toISOString(),
          eventSource: event.source || 'unknown',
          eventVersion: event.version || '1.0.0',
          processingTimestamp: new Date().toISOString(),
          ...event.metadata
        }
      };

      // Пытаемся создать пользователя с retry механизмом
      await this.executeWithRetry(createUserDto, eventId);

      this.logger.log(`✅ Successfully created profile for auth user: ${event.data.userId}`);
      
    } catch (error) {
      // Обработка конфликтов (иденпотентность)
      if (error instanceof Error && error.message.includes('already exists')) {
        this.logger.warn(`⚠️ User profile already exists for auth user: ${event.data.userId}. Skipping.`);
        return; // Идемпотентность - если уже существует, считаем успехом
      }
      
      // Другие ошибки
      this.logger.error(`❌ Failed to create user profile for ${event.data.userId}:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        eventId: event.eventId,
        authUserId: event.data.userId,
      });
      
      // Пробрасываем ошибку дальше для DLQ
      throw error;
    }
  }

  /**
   * КРИТИЧЕСКАЯ ВАЛИДАЦИЯ: проверяем обязательные поля события
   */
  private validateEvent(event: UserRegisteredEventDto): void {
    const errors: string[] = [];

    if (!event.eventId) {
      errors.push('Missing eventId');
    }

    if (!event.data?.userId) {
      errors.push('Missing userId in event data');
    } else {
      // Проверка формата UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(event.data.userId)) {
        errors.push(`Invalid userId format (must be UUID): ${event.data.userId}`);
      }
    }

    if (!event.data?.email) {
      errors.push('Missing email in event data');
    } else {
      // Базовая проверка email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(event.data.email)) {
        errors.push(`Invalid email format: ${event.data.email}`);
      }
    }

    if (!event.data?.registeredAt) {
      errors.push('Missing registeredAt in event data');
    } else {
      // Проверка что registeredAt валидная дата
      const registeredDate = new Date(event.data.registeredAt);
      if (isNaN(registeredDate.getTime())) {
        errors.push(`Invalid registeredAt date: ${event.data.registeredAt}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Invalid UserRegisteredEvent: ${errors.join(', ')}`);
    }
  }

  /**
   * Выполняет создание пользователя с retry механизмом
   */
  private async executeWithRetry(createUserDto: CreateUserDto, eventId: string): Promise<void> {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const user = await this.createUserUseCase.execute(createUserDto);
        
        // КРИТИЧЕСКАЯ ПРОВЕРКА: убеждаемся что ID совпадает с authUserId
        if (user.id !== createUserDto.authUserId) {
          this.logger.error(`🚨 ID MISMATCH! Auth: ${createUserDto.authUserId}, User Service: ${user.id}`);
          // Это критическая ошибка, но продолжаем так как профиль создан
          // В production нужно алертинг и возможно rollback
        }
        
        this.logger.debug(`Created profile. Auth User ID: ${createUserDto.authUserId}, User Service ID: ${user.id}`);
        return; // Успешно
        
      } catch (error) {
        const isLastAttempt = attempt === this.maxRetries - 1;
        
        if (isLastAttempt) {
          this.logger.error(`❌ All retry attempts failed for event ${eventId}:`, {
            attempt: attempt + 1,
            error: error instanceof Error ? error.message : 'Unknown error',
            authUserId: createUserDto.authUserId,
          });
          throw error; // Пробрасываем ошибку для DLQ
        }

        // Ожидаем перед следующей попыткой
        const delay = this.retryDelays[attempt];
        this.logger.warn(`⚠️ Retry attempt ${attempt + 1}/${this.maxRetries} for event ${eventId} in ${delay}ms`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          authUserId: createUserDto.authUserId,
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Проверяет, является ли событие дубликатом (для иденпотентности)
   * В production здесь можно проверять по eventId в БД
   */
  private async isDuplicateEvent(eventId: string): Promise<boolean> {
    // TODO: Реализовать проверку дубликатов по eventId
    // Можно хранить processed event IDs в Redis или БД
    return false;
  }
}