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
export declare class UserCreatedPlatformEvent extends PlatformEvent<UserCreatedPayload> implements UserCreatedEvent {
    constructor(payload: UserCreatedPayload, options?: {
        aggregateId?: string;
        metadata?: any;
        eventId?: string;
        timestamp?: string;
    });
    /**
     * Создает событие создания пользователя
     */
    static create(userId: string, email: string, firstName: string, lastName: string, options?: {
        phone?: string;
        avatarUrl?: string;
        status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
        isVerified?: boolean;
    }): UserCreatedPlatformEvent;
}
/**
 * Type guard для события создания пользователя
 */
export declare function createUserCreatedEvent(userId: string, email: string, firstName: string, lastName: string, options?: {
    phone?: string;
    avatarUrl?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
    isVerified?: boolean;
    metadata?: any;
    eventId?: string;
    timestamp?: string;
}): UserCreatedEvent;
/**
 * Type guard для события создания пользователя
 */
export declare function isUserCreatedEvent(event: BaseEvent): event is UserCreatedEvent;
//# sourceMappingURL=user-created.event.d.ts.map