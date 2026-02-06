import { Repository, EntityManager, QueryRunner } from 'typeorm';
import { OutboxEventEntity } from '../persistence/entities/outbox-event';
import { EventPublisher, PlatformEvent } from '../../domain/ports/event-publisher.port';
export declare class OutboxEventPublisher implements EventPublisher {
    private readonly outboxRepository;
    private readonly logger;
    constructor(outboxRepository: Repository<OutboxEventEntity>);
    publish(event: PlatformEvent): Promise<void>;
    publishAll(events: PlatformEvent[]): Promise<void>;
    publishInTransaction(event: PlatformEvent, queryRunner: QueryRunner | EntityManager): Promise<void>;
    publishAllInTransaction(events: PlatformEvent[], queryRunner: QueryRunner | EntityManager): Promise<void>;
    private _getRepository;
    private _saveEvent;
    private _saveEvents;
    isAvailable(): boolean;
    shutdown(): Promise<void>;
}
