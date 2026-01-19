"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetService = void 0;
// src/services/password-reset.service.ts
const redis_1 = require("redis");
const crypto_1 = __importDefault(require("crypto"));
class PasswordResetService {
    constructor() {
        this.redisClient = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://redis:6379'
        });
        this.redisClient.connect();
    }
    async generateResetToken(userId, email) {
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const key = `password_reset:${token}`;
        await this.redisClient.setEx(key, 3600, JSON.stringify({
            userId,
            email,
            createdAt: new Date().toISOString()
        }));
        return token;
    }
    async validateResetToken(token) {
        const key = `password_reset:${token}`;
        const data = await this.redisClient.get(key);
        if (!data)
            return null;
        return JSON.parse(data);
    }
    async invalidateResetToken(token) {
        const key = `password_reset:${token}`;
        await this.redisClient.del(key);
    }
}
exports.PasswordResetService = PasswordResetService;
//# sourceMappingURL=password-reset.service.js.map