import { Entity } from './entity.base';
export declare abstract class AggregateRoot<T> extends Entity<T> {
    private domainEvents;
    getDomainEvents(): any[];
    addDomainEvent(event: any): void;
    clearDomainEvents(): void;
    get events(): any[];
    protected addEvent(event: any): void;
    clearEvents(): void;
    protected applyEvent(event: any): void;
    protected validateInvariants(): void;
    protected canPerformOperation(operation: string): boolean;
    protected snapshot(): void;
}
