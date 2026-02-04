// Интерфейс EventPublisher для user-service

/**
 * Интерфейс для публикации событий
 */
export interface EventPublisher {
  /**
   * Публикует событие
   */
  publish(event: PlatformEvent): Promise<void>;

  /**
   * Публикует несколько событий
   */
  publishAll(events: PlatformEvent[]): Promise<void>;

  /**
   * Проверяет, доступен ли publisher
   */
  isAvailable(): boolean;

  /**
   * Закрывает соединение
   */
  shutdown(): Promise<void>;
}

/**
 * Базовый интерфейс для событий платформы
 */
export interface PlatformEvent {
  /** Уникальный идентификатор события */
  eventId: string;

  /** Тип события */
  type: string;

  /** Версия события */
  version: string;

  /** Время создания */
  timestamp: Date;

  /** Данные события */
  data: any;

  /** Идентификатор корреляции */
  correlationId?: string;

  /** Источник события */
  source: string;

  /** Метаданные */
  metadata?: Record<string, any>;

  /**
   * Сериализует событие в JSON
   */
  toJSON(): string;

  /**
   * Получает ключ для партиционирования
   */
  getPartitionKey(): string;
}

/**
 * Базовая реализация PlatformEvent
 */
export abstract class BasePlatformEvent implements PlatformEvent {
  eventId: string;
  type: string;
  version: string;
  timestamp: Date;
  data: any;
  correlationId?: string;
  source: string;
  metadata?: Record<string, any>;

  constructor(
    type: string,
    data: any,
    options: {
      eventId?: string;
      version?: string;
      timestamp?: Date;
      correlationId?: string;
      source?: string;
      metadata?: Record<string, any>;
    } = {}
  ) {
    this.eventId = options.eventId || this.generateEventId();
    this.type = type;
    this.version = options.version || '1.0.0';
    this.timestamp = options.timestamp || new Date();
    this.data = data;
    this.correlationId = options.correlationId;
    this.source = options.source || 'user-service';
    this.metadata = options.metadata;
  }

  /**
   * Генерирует уникальный идентификатор события
   */
  private generateEventId(): string {
    return require('uuid').v4();
  }

  /**
   * Сериализует событие в JSON
   */
  toJSON(): string {
    return JSON.stringify({
      eventId: this.eventId,
      type: this.type,
      version: this.version,
      timestamp: this.timestamp.toISOString(),
      data: this.data,
      correlationId: this.correlationId,
      source: this.source,
      metadata: this.metadata,
    });
  }

  /**
   * Получает ключ для партиционирования
   */
  getPartitionKey(): string {
    // По умолчанию используем eventId
    return this.eventId;
  }

  /**
   * Создает копию события с обновленными данными
   */
  withData(newData: any): this {
    const Constructor = this.constructor as new (
      type: string,
      data: any,
      options: any
    ) => this;

    return new Constructor(
      this.type,
      newData,
      {
        eventId: this.eventId,
        version: this.version,
        timestamp: this.timestamp,
        correlationId: this.correlationId,
        source: this.source,
        metadata: this.metadata,
      }
    );
  }

  /**
   * Создает копию события с обновленными метаданными
   */
  withMetadata(newMetadata: Record<string, any>): this {
    const Constructor = this.constructor as new (
      type: string,
      data: any,
      options: any
    ) => this;

    return new Constructor(
      this.type,
      this.data,
      {
        eventId: this.eventId,
        version: this.version,
        timestamp: this.timestamp,
        correlationId: this.correlationId,
        source: this.source,
        metadata: { ...this.metadata, ...newMetadata },
      }
    );
  }
}

/**
 * Утилиты для работы с событиями
 */
export class EventUtils {
  /**
   * Проверяет, является ли объект PlatformEvent
   */
  static isPlatformEvent(event: any): event is PlatformEvent {
    return (
      event &&
      typeof event === 'object' &&
      typeof event.eventId === 'string' &&
      typeof event.type === 'string' &&
      typeof event.version === 'string' &&
      event.timestamp instanceof Date &&
      typeof event.data === 'object' &&
      typeof event.source === 'string' &&
      typeof event.toJSON === 'function' &&
      typeof event.getPartitionKey === 'function'
    );
  }

  /**
   * Создает событие из JSON
   */
  static fromJSON(json: string): PlatformEvent {
    const data = JSON.parse(json);
    
    // Создаем базовое событие
    const event = new (class extends BasePlatformEvent {
      constructor() {
        super(data.type, data.data, {
          eventId: data.eventId,
          version: data.version,
          timestamp: new Date(data.timestamp),
          correlationId: data.correlationId,
          source: data.source,
          metadata: data.metadata,
        });
      }
    })();

    return event;
  }

  /**
   * Валидирует событие
   */
  static validate(event: PlatformEvent): string[] {
    const errors: string[] = [];

    if (!event.eventId) {
      errors.push('eventId is required');
    }

    if (!event.type) {
      errors.push('type is required');
    }

    if (!event.version) {
      errors.push('version is required');
    }

    if (!event.timestamp) {
      errors.push('timestamp is required');
    }

    if (!event.data) {
      errors.push('data is required');
    }

    if (!event.source) {
      errors.push('source is required');
    }

    return errors;
  }

  /**
   * Создает событие пользователя
   */
  static createUserEvent(
    type: string,
    userData: any,
    options: {
      eventId?: string;
      correlationId?: string;
      metadata?: Record<string, any>;
    } = {}
  ): PlatformEvent {
    return new (class extends BasePlatformEvent {
      constructor() {
        super(
          type,
          userData,
          {
            eventId: options.eventId,
            version: '1.0.0',
            timestamp: new Date(),
            correlationId: options.correlationId,
            source: 'user-service',
            metadata: options.metadata,
          }
        );
      }

      getPartitionKey(): string {
        // Для событий пользователя используем userId как ключ партиционирования
        return userData.userId || this.eventId;
      }
    })();
  }
}