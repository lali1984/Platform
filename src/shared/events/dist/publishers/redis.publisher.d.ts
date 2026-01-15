import { PlatformEvent, EventPublisher } from '../../src/types/events';
export declare class RedisEventPublisher implements EventPublisher {
    private client;
    private isConnected;
    private channel;
    constructor(redisUrl?: string);
    private setupEventListeners;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    publish(event: PlatformEvent): Promise<void>;
    getStatus(): Promise<{
        connected: boolean;
        redisStatus: string;
    }>;
}
export declare function getRedisEventPublisher(redisUrl?: string): RedisEventPublisher;
declare const _default: RedisEventPublisher;
export default _default;
//# sourceMappingURL=redis.publisher.d.ts.map