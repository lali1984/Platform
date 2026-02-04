import { BaseEvent } from '@platform/contracts';
import { EventPublisher } from '../../domain/ports/EventPublisher.port';
export declare class InMemoryEventPublisher implements EventPublisher {
    private events;
    publish(event: BaseEvent<any>): Promise<boolean>;
    publishSync(event: BaseEvent<any>): Promise<void>;
    isAvailable(): boolean;
    shutdown(): Promise<void>;
    getPublishedEvents(): BaseEvent<any>[];
}
