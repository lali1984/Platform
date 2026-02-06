// Локальная реализация AggregateRoot для user-service
import { Entity } from './entity';

export abstract class AggregateRoot<T> extends Entity<T> {
  private domainEvents: any[] = [];

  /**
   * Получает все доменные события
   */
  public getDomainEvents(): any[] {
    return [...this.domainEvents];
  }

  /**
   * Добавляет доменное событие
   */
  public addDomainEvent(event: any): void {
    this.domainEvents.push(event);
  }

  /**
   * Очищает доменные события
   */
  public clearDomainEvents(): void {
    this.domainEvents = [];
  }

  /**
   * Получает события (alias для обратной совместимости)
   */
  public get events(): any[] {
    return this.getDomainEvents();
  }

  /**
   * Добавляет событие (alias для обратной совместимости)
   */
  protected addEvent(event: any): void {
    this.addDomainEvent(event);
  }

  /**
   * Очищает события (alias для обратной совместимости)
   */
  public clearEvents(): void {
    this.clearDomainEvents();
  }

  /**
   * Применяет событие к агрегату
   */
  protected applyEvent(event: any): void {
    this.addDomainEvent(event);
    // Здесь может быть логика применения события к состоянию
  }

  /**
   * Валидирует бизнес-инварианты агрегата
   */
  protected validateInvariants(): void {
    // Должен быть реализован в дочерних классах
    // Бросает исключение при нарушении инвариантов
  }

  /**
   * Проверяет, можно ли выполнить операцию
   */
  protected canPerformOperation(operation: string): boolean {
    // Должен быть реализован в дочерних классах
    return true;
  }

  /**
   * Сохраняет состояние агрегата перед изменением
   */
  protected snapshot(): void {
    // Может быть использовано для event sourcing
  }
}