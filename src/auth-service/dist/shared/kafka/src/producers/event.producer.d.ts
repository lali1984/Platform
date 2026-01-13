import { PlatformEvent } from '../types/events';
export declare class EventProducer {
    private static instance;
    private isConnected;
    private constructor();
    static getInstance(): EventProducer;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendEvent(event: PlatformEvent): Promise<void>;
    private getTopicFromEventType;
}
declare const _default: EventProducer;
export default _default;
//# sourceMappingURL=event.producer.d.ts.map