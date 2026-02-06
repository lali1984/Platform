// /02_bff-gateway/src/infrastructure/cache/redis-cache.adapter.ts
import Redis from 'ioredis';
import { ICache } from '../../domain/ports/cache.port';

export class RedisCacheAdapter implements ICache {
  private client: Redis;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl);
    
    this.client.on('error', (error) => {
      console.error('Redis connection error:', error);
    });
    
    this.client.on('connect', () => {
      console.log('Redis cache connected successfully');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Redis get error for key "${key}":`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      
      if (ttl) {
        await this.client.setex(key, ttl, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
    } catch (error) {
      console.error(`Redis set error for key "${key}":`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Redis delete error for key "${key}":`, error);
    }
  }

  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const stream = this.client.scanStream({
        match: pattern,
        count: 100
      });

      const pipeline = this.client.pipeline();
      let pendingDeletes = 0;

      stream.on('data', (keys: string[]) => {
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
    } catch (error) {
      console.error(`Redis deleteByPattern error for pattern "${pattern}":`, error);
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }
}