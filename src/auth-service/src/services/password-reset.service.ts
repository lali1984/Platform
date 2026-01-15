// src/services/password-reset.service.ts
import { createClient, RedisClientType } from 'redis';
import crypto from 'crypto';

export class PasswordResetService {
  private redisClient: RedisClientType;

  constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379'
    });
    this.redisClient.connect();
  }

  async generateResetToken(userId: string, email: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const key = `password_reset:${token}`;
    
    await this.redisClient.setEx(key, 3600, JSON.stringify({ // 1 hour
      userId,
      email,
      createdAt: new Date().toISOString()
    }));
    
    return token;
  }

  async validateResetToken(token: string): Promise<{ userId: string; email: string } | null> {
    const key = `password_reset:${token}`;
    const data = await this.redisClient.get(key);
    
    if (!data) return null;
    
    return JSON.parse(data);
  }

  async invalidateResetToken(token: string): Promise<void> {
    const key = `password_reset:${token}`;
    await this.redisClient.del(key);
  }
}