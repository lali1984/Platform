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
export declare class UserRegisteredPlatformEvent extends PlatformEvent<UserRegisteredPayload> implements UserRegisteredEvent {
    constructor(payload: UserRegisteredPayload, options?: {
        aggregateId?: string;
        metadata?: any;
        eventId?: string;
        timestamp?: string;
    });
    /**
     * Создает событие регистрации пользователя
     */
    static create(userId: string, email: string, name: string, metadata?: {
        phone?: string;
        avatarUrl?: string;
        timezone?: string;
        locale?: string;
    }): UserRegisteredPlatformEvent;
    /**
     * Type guard для события регистрации пользователя
     */
    static isUserRegisteredEvent(event: BaseEvent): event is UserRegisteredEvent;
}
/**
 * Утилита для создания события регистрации пользователя
 */
export declare function createUserRegisteredEvent(userId: string, email: string, name: string, options?: {
    metadata?: any;
    eventId?: string;
    timestamp?: string;
}): UserRegisteredEvent;
//# sourceMappingURL=user-registered.event.d.ts.map