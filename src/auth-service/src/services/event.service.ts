import { EventProducer } from '../../shared/kafka/dist/producers/event.producer';
import { EventType } from '../../shared/kafka/';
import {
  redisEventPublisher,
  createBaseEvent,
  generateCorrelationId
} from '../../shared/events';

// Типы данных для событий
interface UserRegisteredData {
  userId: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    isEmailVerified?: boolean;
    isActive?: boolean;
    isTwoFactorEnabled?: boolean;
    firstName?: string;
    lastName?: string;
  };
}

interface UserLoggedInData {
  userId: string;
  email: string;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    loginMethod?: 'password' | 'oauth' | 'token';
    isTwoFactorEnabled?: boolean;
    deviceInfo?: string;
  };
}

interface UserLoginFailedData {
  email: string;
  reason: 'user_not_found' | 'invalid_password' | 'account_inactive' | 'account_locked' | 'two_factor_required' | 'two_factor_invalid';
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    attemptCount?: number;
  };
}

interface TwoFactorEnabledData {
  userId: string;
  email: string;
  method: 'app' | 'sms' | 'email';
}

interface PasswordResetRequestedData {
  userId: string;
  email: string;
  resetToken?: string;
  expiresAt?: string;
}

export class EventService {
  private static instance: EventService;
  private isInitialized = false;
  private source = 'auth-service';
  private kafkaProducer: EventProducer | null = null;

  private constructor() {}

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  public async initialize(): Promise<void> {
    if (!this.isInitialized) {
      try {
        // 1. Инициализируем Redis (если требуется для обратной совместимости)
        if (process.env.NODE_ENV === 'production' || process.env.USE_REDIS_EVENTS === 'true') {
          await redisEventPublisher.connect();
        }
        
        // 2. Инициализируем Kafka Producer
        try {
          this.kafkaProducer = EventProducer.getInstance();
          await this.kafkaProducer.connect();
          console.log('✅ Kafka producer инициализирован в EventService');
        } catch (kafkaError) {
          console.warn('⚠️ Kafka initialization warning:', (kafkaError as Error).message);
          // В development режиме продолжаем без Kafka
          if (process.env.NODE_ENV === 'production') {
            throw kafkaError;
          }
        }
        
        this.isInitialized = true;
        console.log('Event service initialized with Kafka support');
      } catch (error: any) {
        console.warn('Event service initialization warning:', error.message);
        // В development режиме продолжаем без событий
        if (process.env.NODE_ENV === 'production') {
          throw error;
        }
      }
    }
  }

  // ==================== ОБЩИЕ МЕТОДЫ ====================

  private async publishToRedis(event: any): Promise<void> {
    if (process.env.USE_REDIS_EVENTS === 'true' || process.env.NODE_ENV === 'production') {
      try {
        await redisEventPublisher.publish(event);
        console.log(`📨 Событие отправлено в Redis: ${event.type}`);
      } catch (error: any) {
        console.error('❌ Ошибка отправки в Redis:', error.message);
      }
    }
  }

  private async publishToKafka(event: any): Promise<void> {
    if (this.kafkaProducer && this.isInitialized) {
      try {
        await this.kafkaProducer.sendEvent(event);
        console.log(`📤 Событие отправлено в Kafka: ${event.type}`);
      } catch (error: any) {
        console.error('❌ Ошибка отправки в Kafka:', error.message);
        // Не пробрасываем ошибку, чтобы не ломать основной flow
      }
    }
  }

  // ==================== СОБЫТИЯ АУТЕНТИФИКАЦИИ ====================

  public async publishUserRegistered(userData: UserRegisteredData): Promise<void> {
  if (!this.isInitialized) {
    await this.initialize();
  }

  const correlationId = generateCorrelationId();
  
  // Создаем событие для Kafka
  const kafkaEvent = this.kafkaProducer?.createBaseEvent(
    EventType.USER_REGISTERED,
    this.source,
    {
      userId: userData.userId,
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      registeredAt: new Date().toISOString(),
      metadata: {
        isEmailVerified: userData.metadata?.isEmailVerified || false,
        isActive: userData.metadata?.isActive || true,
        isTwoFactorEnabled: userData.metadata?.isTwoFactorEnabled || false,
        firstName: userData.firstName,
        lastName: userData.lastName,
        ...userData.metadata,
      },
    }
  );

  // Создаем событие для Redis (для обратной совместимости)
  const redisBaseEvent = createBaseEvent('USER_REGISTERED' as any, this.source, correlationId);
  const redisEvent = {
    ...redisBaseEvent,
    data: {
      userId: userData.userId,
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      registeredAt: new Date().toISOString(),
      metadata: userData.metadata
    }
  };

  // Отправляем в оба канала параллельно
  await Promise.allSettled([
    this.publishToRedis(redisEvent),
    kafkaEvent ? this.publishToKafka(kafkaEvent) : Promise.resolve(),
  ]);

  console.log(`✅ Событие регистрации обработано: ${userData.email}`);
}

  public async publishUserLoggedIn(userData: UserLoggedInData): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const correlationId = generateCorrelationId();
    
    // Создаем событие для Kafka
    const kafkaEvent = this.kafkaProducer?.createBaseEvent(
      EventType.USER_LOGGED_IN,
      this.source,
      {
        userId: userData.userId,
        email: userData.email,
        loginAt: new Date().toISOString(),
        metadata: {
          ipAddress: userData.metadata?.ipAddress,
          userAgent: userData.metadata?.userAgent,
          deviceInfo: userData.metadata?.deviceInfo,
          isTwoFactorEnabled: userData.metadata?.isTwoFactorEnabled || false,
          loginMethod: userData.metadata?.loginMethod || 'password',
        },
      }
    );

    // Создаем событие для Redis
    const redisBaseEvent = createBaseEvent('USER_LOGGED_IN' as any, this.source, correlationId);
    const redisEvent = {
      ...redisBaseEvent,
      data: {
        userId: userData.userId,
        email: userData.email,
        loginAt: new Date().toISOString(),
        metadata: userData.metadata
      }
    };

    // Отправляем в оба канала
    await Promise.allSettled([
      this.publishToRedis(redisEvent),
      kafkaEvent ? this.publishToKafka(kafkaEvent) : Promise.resolve(),
    ]);

    console.log(`✅ Событие входа обработано: ${userData.email}`);
  }

  public async publishUserLoginFailed(userData: UserLoginFailedData): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Создаем событие для Kafka
    const kafkaEvent = this.kafkaProducer?.createBaseEvent(
      EventType.USER_LOGIN_FAILED,
      this.source,
      {
        email: userData.email,
        reason: userData.reason,
        failedAt: new Date().toISOString(),
        metadata: {
          ipAddress: userData.metadata?.ipAddress,
          userAgent: userData.metadata?.userAgent,
          attemptCount: userData.metadata?.attemptCount || 1,
        },
      }
    );

    if (kafkaEvent) {
      await this.publishToKafka(kafkaEvent);
    }

    console.log(`✅ Событие ошибки входа обработано: ${userData.email} (${userData.reason})`);
  }

  public async publishTwoFactorEnabled(userData: TwoFactorEnabledData): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const kafkaEvent = this.kafkaProducer?.createBaseEvent(
      EventType.TWO_FACTOR_ENABLED,
      this.source,
      {
        userId: userData.userId,
        email: userData.email,
        enabledAt: new Date().toISOString(),
        method: userData.method,
      }
    );

    if (kafkaEvent) {
      await this.publishToKafka(kafkaEvent);
    }

    console.log(`✅ Событие 2FA включено: ${userData.email} (${userData.method})`);
  }

  public async publishPasswordResetRequested(userData: PasswordResetRequestedData): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const kafkaEvent = this.kafkaProducer?.createBaseEvent(
      EventType.PASSWORD_RESET_REQUESTED,
      this.source,
      {
        userId: userData.userId,
        email: userData.email,
        requestedAt: new Date().toISOString(),
        resetToken: userData.resetToken,
        expiresAt: userData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 часа
      }
    );

    if (kafkaEvent) {
      await this.publishToKafka(kafkaEvent);
    }

    console.log(`✅ Событие сброса пароля: ${userData.email}`);
  }

  // ==================== УТИЛИТЫ ====================

  public async shutdown(): Promise<void> {
    if (this.isInitialized) {
      try {
        // Отключаем Redis
        if (process.env.USE_REDIS_EVENTS === 'true' || process.env.NODE_ENV === 'production') {
          await redisEventPublisher.disconnect();
        }
        
        // Отключаем Kafka
        if (this.kafkaProducer) {
          await this.kafkaProducer.disconnect();
        }
        
        this.isInitialized = false;
        console.log('✅ Event service shutdown (Redis + Kafka)');
      } catch (error: any) {
        console.error('❌ Error during event service shutdown:', error);
      }
    }
  }

  public async getStatus(): Promise<{
  initialized: boolean;
  redisConnected: boolean;
  kafkaConnected: boolean;
  }> {
    try {
      const redisStatus = await redisEventPublisher.getStatus();
      const kafkaStatus = this.kafkaProducer?.getStatus();
      
      return {
        initialized: this.isInitialized,
        redisConnected: redisStatus.connected,
        kafkaConnected: kafkaStatus?.isConnected || false,
      };
    } catch (error: any) {
      return {
        initialized: this.isInitialized,
        redisConnected: false,
        kafkaConnected: false,
      };
    }
  }
}

export default EventService.getInstance();