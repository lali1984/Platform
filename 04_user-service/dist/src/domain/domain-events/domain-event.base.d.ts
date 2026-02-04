export declare abstract class DomainEvent {
    readonly eventName: string;
    readonly aggregateId: string;
    readonly occurredAt: Date;
    readonly eventId: string;
    constructor(eventName: string, aggregateId: string, occurredAt?: Date, eventId?: string);
    abstract toPrimitives(): Record<string, any>;
}
