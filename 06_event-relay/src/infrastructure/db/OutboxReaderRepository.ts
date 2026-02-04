// 06_event-relay/src/infrastructure/db/OutboxReaderRepository.ts
import { DataSource, Repository } from 'typeorm';
import { ServiceDatabaseConfig } from './DatabaseConfig';

export interface OutboxEvent {
  id: string;
  type: string;
  payload: any;
  metadata?: any;
  status: 'pending' | 'processing' | 'published' | 'failed' | 'completed';
  attempts: number;
  lastAttemptAt?: Date;
  errorMessage?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class OutboxReaderRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly serviceConfig: ServiceDatabaseConfig
  ) {}

  public async getPendingEvents(limit: number = 100): Promise<OutboxEvent[]> {
    try {
      const query = `
        SELECT 
          id,
          type,
          payload,
          metadata,
          status,
          attempts,
          created_at as "createdAt",
          processed_at as "processedAt",
          last_attempt_at as "lastAttemptAt",
          COALESCE(error_message, error) as "errorMessage"
        FROM outbox_events
        WHERE status IN ('pending', 'failed')
        ORDER BY created_at ASC
        LIMIT $1
      `;
      
      const events = await this.dataSource.query(query, [limit]);
      
      return events.map((event: any) => ({
        id: event.id,
        type: event.type,
        payload: event.payload,
        metadata: event.metadata,
        status: event.status,
        attempts: event.attempts || 0,
        lastAttemptAt: event.lastAttemptAt,
        errorMessage: event.errorMessage,
        processedAt: event.processedAt,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt || new Date(),
      }));
    } catch (error) {
      console.error(`Error reading pending events from ${this.serviceConfig.name}:`, error);
      return [];
    }
  }

  public async markAsProcessing(eventId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE outbox_events
        SET 
          status = 'processing',
          last_attempt_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
      `;
      
      await this.dataSource.query(query, [eventId]);
      return true;
    } catch (error) {
      console.error(`Error marking event as processing:`, error);
      return false;
    }
  }

  public async markAsPublished(eventId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE outbox_events
        SET 
          status = 'published',
          processed_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
      `;
      
      await this.dataSource.query(query, [eventId]);
      return true;
    } catch (error) {
      console.error(`Error marking event as published:`, error);
      return false;
    }
  }

  public async markAsCompleted(eventId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE outbox_events
        SET 
          status = 'completed',
          processed_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
      `;
      
      await this.dataSource.query(query, [eventId]);
      return true;
    } catch (error) {
      console.error(`Error marking event as completed:`, error);
      return false;
    }
  }

  public async markAsFailed(eventId: string, errorMessage: string): Promise<boolean> {
    try {
      const query = `
        UPDATE outbox_events
        SET 
          status = 'failed',
          error_message = $2,
          attempts = attempts + 1,
          last_attempt_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
      `;
      
      await this.dataSource.query(query, [eventId, errorMessage]);
      return true;
    } catch (error) {
      console.error(`Error marking event as failed:`, error);
      return false;
    }
  }

  public async incrementAttempts(eventId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE outbox_events
        SET 
          attempts = attempts + 1,
          last_attempt_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
      `;
      
      await this.dataSource.query(query, [eventId]);
      return true;
    } catch (error) {
      console.error(`Error incrementing attempts:`, error);
      return false;
    }
  }

  public async cleanupOldEvents(daysToKeep: number = 30): Promise<number> {
    try {
      const query = `
        DELETE FROM outbox_events
        WHERE status IN ('published', 'completed')
          AND created_at < NOW() - INTERVAL '${daysToKeep} days'
      `;
      
      const result = await this.dataSource.query(query);
      return result.rowCount || 0;
    } catch (error) {
      console.error(`Error cleaning up old events:`, error);
      return 0;
    }
  }
}

export type OutboxReaderRepositoryFactory = (
  dataSource: DataSource,
  serviceConfig: ServiceDatabaseConfig
) => OutboxReaderRepository;

export const createOutboxReaderRepository: OutboxReaderRepositoryFactory = (
  dataSource,
  serviceConfig
) => new OutboxReaderRepository(dataSource, serviceConfig);