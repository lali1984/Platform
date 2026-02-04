// Локальная реализация DomainEvent для user-service

export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly eventName: string;
  public readonly aggregateId: string;
  public readonly occurredAt: Date;
  public readonly metadata?: Record<string, any>;

  constructor(
    eventName: string,
    aggregateId: string,
    occurredAt?: Date,
    metadata?: Record<string, any>
  ) {
    this.eventId = this.generateEventId();
    this.eventName = eventName;
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt || new Date();
    this.metadata = metadata;
  }

  /**
   * Генерирует уникальный идентификатор события
   */
  private generateEventId(): string {
    return require('uuid').v4();
  }

  /**
   * Преобразует событие в примитивы
   */
  public abstract toPrimitives(): Record<string, any>;

  /**
   * Сериализует событие в JSON
   */
  public toJSON(): string {
    return JSON.stringify(this.toPrimitives());
  }

  /**
   * Получает тип события
   */
  public getEventType(): string {
    return this.eventName;
  }

  /**
   * Получает версию события
   */
  public getEventVersion(): string {
    return '1.0.0';
  }

  /**
   * Создает копию события с обновленными метаданными
   */
  public withMetadata(metadata: Record<string, any>): this {
    const Constructor = this.constructor as new (
      eventName: string,
      aggregateId: string,
      occurredAt?: Date,
      metadata?: Record<string, any>
    ) => this;

    return new Constructor(
      this.eventName,
      this.aggregateId,
      this.occurredAt,
      { ...this.metadata, ...metadata }
    );
  }

  /**
   * Проверяет, является ли событие определенного типа
   */
  public isEventType(eventType: string): boolean {
    return this.eventName === eventType;
  }

  /**
   * Сравнивает события по идентификатору
   */
  public equals(event?: DomainEvent): boolean {
    if (!event) {
      return false;
    }
    return this.eventId === event.eventId;
  }

  /**
   * Получает возраст события в миллисекундах
   */
  public getAge(): number {
    return Date.now() - this.occurredAt.getTime();
  }

  /**
   * Проверяет, является ли событие свежим (менее N минут)
   */
  public isFresh(minutes: number = 5): boolean {
    return this.getAge() < minutes * 60 * 1000;
  }
}

/**
 * Базовый класс для событий, связанных с пользователями
 */
export abstract class UserDomainEvent extends DomainEvent {
  constructor(
    eventName: string,
    aggregateId: string,
    public readonly userId: string,
    occurredAt?: Date,
    metadata?: Record<string, any>
  ) {
    super(eventName, aggregateId, occurredAt, metadata);
  }

  /**
   * Преобразует событие в примитивы
   */
  public toPrimitives(): Record<string, any> {
    return {
      eventId: this.eventId,
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      userId: this.userId,
      occurredAt: this.occurredAt.toISOString(),
      metadata: this.metadata,
    };
  }
}

/**
 * Утилиты для работы с событиями
 */
export class EventUtils {
  /**
   * Валидирует событие
   */
  public static isValidEvent(event: any): event is DomainEvent {
    return (
      event &&
      typeof event === 'object' &&
      typeof event.eventId === 'string' &&
      typeof event.eventName === 'string' &&
      typeof event.aggregateId === 'string' &&
      event.occurredAt instanceof Date &&
      typeof event.toPrimitives === 'function'
    );
  }

  /**
   * Создает событие из примитивов
   */
  public static fromPrimitives<T extends DomainEvent>(
    primitives: Record<string, any>,
    EventClass: new (...args: any[]) => T
  ): T {
    const event = new EventClass(
      primitives.eventName,
      primitives.aggregateId,
      new Date(primitives.occurredAt),
      primitives.metadata
    );

    // Восстанавливаем дополнительные свойства
    Object.assign(event, {
      eventId: primitives.eventId,
      ...primitives,
    });

    return event;
  }

  /**
   * Группирует события по типу
   */
  public static groupByType(events: DomainEvent[]): Record<string, DomainEvent[]> {
    return events.reduce((groups, event) => {
      const type = event.eventName;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(event);
      return groups;
    }, {} as Record<string, DomainEvent[]>);
  }

  /**
   * Фильтрует события по типу
   */
  public static filterByType(events: DomainEvent[], eventType: string): DomainEvent[] {
    return events.filter(event => event.eventName === eventType);
  }

  /**
   * Сортирует события по времени возникновения
   */
  public static sortByOccurredAt(events: DomainEvent[], ascending: boolean = true): DomainEvent[] {
    return [...events].sort((a, b) => {
      const timeA = a.occurredAt.getTime();
      const timeB = b.occurredAt.getTime();
      return ascending ? timeA - timeB : timeB - timeA;
    });
  }
}