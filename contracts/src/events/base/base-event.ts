import { v4 as uuidv4 } from 'uuid';

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
export abstract class PlatformEvent<T = any> implements BaseEvent<T> {
  readonly eventId: string;
  readonly eventType: string;
  readonly eventVersion: string;
  readonly timestamp: string;
  aggregateId?: string;
  readonly payload: T;
  metadata?: EventMetadata;

  constructor(
    eventType: string,
    eventVersion: string,
    payload: T,
    options: {
      aggregateId?: string;
      metadata?: EventMetadata;
      eventId?: string;
      timestamp?: string;
    } = {}
  ) {
    this.eventId = options.eventId || uuidv4();
    this.eventType = eventType;
    this.eventVersion = eventVersion;
    this.timestamp = options.timestamp || new Date().toISOString();
    this.aggregateId = options.aggregateId;
    this.payload = payload;
    this.metadata = options.metadata;
  }

  /**
   * Проверяет, является ли объект валидным событием
   */
  static isValidEvent(event: any): event is BaseEvent {
    return (
      event &&
      typeof event === 'object' &&
      typeof event.eventId === 'string' &&
      typeof event.eventType === 'string' &&
      typeof event.eventVersion === 'string' &&
      typeof event.timestamp === 'string' &&
      typeof event.payload === 'object' &&
      event.payload !== null
    );
  }

  /**
   * Создает копию события с обновленными метаданными
   */
  withMetadata(metadata: Partial<EventMetadata>): this {
    const Constructor = this.constructor as new (...args: any[]) => this;
    return new Constructor(
      this.eventType,
      this.eventVersion,
      this.payload,
      {
        eventId: this.eventId,
        timestamp: this.timestamp,
        aggregateId: this.aggregateId,
        metadata: { ...this.metadata, ...metadata },
      }
    );
  }

  /**
   * Сериализует событие в JSON строку
   */
  toJSON(): string {
    return JSON.stringify({
      eventId: this.eventId,
      eventType: this.eventType,
      eventVersion: this.eventVersion,
      timestamp: this.timestamp,
      aggregateId: this.aggregateId,
      payload: this.payload,
      metadata: this.metadata,
    });
  }

  /**
   * Десериализует JSON строку в событие
   */
  static fromJSON<T>(json: string): BaseEvent<T> {
    const data = JSON.parse(json);
    if (!PlatformEvent.isValidEvent(data)) {
      throw new Error('Invalid event JSON');
    }
    return data;
  }
}

/**
 * Утилита для создания событий
 */
export function createEvent<T>(
  eventType: string,
  eventVersion: string,
  payload: T,
  options: {
    aggregateId?: string;
    metadata?: EventMetadata;
    eventId?: string;
    timestamp?: string;
  } = {}
): BaseEvent<T> {
  return {
    eventId: options.eventId || uuidv4(),
    eventType,
    eventVersion,
    timestamp: options.timestamp || new Date().toISOString(),
    aggregateId: options.aggregateId,
    payload,
    metadata: options.metadata,
  };
}

/**
 * Type guard для проверки типа события
 */
export function isEventType<T>(
  event: BaseEvent,
  eventType: string
): event is BaseEvent<T> {
  return event.eventType === eventType;
}

/**
 * Валидатор событий
 */
export function validateEvent(event: any): event is BaseEvent {
  return PlatformEvent.isValidEvent(event);
}