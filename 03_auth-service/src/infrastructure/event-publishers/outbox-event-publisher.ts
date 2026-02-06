import { DataSource, Repository } from 'typeorm';
import { OutboxEvent } from '../persistence/entities/outbox-event.entity';
import { BaseEvent } from '@platform/contracts';
import { EventPublisher } from '../../domain/ports/event-publisher.port';
import crypto from 'crypto';

export class OutboxEventPublisher implements EventPublisher {
  private outboxRepository: Repository<OutboxEvent>;

  constructor(private readonly dataSource: DataSource) {
    this.outboxRepository = dataSource.getRepository(OutboxEvent);
  }

  async publish(event: BaseEvent<any>): Promise<boolean> {
    try {
      await this.outboxRepository.save({
        id: crypto.randomUUID(),
        type: event.eventType,
        version: event.eventVersion,
        aggregateId: event.aggregateId || null,
        payload: event.payload,
        metadata: event.metadata,
        status: 'pending',
        attempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return true;
    } catch (error) {
      console.error('Failed to save event to outbox:', error);
      return false;
    }
  }

  async publishSync(event: BaseEvent<any>): Promise<void> {
    const result = await this.publish(event);
    if (!result) {
      throw new Error('Failed to publish event synchronously');
    }
  }

  isAvailable(): boolean {
    return true;
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}