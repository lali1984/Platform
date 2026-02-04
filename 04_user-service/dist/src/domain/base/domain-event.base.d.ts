export declare abstract class DomainEvent {
    readonly eventId: string;
    readonly eventName: string;
    readonly aggregateId: string;
    readonly occurredAt: Date;
    readonly metadata?: Record<string, any>;
    constructor(eventName: string, aggregateId: string, occurredAt?: Date, metadata?: Record<string, any>);
    private generateEventId;
    abstract toPrimitives(): Record<string, any>;
    toJSON(): string;
    getEventType(): string;
    getEventVersion(): string;
    withMetadata(metadata: Record<string, any>): this;
    isEventType(eventType: string): boolean;
    equals(event?: DomainEvent): boolean;
    getAge(): number;
    isFresh(minutes?: number): boolean;
}
export declare abstract class UserDomainEvent extends DomainEvent {
    readonly userId: string;
    constructor(eventName: string, aggregateId: string, userId: string, occurredAt?: Date, metadata?: Record<string, any>);
    toPrimitives(): Record<string, any>;
}
export declare class EventUtils {
    static isValidEvent(event: any): event is DomainEvent;
    static fromPrimitives<T extends DomainEvent>(primitives: Record<string, any>, EventClass: new (...args: any[]) => T): T;
    static groupByType(events: DomainEvent[]): Record<string, DomainEvent[]>;
    static filterByType(events: DomainEvent[], eventType: string): DomainEvent[];
    static sortByOccurredAt(events: DomainEvent[], ascending?: boolean): DomainEvent[];
}
