export declare abstract class Entity<T> {
    protected readonly props: T;
    constructor(props: T);
    equals(object?: Entity<T>): boolean;
    protected abstract getId(): string;
    getProps(): T;
    clone(newProps: Partial<T>): this;
}
export declare abstract class ValueObject {
    equals(vo?: ValueObject): boolean;
    toString(): string;
    abstract getValue(): any;
}
export declare abstract class DomainEvent {
    readonly timestamp: Date;
    readonly metadata: Record<string, any>;
    constructor(metadata?: Record<string, any>);
    abstract getEventType(): string;
    abstract getEventVersion(): string;
    toJSON(): string;
}
