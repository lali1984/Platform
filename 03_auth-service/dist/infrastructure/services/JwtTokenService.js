"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtTokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ioredis_1 = __importDefault(require("ioredis"));
class JwtTokenService {
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
        this.redisClient = new ioredis_1.default(redisUrl, {
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
    generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.accessTokenSecret, {
            expiresIn: this.accessTokenExpiresIn,
            issuer: 'auth-service',
            audience: 'platform-ecosystem',
        });
    }
    generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.refreshTokenSecret, {
            expiresIn: this.refreshTokenExpiresIn,
            issuer: 'auth-service',
            audience: 'platform-ecosystem',
        });
    }
    verifyAccessToken(token) {
        try {
            const payload = jsonwebtoken_1.default.verify(token, this.accessTokenSecret, {
                issuer: 'auth-service',
                audience: 'platform-ecosystem',
            });
            return payload;
        }
        catch (error) {
            return null;
        }
    }
    verifyRefreshToken(token) {
        try {
            const payload = jsonwebtoken_1.default.verify(token, this.refreshTokenSecret, {
                issuer: 'auth-service',
                audience: 'platform-ecosystem',
            });
            return payload;
        }
        catch (error) {
            return null;
        }
    }
    getRefreshTokenKey(userId, refreshToken) {
        const tokenHash = Buffer.from(refreshToken).toString('base64').slice(0, 32);
        return `refresh_token:${userId}:${tokenHash}`;
    }
    getUserTokensKey(userId) {
        return `user_tokens:${userId}`;
    }
    async saveRefreshToken(userId, refreshToken) {
        const key = this.getRefreshTokenKey(userId, refreshToken);
        const ttl = this.parseExpiresIn(this.refreshTokenExpiresIn);
        await this.redisClient.setex(key, ttl, 'valid');
        const userTokensKey = this.getUserTokensKey(userId);
        await this.redisClient.sadd(userTokensKey, key);
        await this.redisClient.expire(userTokensKey, ttl);
    }
    async validateRefreshToken(userId, refreshToken) {
        const payload = this.verifyRefreshToken(refreshToken);
        if (!payload)
            return false;
        const key = this.getRefreshTokenKey(userId, refreshToken);
        const exists = await this.redisClient.exists(key);
        return exists === 1;
    }
    async deleteRefreshToken(userId, refreshToken) {
        const key = this.getRefreshTokenKey(userId, refreshToken);
        await this.redisClient.del(key);
        const userTokensKey = this.getUserTokensKey(userId);
        await this.redisClient.srem(userTokensKey, key);
    }
    async deleteAllRefreshTokens(userId) {
        const userTokensKey = this.getUserTokensKey(userId);
        const tokenKeys = await this.redisClient.smembers(userTokensKey);
        if (tokenKeys.length > 0) {
            const pipeline = this.redisClient.pipeline();
            tokenKeys.forEach(key => pipeline.del(key));
            pipeline.del(userTokensKey);
            await pipeline.exec();
        }
    }
    generateTokenPair(payload) {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);
        const expiresIn = this.parseExpiresIn(this.accessTokenExpiresIn);
        return {
            accessToken,
            refreshToken,
            expiresIn,
        };
    }
    parseExpiresIn(expiresIn) {
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match)
            return 15 * 60;
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
    async disconnect() {
        await this.redisClient.quit();
    }
}
exports.JwtTokenService = JwtTokenService;
//# sourceMappingURL=JwtTokenService.js.map