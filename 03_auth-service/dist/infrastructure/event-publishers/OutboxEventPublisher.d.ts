import { DataSource } from 'typeorm';
import { BaseEvent } from '@platform/contracts';
import { EventPublisher } from '../../domain/ports/EventPublisher.port';
export declare class OutboxEventPublisher implements EventPublisher {
    private readonly dataSource;
    private outboxRepository;
    constructor(dataSource: DataSource);
    publish(event: BaseEvent<any>): Promise<boolean>;
    publishSync(event: BaseEvent<any>): Promise<void>;
    isAvailable(): boolean;
    shutdown(): Promise<void>;
}
