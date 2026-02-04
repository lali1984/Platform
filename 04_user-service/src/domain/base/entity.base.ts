// Локальная реализация Entity для user-service

export abstract class Entity<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  /**
   * Сравнивает сущности по идентификатору
   */
  public equals(object?: Entity<T>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!(object instanceof Entity)) {
      return false;
    }

    return this.getId() === object.getId();
  }

  /**
   * Получает идентификатор сущности
   * Должен быть реализован в дочерних классах
   */
  protected abstract getId(): string;

  /**
   * Получает свойства сущности
   */
  public getProps(): T {
    return { ...this.props };
  }

  /**
   * Клонирует сущность с новыми свойствами
   */
  public clone(newProps: Partial<T>): this {
    const Constructor = this.constructor as new (props: T) => this;
    return new Constructor({
      ...this.props,
      ...newProps,
    });
  }
}

/**
 * Value Object базовый класс
 */
export abstract class ValueObject {
  /**
   * Сравнивает value objects по значениям
   */
  public equals(vo?: ValueObject): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }

    if (vo.constructor.name !== this.constructor.name) {
      return false;
    }

    return JSON.stringify(vo) === JSON.stringify(this);
  }

  /**
   * Преобразует value object в строку
   */
  public toString(): string {
    return JSON.stringify(this);
  }

  /**
   * Преобразует value object в примитивное значение
   */
  public abstract getValue(): any;
}

/**
 * Базовый класс для Domain Events
 */
export abstract class DomainEvent {
  public readonly timestamp: Date;
  public readonly metadata: Record<string, any>;

  constructor(metadata: Record<string, any> = {}) {
    this.timestamp = new Date();
    this.metadata = metadata;
  }

  /**
   * Получает тип события
   */
  public abstract getEventType(): string;

  /**
   * Получает версию события
   */
  public abstract getEventVersion(): string;

  /**
   * Сериализует событие в JSON
   */
  public toJSON(): string {
    return JSON.stringify({
      eventType: this.getEventType(),
      eventVersion: this.getEventVersion(),
      timestamp: this.timestamp.toISOString(),
      metadata: this.metadata,
    });
  }
}