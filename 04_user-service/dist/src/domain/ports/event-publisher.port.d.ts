export interface EventPublisher {
    publish(event: PlatformEvent): Promise<void>;
    publishAll(events: PlatformEvent[]): Promise<void>;
    isAvailable(): boolean;
    shutdown(): Promise<void>;
}
export interface PlatformEvent {
    eventId: string;
    type: string;
    version: string;
    timestamp: Date;
    data: any;
    correlationId?: string;
    source: string;
    metadata?: Record<string, any>;
    toJSON(): string;
    getPartitionKey(): string;
}
export declare abstract class BasePlatformEvent implements PlatformEvent {
    eventId: string;
    type: string;
    version: string;
    timestamp: Date;
    data: any;
    correlationId?: string;
    source: string;
    metadata?: Record<string, any>;
    constructor(type: string, data: any, options?: {
        eventId?: string;
        version?: string;
        timestamp?: Date;
        correlationId?: string;
        source?: string;
        metadata?: Record<string, any>;
    });
    private generateEventId;
    toJSON(): string;
    getPartitionKey(): string;
    withData(newData: any): this;
    withMetadata(newMetadata: Record<string, any>): this;
}
export declare class EventUtils {
    static isPlatformEvent(event: any): event is PlatformEvent;
    static fromJSON(json: string): PlatformEvent;
    static validate(event: PlatformEvent): string[];
    static createUserEvent(type: string, userData: any, options?: {
        eventId?: string;
        correlationId?: string;
        metadata?: Record<string, any>;
    }): PlatformEvent;
}
