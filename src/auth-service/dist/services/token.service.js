"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = require("redis");
class TokenService {
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
        this.redisClient = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://redis:6379'
        });
    }
    generateAccessToken(payload) {
        // ФИКС: Приводим expiresIn к правильному типу
        const options = {
            expiresIn: this.parseExpiresIn(this.accessExpiresIn),
            algorithm: 'HS256'
        };
        return jsonwebtoken_1.default.sign({
            userId: payload.userId,
            email: payload.email,
            isTwoFactorEnabled: payload.isTwoFactorEnabled,
            isTwoFactorAuthenticated: payload.isTwoFactorAuthenticated || false
        }, this.accessSecret, options);
    }
    generateRefreshToken(payload) {
        // ФИКС: Приводим expiresIn к правильному типу
        const options = {
            expiresIn: this.parseExpiresIn(this.refreshExpiresIn),
            algorithm: 'HS256'
        };
        const refreshToken = jsonwebtoken_1.default.sign({
            userId: payload.userId,
            email: payload.email,
            isTwoFactorEnabled: payload.isTwoFactorEnabled
        }, this.refreshSecret, options);
        // Сохраняем в Redis
        const key = `refresh_token:${payload.userId}:${refreshToken}`;
        const ttl = 7 * 24 * 60 * 60; // 7 дней
        this.redisClient.setEx(key, ttl, 'valid');
        return refreshToken;
    }
    // ВАЖНО: Метод для парсинга expiresIn
    parseExpiresIn(expiresIn) {
        // Если это число в строке "3600", конвертируем в число
        if (/^\d+$/.test(expiresIn)) {
            return parseInt(expiresIn, 10);
        }
        // Если это строка формата "15m", "1h", "7d" - оставляем как есть
        return expiresIn;
    }
    verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.accessSecret);
            return {
                userId: decoded.userId,
                email: decoded.email,
                isTwoFactorEnabled: decoded.isTwoFactorEnabled,
                isTwoFactorAuthenticated: decoded.isTwoFactorAuthenticated
            };
        }
        catch {
            return null;
        }
    }
    verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.refreshSecret);
            return {
                userId: decoded.userId,
                email: decoded.email,
                isTwoFactorEnabled: decoded.isTwoFactorEnabled
            };
        }
        catch {
            return null;
        }
    }
    async validateRefreshToken(userId, token) {
        const key = `refresh_token:${userId}:${token}`;
        const value = await this.redisClient.get(key);
        return value === 'valid';
    }
    async connect() {
        await this.redisClient.connect();
    }
    async disconnect() {
        await this.redisClient.quit();
    }
}
exports.TokenService = TokenService;
//# sourceMappingURL=token.service.js.map