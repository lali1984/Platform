"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheAdapter = void 0;
// /02_bff-gateway/src/infrastructure/cache/redis-cache.adapter.ts
const ioredis_1 = __importDefault(require("ioredis"));
class RedisCacheAdapter {
    constructor(redisUrl) {
        this.client = new ioredis_1.default(redisUrl);
        this.client.on('error', (error) => {
            console.error('Redis connection error:', error);
        });
        this.client.on('connect', () => {
            console.log('Redis cache connected successfully');
        });
    }
    async get(key) {
        try {
            const value = await this.client.get(key);
            if (!value)
                return null;
            return JSON.parse(value);
        }
        catch (error) {
            console.error(`Redis get error for key "${key}":`, error);
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            const stringValue = JSON.stringify(value);
            if (ttl) {
                await this.client.setex(key, ttl, stringValue);
            }
            else {
                await this.client.set(key, stringValue);
            }
        }
        catch (error) {
            console.error(`Redis set error for key "${key}":`, error);
        }
    }
    async delete(key) {
        try {
            await this.client.del(key);
        }
        catch (error) {
            console.error(`Redis delete error for key "${key}":`, error);
        }
    }
    async deleteByPattern(pattern) {
        try {
            const stream = this.client.scanStream({
                match: pattern,
                count: 100
            });
            const pipeline = this.client.pipeline();
            let pendingDeletes = 0;
            stream.on('data', (keys) => {
                if (keys.length) {
                    keys.forEach(key => pipeline.del(key));
                    pendingDeletes += keys.length;
                }
            });
            stream.on('end', async () => {
                if (pendingDeletes > 0) {
                    await pipeline.exec();
                    console.log(`Deleted ${pendingDeletes} keys with pattern "${pattern}"`);
                }
            });
        }
        catch (error) {
            console.error(`Redis deleteByPattern error for pattern "${pattern}":`, error);
        }
    }
    async disconnect() {
        await this.client.quit();
    }
    async healthCheck() {
        try {
            await this.client.ping();
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.RedisCacheAdapter = RedisCacheAdapter;
//# sourceMappingURL=redis-cache.adapter.js.map