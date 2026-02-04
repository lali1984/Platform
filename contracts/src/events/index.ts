
// Главный файл экспорта событий

// Импортируем типы и функции
import type { BaseEvent, EventMetadata } from './base/base-event';
import { PlatformEvent, createEvent, validateEvent, isEventType } from './base/base-event';

// Импортируем конкретные события
import type { UserRegisteredEvent, UserRegisteredPayload } from './auth/user-registered.event';
import { UserRegisteredPlatformEvent, createUserRegisteredEvent } from './auth/user-registered.event';

import type { UserCreatedEvent, UserCreatedPayload } from './user/user-created.event';
import { createUserCreatedEvent, isUserCreatedEvent } from './user/user-created.event';

// Экспортируем типы
export type { BaseEvent, EventMetadata, UserRegisteredEvent, UserRegisteredPayload, UserCreatedEvent, UserCreatedPayload };

// Экспортируем функции
export { 
  PlatformEvent, 
  createEvent, 
  validateEvent, 
  isEventType,
  UserRegisteredPlatformEvent,
  createUserRegisteredEvent,
  createUserCreatedEvent,
  isUserCreatedEvent
};

// Утилиты
export function getEventType(event: BaseEvent): string {
  return event.eventType;
}

export function getEventVersion(event: BaseEvent): string {
  return event.eventVersion;
}

export function getEventTopic(event: BaseEvent): string {
  const service = event.metadata?.sourceService || 'unknown';
  const eventType = event.eventType.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${service}.${eventType}.v${event.eventVersion.split('.')[0]}`;
}

export function getEventHeaders(event: BaseEvent): Record<string, string> {
  return {
    'event-id': event.eventId,
    'event-type': event.eventType,
    'event-version': event.eventVersion,
    'timestamp': event.timestamp,
    'aggregate-id': event.aggregateId || '',
    'source-service': event.metadata?.sourceService || 'unknown',
    'correlation-id': event.metadata?.correlationId || '',
  };
}

export function validateEventOrThrow(event: any): asserts event is BaseEvent {
  if (!validateEvent(event)) {
    throw new Error(`Invalid event: ${JSON.stringify(event)}`);
  }
}

export function createPlatformEvent<T>(
  eventType: string,
  payload: T,
  options: {
    sourceService: string;
    aggregateId?: string;
    correlationId?: string;
    userId?: string;
    eventVersion?: string;
    metadata?: Omit<EventMetadata, 'sourceService' | 'correlationId' | 'userId'>;
  }
): BaseEvent<T> {
  return createEvent(
    eventType,
    options.eventVersion || '1.0.0',
    payload,
    {
      aggregateId: options.aggregateId,
      metadata: {
        sourceService: options.sourceService,
        correlationId: options.correlationId,
        userId: options.userId,
        ...options.metadata,
      },
    }
  );
}
