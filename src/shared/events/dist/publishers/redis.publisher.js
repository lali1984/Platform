"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisEventPublisher = void 0;
exports.getRedisEventPublisher = getRedisEventPublisher;
const redis_1 = require("redis");
const event_utils_1 = require("../utils/event.utils");
class RedisEventPublisher {
    constructor(redisUrl = 'redis://localhost:6379') {
        this.isConnected = false;
        this.channel = 'platform-events';
        this.client = (0, redis_1.createClient)({
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
    setupEventListeners() {
        this.client.on('connect', () => {
            console.log('Redis Event Publisher connected');
            this.isConnected = true;
        });
        this.client.on('error', (err) => {
            console.error('Redis Event Publisher error:', err);
        });
        this.client.on('end', () => {
            console.log('Redis Event Publisher disconnected');
            this.isConnected = false;
        });
    }
    async connect() {
        if (!this.isConnected) {
            try {
                await this.client.connect();
            }
            catch (error) {
                console.error('Failed to connect to Redis:', error);
                throw error;
            }
        }
    }
    async disconnect() {
        if (this.isConnected) {
            await this.client.quit();
            this.isConnected = false;
        }
    }
    async publish(event) {
        if (!(0, event_utils_1.validateEvent)(event)) {
            throw new Error('Invalid event format');
        }
        if (!this.isConnected) {
            try {
                await this.connect();
            }
            catch (error) {
                console.error('Cannot publish event, Redis not connected:', error);
                return; // Не выбрасываем ошибку, чтобы не ломать основной поток
            }
        }
        try {
            // Публикуем в общий канал
            await this.client.publish(this.channel, JSON.stringify(event));
            // Также сохраняем в stream для persistence
            await this.client.xAdd('event-stream', '*', event);
            console.log(`Event ${event.type} published to Redis`);
        }
        catch (error) {
            console.error('Failed to publish event:', error);
            // Не выбрасываем ошибку, чтобы не ломать основной поток
        }
    }
    async getStatus() {
        try {
            if (!this.isConnected) {
                return { connected: false, redisStatus: 'disconnected' };
            }
            await this.client.ping();
            return { connected: true, redisStatus: 'healthy' };
        }
        catch (error) {
            return { connected: false, redisStatus: 'error' };
        }
    }
}
exports.RedisEventPublisher = RedisEventPublisher;
// Singleton instance
let instance = null;
function getRedisEventPublisher(redisUrl) {
    if (!instance) {
        instance = new RedisEventPublisher(redisUrl);
    }
    return instance;
}
exports.default = getRedisEventPublisher();
//# sourceMappingURL=redis.publisher.js.map