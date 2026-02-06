import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { TokenService, TokenPayload, TokenPair } from '../../domain/ports/token-service.port';

export class JwtTokenService implements TokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;
  private readonly redisClient: Redis;

  constructor() {
    // 🔴 ИСПРАВЛЕНО: Добавлена валидация и обработка undefined
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'access-secret-key-change-in-production';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production';
    
    // 🔴 КРИТИЧНАЯ ВАЛИДАЦИЯ СЕКРЕТОВ
    if (!this.accessTokenSecret || this.accessTokenSecret.includes('change-in-production')) {
      throw new Error('CRITICAL: JWT_ACCESS_SECRET must be set in production environment');
    }
    
    if (!this.refreshTokenSecret || this.refreshTokenSecret.includes('change-in-production')) {
      throw new Error('CRITICAL: JWT_REFRESH_SECRET must be set in production environment');
    }

    this.accessTokenExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    this.refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    // Инициализация Redis
    const redisUrl = process.env.REDIS_URL || 'redis://:secret@redis:6379';
    this.redisClient = new Redis(redisUrl, {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
    });

    this.redisClient.on('error', (error) => {
      console.error('Redis connection error in JwtTokenService:', error);
    });

    this.redisClient.on('connect', () => {
      console.log('✅ JwtTokenService connected to Redis');
    });
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiresIn,
      issuer: 'auth-service',
      audience: 'platform-ecosystem',
    } as any);
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiresIn,
      issuer: 'auth-service',
      audience: 'platform-ecosystem',
    } as any);
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'auth-service',
        audience: 'platform-ecosystem',
      }) as TokenPayload;
      return payload;
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'auth-service',
        audience: 'platform-ecosystem',
      }) as TokenPayload;
      return payload;
    } catch (error) {
      return null;
    }
  }

  private getRefreshTokenKey(userId: string, refreshToken: string): string {
    const tokenHash = Buffer.from(refreshToken).toString('base64').slice(0, 32);
    return `refresh_token:${userId}:${tokenHash}`;
  }

  private getUserTokensKey(userId: string): string {
    return `user_tokens:${userId}`;
  }

  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const key = this.getRefreshTokenKey(userId, refreshToken);
    const ttl = this.parseExpiresIn(this.refreshTokenExpiresIn);
    await this.redisClient.setex(key, ttl, 'valid');

    const userTokensKey = this.getUserTokensKey(userId);
    await this.redisClient.sadd(userTokensKey, key);
    await this.redisClient.expire(userTokensKey, ttl);
  }

  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const payload = this.verifyRefreshToken(refreshToken);
    if (!payload) return false;
    const key = this.getRefreshTokenKey(userId, refreshToken);
    const exists = await this.redisClient.exists(key);
    return exists === 1;
  }

  async deleteRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const key = this.getRefreshTokenKey(userId, refreshToken);
    await this.redisClient.del(key);
    const userTokensKey = this.getUserTokensKey(userId);
    await this.redisClient.srem(userTokensKey, key);
  }

  async deleteAllRefreshTokens(userId: string): Promise<void> {
    const userTokensKey = this.getUserTokensKey(userId);
    const tokenKeys = await this.redisClient.smembers(userTokensKey);
    if (tokenKeys.length > 0) {
      const pipeline = this.redisClient.pipeline();
      tokenKeys.forEach(key => pipeline.del(key));
      pipeline.del(userTokensKey);
      await pipeline.exec();
    }
  }

  generateTokenPair(payload: TokenPayload): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    const expiresIn = this.parseExpiresIn(this.accessTokenExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60;
    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: return 15 * 60;
    }
  }

  async disconnect(): Promise<void> {
    await this.redisClient.quit();
  }
}