/**
 * Базовый интерфейс для всех событий платформы
 */
export interface BaseEvent<T = any> {
    /** Уникальный идентификатор события */
    eventId: string;
    /** Тип события (например, 'UserRegistered', 'OrderCreated') */
    eventType: string;
    /** Версия схемы события (формат: '1.0.0') */
    eventVersion: string;
    /** Время создания события в ISO формате */
    timestamp: string;
    /** Идентификатор агрегата, к которому относится событие */
    aggregateId?: string;
    /** Данные события (зависит от типа события) */
    payload: T;
    /** Метаданные события */
    metadata?: EventMetadata;
}
/**
 * Метаданные события
 */
export interface EventMetadata {
    /** Сервис-источник события */
    sourceService: string;
    /** Correlation ID для трассировки */
    correlationId?: string;
    /** Идентификатор пользователя, инициировавшего событие */
    userId?: string;
    /** Дополнительные метаданные */
    [key: string]: any;
}
/**
 * Базовый класс для создания событий
 */
export declare abstract class PlatformEvent<T = any> implements BaseEvent<T> {
    readonly eventId: string;
    readonly eventType: string;
    readonly eventVersion: string;
    readonly timestamp: string;
    aggregateId?: string;
    readonly payload: T;
    metadata?: EventMetadata;
    constructor(eventType: string, eventVersion: string, payload: T, options?: {
        aggregateId?: string;
        metadata?: EventMetadata;
        eventId?: string;
        timestamp?: string;
    });
    /**
     * Проверяет, является ли объект валидным событием
     */
    static isValidEvent(event: any): event is BaseEvent;
    /**
     * Создает копию события с обновленными метаданными
     */
    withMetadata(metadata: Partial<EventMetadata>): this;
    /**
     * Сериализует событие в JSON строку
     */
    toJSON(): string;
    /**
     * Десериализует JSON строку в событие
     */
    static fromJSON<T>(json: string): BaseEvent<T>;
}
/**
 * Утилита для создания событий
 */
export declare function createEvent<T>(eventType: string, eventVersion: string, payload: T, options?: {
    aggregateId?: string;
    metadata?: EventMetadata;
    eventId?: string;
    timestamp?: string;
}): BaseEvent<T>;
/**
 * Type guard для проверки типа события
 */
export declare function isEventType<T>(event: BaseEvent, eventType: string): event is BaseEvent<T>;
/**
 * Валидатор событий
 */
export declare function validateEvent(event: any): event is BaseEvent;
//# sourceMappingURL=base-event.d.ts.map