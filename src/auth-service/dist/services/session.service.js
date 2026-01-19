"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
// src/services/session.service.ts
const redis_1 = require("redis");
class SessionService {
    constructor() {
        this.redisClient = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://redis:6379'
        });
        this.redisClient.connect();
    }
    async createSession(userId, userAgent, ipAddress) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const session = {
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
    async getSessions(userId) {
        const key = `user_sessions:${userId}`;
        const sessions = await this.redisClient.hGetAll(key);
        return Object.values(sessions).map(s => JSON.parse(s));
    }
    async revokeSession(userId, sessionId) {
        const key = `user_sessions:${userId}`;
        await this.redisClient.hDel(key, sessionId);
    }
    async revokeAllSessions(userId, excludeSessionId) {
        const key = `user_sessions:${userId}`;
        const sessions = await this.redisClient.hGetAll(key);
        for (const [sessionId] of Object.entries(sessions)) {
            if (sessionId !== excludeSessionId) {
                await this.redisClient.hDel(key, sessionId);
            }
        }
    }
}
exports.SessionService = SessionService;
//# sourceMappingURL=session.service.js.map