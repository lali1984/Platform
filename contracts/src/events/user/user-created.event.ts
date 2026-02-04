import { BaseEvent, PlatformEvent } from '../base/base-event';

/**
 * Полезная нагрузка события создания пользователя
 */
export interface UserCreatedPayload {
  /** Уникальный идентификатор пользователя */
  userId: string;

  /** Email пользователя */
  email: string;

  /** Имя пользователя */
  firstName: string;

  /** Фамилия пользователя */
  lastName: string;

  /** Телефон пользователя */
  phone?: string;

  /** URL аватара */
  avatarUrl?: string;

  /** Статус пользователя */
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';

  /** Подтверждён ли email */
  isVerified: boolean;

  /** Время создания в ISO формате */
  createdAt: string;
}

/**
 * Событие создания пользователя
 */
export type UserCreatedEvent = BaseEvent<UserCreatedPayload>;

/**
 * Класс события создания пользователя
 */
export class UserCreatedPlatformEvent 
  extends PlatformEvent<UserCreatedPayload> 
  implements UserCreatedEvent {
  
  constructor(
    payload: UserCreatedPayload,
    options: {
      aggregateId?: string;
      metadata?: any;
      eventId?: string;
      timestamp?: string;
    } = {}
  ) {
    super(
      'UserCreated',
      '1.0.0',
      payload,
      {
        aggregateId: payload.userId,
        ...options,
      }
    );
  }

  /**
   * Создает событие создания пользователя
   */
  static create(
    userId: string,
    email: string,
    firstName: string,
    lastName: string,
    options: {
      phone?: string;
      avatarUrl?: string;
      status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
      isVerified?: boolean;
    } = {}
  ): UserCreatedPlatformEvent {
    return new UserCreatedPlatformEvent({
      userId,
      email,
      firstName,
      lastName,
      phone: options.phone,
      avatarUrl: options.avatarUrl,
      status: options.status ?? 'ACTIVE',
      isVerified: options.isVerified ?? false,
      createdAt: new Date().toISOString(),
    });
  }
}

/**
 * Type guard для события создания пользователя
 */
export function createUserCreatedEvent(
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
  options: {
    phone?: string;
    avatarUrl?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
    isVerified?: boolean;
    metadata?: any;
    eventId?: string;
    timestamp?: string;
  } = {}
): UserCreatedEvent {
  return {
    eventId: options.eventId || crypto.randomUUID(),
    eventType: 'UserCreated',
    eventVersion: '1.0.0',
    timestamp: options.timestamp || new Date().toISOString(),
    aggregateId: userId,
    payload: {
      userId,
      email,
      firstName,
      lastName,
      phone: options.phone,
      avatarUrl: options.avatarUrl,
      status: options.status ?? 'ACTIVE',
      isVerified: options.isVerified ?? false,
      createdAt: new Date().toISOString(),
    },
    metadata: options.metadata,
  };
}

/**
 * Type guard для события создания пользователя
 */
export function isUserCreatedEvent(event: BaseEvent): event is UserCreatedEvent {
  return event.eventType === 'UserCreated';
}