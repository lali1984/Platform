import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, QueryRunner } from 'typeorm';
import { OutboxEventEntity } from '../persistence/entities/outbox-event';
import { EventPublisher, PlatformEvent } from '../../domain/ports/event-publisher.port';
import { Logger } from '@nestjs/common';

@Injectable()
export class OutboxEventPublisher implements EventPublisher {
  private readonly logger = new Logger(OutboxEventPublisher.name);

  constructor(
    @InjectRepository(OutboxEventEntity)
    private readonly outboxRepository: Repository<OutboxEventEntity>,
  ) {}

  /**
   * Публикует событие в outbox (не в транзакции)
   */
  async publish(event: PlatformEvent): Promise<void> {
    await this._saveEvent(event, this.outboxRepository);
  }

  /**
   * Публикует несколько событий в outbox (не в транзакции)
   */
  async publishAll(events: PlatformEvent[]): Promise<void> {
    await this._saveEvents(events, this.outboxRepository);
  }

  /**
   * Публикует событие в outbox в рамках существующей транзакции
   */
  async publishInTransaction(
    event: PlatformEvent,
    queryRunner: QueryRunner | EntityManager,
  ): Promise<void> {
    const repository = this._getRepository(queryRunner);
    await this._saveEvent(event, repository);
  }

  /**
   * Публикует несколько событий в outbox в рамках существующей транзакции
   */
  async publishAllInTransaction(
    events: PlatformEvent[],
    queryRunner: QueryRunner | EntityManager,
  ): Promise<void> {
    const repository = this._getRepository(queryRunner);
    await this._saveEvents(events, repository);
  }

  /**
   * Возвращает репозиторий для работы с транзакциями
   */
  private _getRepository(
    queryRunner?: QueryRunner | EntityManager,
  ): Repository<OutboxEventEntity> {
    if (!queryRunner) {
      return this.outboxRepository;
    }
    return 'getRepository' in queryRunner
      ? queryRunner.getRepository(OutboxEventEntity)
      : queryRunner.manager.getRepository(OutboxEventEntity);
  }

  /**
   * Сохраняет одиночное событие в outbox
   */
  private async _saveEvent(
    event: PlatformEvent,
    repository: Repository<OutboxEventEntity>,
  ): Promise<void> {
    try {
      // ✅ Валидация обязательных полей
      if (!event.type || !event.data) {
        throw new Error('PlatformEvent must have "type" and "data" fields');
      }

      const outboxEvent = repository.create({
        type: event.type,
        payload: event.data,
        metadata: {
          eventId: event.eventId,
          version: event.version,
          timestamp: event.timestamp instanceof Date 
            ? event.timestamp.toISOString() 
            : event.timestamp,
          correlationId: event.correlationId,
          source: event.source,
          ...event.metadata,
        },
        status: 'pending',
        attempts: 0,
        createdAt: new Date(),
      });

      await repository.save(outboxEvent);
      
      this.logger.debug(
        `📝 Event saved to outbox: ${event.type} (ID: ${outboxEvent.id}, Event ID: ${event.eventId})`
      );

    } catch (error) {
      this.logger.error(
        `❌ Failed to save event to outbox: ${event.type}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error;
    }
  }

  /**
   * Сохраняет несколько событий в outbox
   */
  private async _saveEvents(
    events: PlatformEvent[],
    repository: Repository<OutboxEventEntity>,
  ): Promise<void> {
    try {
      // ✅ Валидация всех событий
      for (const event of events) {
        if (!event.type || !event.data) {
          throw new Error(`PlatformEvent must have "type" and "data" fields. Event ID: ${event.eventId}`);
        }
      }

      const outboxEvents = events.map(event =>
        repository.create({
          type: event.type,
          payload: event.data,
          metadata: {
            eventId: event.eventId,
            version: event.version,
            timestamp: event.timestamp instanceof Date 
              ? event.timestamp.toISOString() 
              : event.timestamp,
            correlationId: event.correlationId,
            source: event.source,
            ...event.metadata,
          },
          status: 'pending',
          attempts: 0,
          createdAt: new Date(),
        }),
      );

      await repository.save(outboxEvents);
      
      this.logger.debug(
        `📝 ${outboxEvents.length} events saved to outbox`
      );

    } catch (error) {
      this.logger.error(
        `❌ Failed to save events to outbox`,
        error instanceof Error ? error.stack : undefined
      );
      throw error;
    }
  }

  /**
   * Проверяет доступность публикатора
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.log('✅ OutboxEventPublisher shutdown complete');
  }
}