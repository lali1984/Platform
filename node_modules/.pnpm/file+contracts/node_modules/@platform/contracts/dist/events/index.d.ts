import type { BaseEvent, EventMetadata } from './base/base-event';
import { PlatformEvent, createEvent, validateEvent, isEventType } from './base/base-event';
import type { UserRegisteredEvent, UserRegisteredPayload } from './auth/user-registered.event';
import { UserRegisteredPlatformEvent, createUserRegisteredEvent } from './auth/user-registered.event';
import type { UserCreatedEvent, UserCreatedPayload } from './user/user-created.event';
import { createUserCreatedEvent, isUserCreatedEvent } from './user/user-created.event';
export type { BaseEvent, EventMetadata, UserRegisteredEvent, UserRegisteredPayload, UserCreatedEvent, UserCreatedPayload };
export { PlatformEvent, createEvent, validateEvent, isEventType, UserRegisteredPlatformEvent, createUserRegisteredEvent, createUserCreatedEvent, isUserCreatedEvent };
export declare function getEventType(event: BaseEvent): string;
export declare function getEventVersion(event: BaseEvent): string;
export declare function getEventTopic(event: BaseEvent): string;
export declare function getEventHeaders(event: BaseEvent): Record<string, string>;
export declare function validateEventOrThrow(event: any): asserts event is BaseEvent;
export declare function createPlatformEvent<T>(eventType: string, payload: T, options: {
    sourceService: string;
    aggregateId?: string;
    correlationId?: string;
    userId?: string;
    eventVersion?: string;
    metadata?: Omit<EventMetadata, 'sourceService' | 'correlationId' | 'userId'>;
}): BaseEvent<T>;
//# sourceMappingURL=index.d.ts.map