// Исправляем конструктор DomainEvent
export abstract class DomainEvent {
  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string, // string, а не Date!
    public readonly occurredAt: Date = new Date(),
    public readonly eventId: string = require('uuid').v4()
  ) {}

  abstract toPrimitives(): Record<string, any>;
}
