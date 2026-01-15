import { createClient, RedisClientType } from 'redis';
import { PlatformEvent, EventPublisher } from '../types/events';
import { validateEvent } from '../utils/event.utils';

export class RedisEventPublisher implements EventPublisher {
  private client: RedisClientType;
  private isConnected = false;
  private channel = 'platform-events';

  constructor(redisUrl: string = 'redis://localhost:6379') {
    this.client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.client.on('connect', () => {
      console.log('Redis Event Publisher connected');
      this.isConnected = true;
    });

    this.client.on('error', (err: any) => {
      console.error('Redis Event Publisher error:', err);
    });

    this.client.on('end', () => {
      console.log('Redis Event Publisher disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error: any) {
        console.error('Failed to connect to Redis:', error);
        throw error;
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  async publish(event: PlatformEvent): Promise<void> {
    if (!validateEvent(event)) {
      throw new Error('Invalid event format');
    }

    if (!this.isConnected) {
      try {
        await this.connect();
      } catch (error: any) {
        console.error('Cannot publish event, Redis not connected:', error);
        return; // Не выбрасываем ошибку, чтобы не ломать основной поток
      }
    }

    try {
      // Публикуем в общий канал
      await this.client.publish(this.channel, JSON.stringify(event));
      
      // Также сохраняем в stream для persistence
      await this.client.xAdd('event-stream', '*', event as any);
      
      console.log(`Event ${event.type} published to Redis`);
    } catch (error: any) {
      console.error('Failed to publish event:', error);
      // Не выбрасываем ошибку, чтобы не ломать основной поток
    }
  }

  async getStatus(): Promise<{
    connected: boolean;
    redisStatus: string;
  }> {
    try {
      if (!this.isConnected) {
        return { connected: false, redisStatus: 'disconnected' };
      }
      
      await this.client.ping();
      return { connected: true, redisStatus: 'healthy' };
    } catch (error: any) {
      return { connected: false, redisStatus: 'error' };
    }
  }
}

// Singleton instance
let instance: RedisEventPublisher | null = null;

export function getRedisEventPublisher(redisUrl?: string): RedisEventPublisher {
  if (!instance) {
    instance = new RedisEventPublisher(redisUrl);
  }
  return instance;
}

export default getRedisEventPublisher();
