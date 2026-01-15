import jwt, { SignOptions } from 'jsonwebtoken';
import { createClient, RedisClientType } from 'redis';

export interface TokenPayload {
  userId: string;
  email: string;
  isTwoFactorEnabled: boolean;
  isTwoFactorAuthenticated?: boolean;
}

export class TokenService {
  private redisClient: RedisClientType;
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
    
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379'
    });
  }

  generateAccessToken(payload: TokenPayload): string {
    // ФИКС: Приводим expiresIn к правильному типу
    const options: SignOptions = {
      expiresIn: this.parseExpiresIn(this.accessExpiresIn) as any,
      algorithm: 'HS256'
    };

    return jwt.sign(
      { 
        userId: payload.userId,
        email: payload.email,
        isTwoFactorEnabled: payload.isTwoFactorEnabled,
        isTwoFactorAuthenticated: payload.isTwoFactorAuthenticated || false
      },
      this.accessSecret,
      options
    );
  }

  generateRefreshToken(payload: TokenPayload): string {
    // ФИКС: Приводим expiresIn к правильному типу
    const options: SignOptions = {
      expiresIn: this.parseExpiresIn(this.refreshExpiresIn) as any,
      algorithm: 'HS256'
    };

    const refreshToken = jwt.sign(
      { 
        userId: payload.userId,
        email: payload.email,
        isTwoFactorEnabled: payload.isTwoFactorEnabled
      },
      this.refreshSecret,
      options
    );

    // Сохраняем в Redis
    const key = `refresh_token:${payload.userId}:${refreshToken}`;
    const ttl = 7 * 24 * 60 * 60; // 7 дней
    
    this.redisClient.setEx(key, ttl, 'valid');
    
    return refreshToken;
  }

  // ВАЖНО: Метод для парсинга expiresIn
  private parseExpiresIn(expiresIn: string): string | number {
    // Если это число в строке "3600", конвертируем в число
    if (/^\d+$/.test(expiresIn)) {
      return parseInt(expiresIn, 10);
    }
    
    // Если это строка формата "15m", "1h", "7d" - оставляем как есть
    return expiresIn;
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.accessSecret) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
        isTwoFactorEnabled: decoded.isTwoFactorEnabled,
        isTwoFactorAuthenticated: decoded.isTwoFactorAuthenticated
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
        isTwoFactorEnabled: decoded.isTwoFactorEnabled
      };
    } catch {
      return null;
    }
  }

  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const key = `refresh_token:${userId}:${token}`;
    const value = await this.redisClient.get(key);
    return value === 'valid';
  }

  async connect(): Promise<void> {
    await this.redisClient.connect();
  }

  async disconnect(): Promise<void> {
    await this.redisClient.quit();
  }
}