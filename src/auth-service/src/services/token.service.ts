import jwt, { SignOptions } from 'jsonwebtoken';
import { createClient, RedisClientType } from 'redis';

export interface TokenPayload {
  userId: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isTwoFactorEnabled: boolean;
  isTwoFactorAuthenticated: boolean;
}

export class TokenService {
  // Делаем redisClient публичным через геттер
  private _redisClient: RedisClientType;
  
  public get redisClient(): RedisClientType {
    return this._redisClient;
  }
  
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets are not configured');
    }
    
    this.accessSecret = accessSecret;
    this.refreshSecret = refreshSecret;
    
    this.accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    
    this._redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379'
    });
  }

  generateAccessToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.parseExpiresIn(this.accessExpiresIn) as any,
      algorithm: 'HS256'
    };

    return jwt.sign(
      { 
        userId: payload.userId,
        email: payload.email,
        username: payload.username,
        firstName: payload.firstName,
        lastName: payload.lastName,
        isTwoFactorEnabled: payload.isTwoFactorEnabled,
        isTwoFactorAuthenticated: payload.isTwoFactorAuthenticated || false
      },
      this.accessSecret,
      options
    );
  }

  generateRefreshToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.parseExpiresIn(this.refreshExpiresIn) as any,
      algorithm: 'HS256'
    };

    const refreshToken = jwt.sign(
      { 
        userId: payload.userId,
        email: payload.email,
        username: payload.username,
        firstName: payload.firstName,
        lastName: payload.lastName,
        isTwoFactorEnabled: payload.isTwoFactorEnabled
      },
      this.refreshSecret,
      options
    );

    // Сохраняем в Redis
    const key = `refresh_token:${payload.userId}:${refreshToken}`;
    const ttl = 7 * 24 * 60 * 60; // 7 дней
    
    // Проверяем подключение перед использованием
    if (this._redisClient.isOpen) {
      this._redisClient.setEx(key, ttl, 'valid');
    } else {
      console.warn('Redis not connected, refresh token not stored');
    }
    
    return refreshToken;
  }

  // ВАЖНО: Метод для парсинга expiresIn
  private parseExpiresIn(expiresIn: string): string | number {
    if (/^\d+$/.test(expiresIn)) {
      return parseInt(expiresIn, 10);
    }
    
    return expiresIn;
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.accessSecret) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
        username: decoded.username,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        isTwoFactorEnabled: decoded.isTwoFactorEnabled,
        isTwoFactorAuthenticated: decoded.isTwoFactorAuthenticated || false
      };
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.refreshSecret) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
        username: decoded.username,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        isTwoFactorEnabled: decoded.isTwoFactorEnabled,
        isTwoFactorAuthenticated: false // В refresh токене всегда false
      };
    } catch {
      return null;
    }
  }

  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    if (!this._redisClient.isOpen) {
      await this.connect();
    }
    
    const key = `refresh_token:${userId}:${token}`;
    const value = await this._redisClient.get(key);
    return value === 'valid';
  }

  // Алиас для совместимости с auth.controller.ts
  async saveRefreshToken(userId: string, token: string): Promise<void> {
    const key = `refresh_token:${userId}:${token}`;
    const ttl = 7 * 24 * 60 * 60; // 7 дней
    
    if (!this._redisClient.isOpen) {
      await this.connect();
    }
    
    await this._redisClient.setEx(key, ttl, 'valid');
  }

  // Алиас для совместимости
  async deleteRefreshToken(userId: string, token: string): Promise<void> {
    await this.invalidateRefreshToken(userId, token);
  }

  async invalidateRefreshToken(userId: string, token: string): Promise<void> {
    if (!this._redisClient.isOpen) {
      await this.connect();
    }
    
    const key = `refresh_token:${userId}:${token}`;
    await this._redisClient.del(key);
  }

  async invalidateAllUserRefreshTokens(userId: string): Promise<void> {
    if (!this._redisClient.isOpen) {
      await this.connect();
    }
    
    const pattern = `refresh_token:${userId}:*`;
    const keys = await this._redisClient.keys(pattern);
    
    if (keys.length > 0) {
      await this._redisClient.del(keys);
    }
  }

  async connect(): Promise<void> {
    if (!this._redisClient.isOpen) {
      await this._redisClient.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this._redisClient.isOpen) {
      await this._redisClient.quit();
    }
  }

  // Добавляем метод для проверки подключения
  async isConnected(): Promise<boolean> {
    try {
      if (!this._redisClient.isOpen) {
        await this.connect();
      }
      await this._redisClient.ping();
      return true;
    } catch {
      return false;
    }
  }

  // Методы для черного списка access токенов
  async blacklistAccessToken(token: string, payload: TokenPayload): Promise<void> {
    if (!this._redisClient.isOpen) {
      await this.connect();
    }
    
    const key = `blacklist:access_token:${token}`;
    const ttl = 15 * 60; // 15 минут (время жизни access токена)
    
    await this._redisClient.setEx(key, ttl, JSON.stringify(payload));
  }

  async isAccessTokenBlacklisted(token: string): Promise<boolean> {
    if (!this._redisClient.isOpen) {
      await this.connect();
    }
    
    const key = `blacklist:access_token:${token}`;
    const result = await this._redisClient.get(key);
    return result !== null;
  }
}

// Экспортируем синглтон для удобства использования
export default new TokenService();