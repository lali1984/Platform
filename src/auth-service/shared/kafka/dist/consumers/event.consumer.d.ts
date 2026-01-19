import { EventType, PlatformEvent } from '../types/events';
export interface EventHandler {
    eventType: EventType;
    handle: (event: PlatformEvent) => Promise<void>;
}
export declare class EventConsumer {
    private consumer;
    private handlers;
    private isRunning;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    registerHandler(handler: EventHandler): void;
    start(): Promise<void>;
    stop(): Promise<void>;
}
declare const _default: EventConsumer;
export default _default;
//# sourceMappingURL=event.consumer.d.ts.map