import { UserRepository } from '../../domain/ports/UserRepository.port';
import { TokenService, TokenPayload } from '../../domain/ports/TokenService.port';
import { TwoFactorService } from '../../domain/ports/TwoFactorService.port';
import { EventPublisher } from '../../domain/ports/EventPublisher.port';
import crypto from 'crypto';

export interface Generate2FASecretCommand {
  userId: string;
  email: string;
}

export interface Generate2FASecretResult {
  success: boolean;
  secret?: {
    secret: string;
    qrCodeUrl: string;
    otpauthUrl: string;
  };
  error?: string;
}

export interface Verify2FATokenCommand {
  userId: string;
  token: string;
}

export interface Verify2FATokenResult {
  success: boolean;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  error?: string;
}

export class TwoFactorUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly twoFactorService: TwoFactorService,
    private readonly eventPublisher: EventPublisher
  ) {}

  async generateSecret(command: Generate2FASecretCommand): Promise<Generate2FASecretResult> {
    try {
      // 1. Находим пользователя
      const user = await this.userRepository.findOne({ id: command.userId });
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // 2. Проверяем, что email совпадает
      if (user.email !== command.email) {
        return {
          success: false,
          error: 'Invalid email',
        };
      }

      // 3. Генерируем секрет и QR код
      const secretData = await this.twoFactorService.generateSecretWithQR(command.email);

      // 4. Сохраняем секрет в пользователе
      user.enableTwoFactor(secretData.secret);
      await this.userRepository.save(user);

      // 5. Публикуем событие
      await this.publish2FAEnabledEvent(user);

      return {
        success: true,
        secret: secretData,
      };
    } catch (error) {
      console.error('Generate2FASecret error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate 2FA secret',
      };
    }
  }

  async verifyToken(command: Verify2FATokenCommand): Promise<Verify2FATokenResult> {
    try {
      // 1. Находим пользователя
      const user = await this.userRepository.findOne({ id: command.userId });
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // 2. Проверяем, что 2FA включена
      if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
        return {
          success: false,
          error: '2FA is not enabled for this user',
        };
      }

      // 3. Верифицируем токен
      const isValid = this.twoFactorService.verifyToken(user.twoFactorSecret, command.token);
      
      if (!isValid) {
        await this.publish2FAFailedEvent(user);
        return {
          success: false,
          error: 'Invalid 2FA token',
        };
      }

      // 4. Генерируем токены с флагом 2FA аутентификации
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        isTwoFactorAuthenticated: true,
      };

      const accessToken = this.tokenService.generateAccessToken(tokenPayload);
      const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);
      
      // 5. Сохраняем refresh token
      await this.tokenService.saveRefreshToken(user.id, refreshToken);

      // 6. Публикуем событие успешной 2FA аутентификации
      await this.publish2FASuccessEvent(user);

      return {
        success: true,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 15 * 60, // 15 минут
        },
      };
    } catch (error) {
      console.error('Verify2FAToken error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify 2FA token',
      };
    }
  }

  async disable2FA(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await this.userRepository.findOne({ id: userId });
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      user.disableTwoFactor();
      await this.userRepository.save(user);

      await this.publish2FADisabledEvent(user);

      return { success: true };
    } catch (error) {
      console.error('Disable2FA error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to disable 2FA',
      };
    }
  }

    private async publish2FAEnabledEvent(user: any): Promise<void> {
    try {
      const event = {
        eventId: crypto.randomUUID(),
        eventType: 'TwoFactorEnabled',
        eventVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        aggregateId: user.id,
        payload: {
          userId: user.id,
          email: user.email,
          enabledAt: new Date().toISOString(),
        },
        metadata: {
          sourceService: 'auth-service',
          correlationId: crypto.randomUUID(),
        },
      };

      await this.eventPublisher.publish(event as any);
    } catch (error) {
      console.error('Failed to publish 2FA enabled event:', error);
    }
  }

  private async publish2FASuccessEvent(user: any): Promise<void> {
    try {
      const event = {
        eventId: crypto.randomUUID(),
        eventType: 'TwoFactorAuthenticated',
        eventVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        aggregateId: user.id,
        payload: {
          userId: user.id,
          email: user.email,
          authenticatedAt: new Date().toISOString(),
        },
        metadata: {
          sourceService: 'auth-service',
          correlationId: crypto.randomUUID(),
        },
      };

      await this.eventPublisher.publish(event as any);
    } catch (error) {
      console.error('Failed to publish 2FA success event:', error);
    }
  }

  private async publish2FAFailedEvent(user: any): Promise<void> {
    try {
      const event = {
        eventId: crypto.randomUUID(),
        eventType: 'TwoFactorFailed',
        eventVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        aggregateId: user.id,
        payload: {
          userId: user.id,
          email: user.email,
          failedAt: new Date().toISOString(),
        },
        metadata: {
          sourceService: 'auth-service',
          correlationId: crypto.randomUUID(),
        },
      };

      await this.eventPublisher.publish(event as any);
    } catch (error) {
      console.error('Failed to publish 2FA failed event:', error);
    }
  }

  private async publish2FADisabledEvent(user: any): Promise<void> {
    try {
      const event = {
        eventId: crypto.randomUUID(),
        eventType: 'TwoFactorDisabled',
        eventVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        aggregateId: user.id,
        payload: {
          userId: user.id,
          email: user.email,
          disabledAt: new Date().toISOString(),
        },
        metadata: {
          sourceService: 'auth-service',
          correlationId: crypto.randomUUID(),
        },
      };

      await this.eventPublisher.publish(event as any);
    } catch (error) {
      console.error('Failed to publish 2FA disabled event:', error);
    }
  }
}
