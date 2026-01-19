import { PlatformEvent, EventType } from '../types/events';
export declare class EventProducer {
    private static instance;
    private isConnected;
    private connectionPromise;
    private constructor();
    static getInstance(): EventProducer;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendEvent(event: PlatformEvent): Promise<void>;
    createBaseEvent(type: EventType, source: string, data: any): PlatformEvent;
    getStatus(): {
        isConnected: boolean;
    };
}
declare const _default: EventProducer;
export default _default;
//# sourceMappingURL=event.producer.d.ts.map