import { BaseEvent, EventType } from '../../src/types/events';
export declare function createBaseEvent(type: EventType, source: string, correlationId?: string): BaseEvent;
export declare function validateEvent(event: any): boolean;
export declare function generateCorrelationId(): string;
//# sourceMappingURL=event.utils.d.ts.map