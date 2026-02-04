import { BaseEvent, PlatformEvent } from '../base/base-event';

/**
 * Полезная нагрузка события регистрации пользователя
 */
export interface UserRegisteredPayload {
  /** Уникальный идентификатор пользователя */
  userId: string;
  
  /** Email пользователя */
  email: string;
  
  /** Имя пользователя */
  name: string;
  
  /** Время регистрации в ISO формате */
  registeredAt: string;
  
  /** Дополнительные данные пользователя */
  metadata?: {
    phone?: string;
    avatarUrl?: string;
    timezone?: string;
    locale?: string;
  };
}

/**
 * Событие регистрации пользователя
 */
export type UserRegisteredEvent = BaseEvent<UserRegisteredPayload>;

/**
 * Класс события регистрации пользователя
 */
export class UserRegisteredPlatformEvent 
  extends PlatformEvent<UserRegisteredPayload> 
  implements UserRegisteredEvent {
  
  constructor(
    payload: UserRegisteredPayload,
    options: {
      aggregateId?: string;
      metadata?: any;
      eventId?: string;
      timestamp?: string;
    } = {}
  ) {
    super(
      'UserRegistered',
      '1.0.0',
      payload,
      {
        aggregateId: payload.userId,
        ...options,
      }
    );
  }

  /**
   * Создает событие регистрации пользователя
   */
  static create(
    userId: string,
    email: string,
    name: string,
    metadata?: {
      phone?: string;
      avatarUrl?: string;
      timezone?: string;
      locale?: string;
    }
  ): UserRegisteredPlatformEvent {
    return new UserRegisteredPlatformEvent({
      userId,
      email,
      name,
      registeredAt: new Date().toISOString(),
      metadata,
    });
  }

  /**
   * Type guard для события регистрации пользователя
   */
  static isUserRegisteredEvent(event: BaseEvent): event is UserRegisteredEvent {
    return event.eventType === 'UserRegistered';
  }
}

/**
 * Утилита для создания события регистрации пользователя
 */
export function createUserRegisteredEvent(
  userId: string,
  email: string,
  name: string,
  options: {
    metadata?: any;
    eventId?: string;
    timestamp?: string;
  } = {}
): UserRegisteredEvent {
  return {
    eventId: options.eventId || crypto.randomUUID(),
    eventType: 'UserRegistered',
    eventVersion: '1.0.0',
    timestamp: options.timestamp || new Date().toISOString(),
    aggregateId: userId,
    payload: {
      userId,
      email,
      name,
      registeredAt: new Date().toISOString(),
    },
    metadata: options.metadata,
  };
}