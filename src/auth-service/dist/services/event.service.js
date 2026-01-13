"use strict";
//import { UserRegisteredEvent, UserLoggedInEvent } from '../events/event.types';
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const src_1 = require("../shared/events/src");
class EventService {
    constructor() {
        this.isInitialized = false;
        this.source = 'auth-service';
    }
    static getInstance() {
        if (!EventService.instance) {
            EventService.instance = new EventService();
        }
        return EventService.instance;
    }
    async initialize() {
        if (!this.isInitialized) {
            try {
                // В development режиме можем пропустить инициализацию Redis
                // если он не доступен, чтобы не ломать запуск сервиса
                if (process.env.NODE_ENV === 'production') {
                    await src_1.redisEventPublisher.connect();
                }
                this.isInitialized = true;
                console.log('Event service initialized');
            }
            catch (error) {
                console.warn('Event service initialization warning:', error.message);
                // В development режиме продолжаем без событий
                if (process.env.NODE_ENV === 'production') {
                    throw error;
                }
            }
        }
    }
    async publishUserRegistered(userData) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        const correlationId = (0, src_1.generateCorrelationId)();
        const baseEvent = (0, src_1.createBaseEvent)(src_1.EventType.USER_REGISTERED, this.source, correlationId);
        const event = {
            ...baseEvent,
            data: {
                userId: userData.userId,
                email: userData.email,
                registeredAt: new Date().toISOString(),
                metadata: userData.metadata
            }
        };
        try {
            await src_1.redisEventPublisher.publish(event);
            console.log(`User registered event published: ${userData.email}`);
        }
        catch (error) {
            console.error('Failed to publish user registered event:', error);
            // Не выбрасываем ошибку дальше, чтобы не ломать регистрацию пользователя
        }
    }
    async publishUserLoggedIn(userData) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        const correlationId = (0, src_1.generateCorrelationId)();
        const baseEvent = (0, src_1.createBaseEvent)(src_1.EventType.USER_LOGGED_IN, this.source, correlationId);
        const event = {
            ...baseEvent,
            data: {
                userId: userData.userId,
                email: userData.email,
                loginAt: new Date().toISOString(),
                metadata: userData.metadata
            }
        };
        try {
            await src_1.redisEventPublisher.publish(event);
            console.log(`User logged in event published: ${userData.email}`);
        }
        catch (error) {
            console.error('Failed to publish user logged in event:', error);
        }
    }
    async shutdown() {
        if (this.isInitialized) {
            try {
                await src_1.redisEventPublisher.disconnect();
                this.isInitialized = false;
                console.log('Event service shutdown');
            }
            catch (error) {
                console.error('Error during event service shutdown:', error);
            }
        }
    }
    async getStatus() {
        try {
            const status = await src_1.redisEventPublisher.getStatus();
            return {
                initialized: this.isInitialized,
                redisConnected: status.connected
            };
        }
        catch (error) {
            return {
                initialized: this.isInitialized,
                redisConnected: false
            };
        }
    }
}
exports.EventService = EventService;
exports.default = EventService.getInstance();
//# sourceMappingURL=event.service.js.map