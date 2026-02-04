import { ICache } from '../../domain/ports/cache.port';
export declare class RedisCacheAdapter implements ICache {
    private client;
    constructor(redisUrl: string);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    deleteByPattern(pattern: string): Promise<void>;
    disconnect(): Promise<void>;
    healthCheck(): Promise<boolean>;
}
