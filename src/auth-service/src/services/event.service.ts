
//import { UserRegisteredEvent, UserLoggedInEvent } from '../events/event.types';

import {
  redisEventPublisher,
  EventType,
  createBaseEvent,
  generateCorrelationId
} from '../shared-stub';

export class EventService {
  private static instance: EventService;
  private isInitialized = false;
  private source = 'auth-service';

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
        // В development режиме можем пропустить инициализацию Redis
        // если он не доступен, чтобы не ломать запуск сервиса
        if (process.env.NODE_ENV === 'production') {
          await redisEventPublisher.connect();
        }
        
        this.isInitialized = true;
        console.log('Event service initialized');
      } catch (error: any) {
        console.warn('Event service initialization warning:', error.message);
        // В development режиме продолжаем без событий
        if (process.env.NODE_ENV === 'production') {
          throw error;
        }
      }
    }
  }

  public async publishUserRegistered(userData: {
    userId: string;
    email: string;
    metadata?: {
      userAgent?: string;
      ipAddress?: string;
    };
  }): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const correlationId = generateCorrelationId();
    const baseEvent = createBaseEvent(EventType.USER_REGISTERED, this.source, correlationId);

    const event = {
      ...baseEvent,
      data: {
        userId: userData.userId,
        email: userData.email,
        registeredAt: new Date().toISOString(),
        metadata: userData.metadata
      }
    };

    try {
      await redisEventPublisher.publish(event as any);
      console.log(`User registered event published: ${userData.email}`);
    } catch (error: any) {
      console.error('Failed to publish user registered event:', error);
      // Не выбрасываем ошибку дальше, чтобы не ломать регистрацию пользователя
    }
  }

  public async publishUserLoggedIn(userData: {
    userId: string;
    email: string;
    metadata?: {
      userAgent?: string;
      ipAddress?: string;
    };
  }): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const correlationId = generateCorrelationId();
    const baseEvent = createBaseEvent(EventType.USER_LOGGED_IN, this.source, correlationId);

    const event = {
      ...baseEvent,
      data: {
        userId: userData.userId,
        email: userData.email,
        loginAt: new Date().toISOString(),
        metadata: userData.metadata
      }
    };

    try {
      await redisEventPublisher.publish(event as any);
      console.log(`User logged in event published: ${userData.email}`);
    } catch (error: any) {
      console.error('Failed to publish user logged in event:', error);
    }
  }

  public async shutdown(): Promise<void> {
    if (this.isInitialized) {
      try {
        await redisEventPublisher.disconnect();
        this.isInitialized = false;
        console.log('Event service shutdown');
      } catch (error: any) {
        console.error('Error during event service shutdown:', error);
      }
    }
  }

  public async getStatus(): Promise<{
    initialized: boolean;
    redisConnected: boolean;
  }> {
    try {
      const status = await redisEventPublisher.getStatus();
      return {
        initialized: this.isInitialized,
        redisConnected: status.connected
      };
    } catch (error: any) {
      return {
        initialized: this.isInitialized,
        redisConnected: false
      };
    }
  }
}

export default EventService.getInstance();
