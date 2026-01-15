// src/services/session.service.ts
import { createClient, RedisClientType } from 'redis';

interface Session {
  id: string;
  userId: string;
  userAgent: string;
  ipAddress: string;
  createdAt: Date;
  lastActiveAt: Date;
  isCurrent: boolean;
}

export class SessionService {
  private redisClient: RedisClientType;

  constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379'
    });
    this.redisClient.connect();
  }

  async createSession(userId: string, userAgent: string, ipAddress: string): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: Session = {
      id: sessionId,
      userId,
      userAgent,
      ipAddress,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      isCurrent: true
    };

    const key = `user_sessions:${userId}`;
    await this.redisClient.hSet(key, sessionId, JSON.stringify(session));
    await this.redisClient.expire(key, 30 * 24 * 60 * 60); // 30 days

    return sessionId;
  }

  async getSessions(userId: string): Promise<Session[]> {
    const key = `user_sessions:${userId}`;
    const sessions = await this.redisClient.hGetAll(key);
    
    return Object.values(sessions).map(s => JSON.parse(s));
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const key = `user_sessions:${userId}`;
    await this.redisClient.hDel(key, sessionId);
  }

  async revokeAllSessions(userId: string, excludeSessionId?: string): Promise<void> {
    const key = `user_sessions:${userId}`;
    const sessions = await this.redisClient.hGetAll(key);
    
    for (const [sessionId] of Object.entries(sessions)) {
      if (sessionId !== excludeSessionId) {
        await this.redisClient.hDel(key, sessionId);
      }
    }
  }
}