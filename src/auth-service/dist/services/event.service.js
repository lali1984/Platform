"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const event_producer_1 = require("../../shared/kafka/dist/producers/event.producer");
const kafka_1 = require("../../shared/kafka/");
const events_1 = require("../../shared/events");
class EventService {
    constructor() {
        this.isInitialized = false;
        this.source = 'auth-service';
        this.kafkaProducer = null;
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
                // 1. Инициализируем Redis (если требуется для обратной совместимости)
                if (process.env.NODE_ENV === 'production' || process.env.USE_REDIS_EVENTS === 'true') {
                    await events_1.redisEventPublisher.connect();
                }
                // 2. Инициализируем Kafka Producer
                try {
                    this.kafkaProducer = event_producer_1.EventProducer.getInstance();
                    await this.kafkaProducer.connect();
                    console.log('✅ Kafka producer инициализирован в EventService');
                }
                catch (kafkaError) {
                    console.warn('⚠️ Kafka initialization warning:', kafkaError.message);
                    // В development режиме продолжаем без Kafka
                    if (process.env.NODE_ENV === 'production') {
                        throw kafkaError;
                    }
                }
                this.isInitialized = true;
                console.log('Event service initialized with Kafka support');
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
    // ==================== ОБЩИЕ МЕТОДЫ ====================
    async publishToRedis(event) {
        if (process.env.USE_REDIS_EVENTS === 'true' || process.env.NODE_ENV === 'production') {
            try {
                await events_1.redisEventPublisher.publish(event);
                console.log(`📨 Событие отправлено в Redis: ${event.type}`);
            }
            catch (error) {
                console.error('❌ Ошибка отправки в Redis:', error.message);
            }
        }
    }
    async publishToKafka(event) {
        if (this.kafkaProducer && this.isInitialized) {
            try {
                await this.kafkaProducer.sendEvent(event);
                console.log(`📤 Событие отправлено в Kafka: ${event.type}`);
            }
            catch (error) {
                console.error('❌ Ошибка отправки в Kafka:', error.message);
                // Не пробрасываем ошибку, чтобы не ломать основной flow
            }
        }
    }
    // ==================== СОБЫТИЯ АУТЕНТИФИКАЦИИ ====================
    async publishUserRegistered(userData) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        const correlationId = (0, events_1.generateCorrelationId)();
        // Создаем событие для Kafka
        const kafkaEvent = this.kafkaProducer?.createBaseEvent(kafka_1.EventType.USER_REGISTERED, this.source, {
            userId: userData.userId,
            email: userData.email,
            registeredAt: new Date().toISOString(),
            metadata: {
                isEmailVerified: userData.metadata?.isEmailVerified || false,
                isActive: userData.metadata?.isActive || true,
                isTwoFactorEnabled: userData.metadata?.isTwoFactorEnabled || false,
                ...userData.metadata,
            },
        });
        // Создаем событие для Redis (для обратной совместимости)
        const redisBaseEvent = (0, events_1.createBaseEvent)('USER_REGISTERED', this.source, correlationId);
        const redisEvent = {
            ...redisBaseEvent,
            data: {
                userId: userData.userId,
                email: userData.email,
                registeredAt: new Date().toISOString(),
                metadata: userData.metadata
            }
        };
        // Отправляем в оба канала параллельно
        await Promise.allSettled([
            this.publishToRedis(redisEvent),
            kafkaEvent ? this.publishToKafka(kafkaEvent) : Promise.resolve(),
        ]);
        console.log(`✅ Событие регистрации обработано: ${userData.email}`);
    }
    async publishUserLoggedIn(userData) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        const correlationId = (0, events_1.generateCorrelationId)();
        // Создаем событие для Kafka
        const kafkaEvent = this.kafkaProducer?.createBaseEvent(kafka_1.EventType.USER_LOGGED_IN, this.source, {
            userId: userData.userId,
            email: userData.email,
            loginAt: new Date().toISOString(),
            metadata: {
                ipAddress: userData.metadata?.ipAddress,
                userAgent: userData.metadata?.userAgent,
                deviceInfo: userData.metadata?.deviceInfo,
                isTwoFactorEnabled: userData.metadata?.isTwoFactorEnabled || false,
                loginMethod: userData.metadata?.loginMethod || 'password',
            },
        });
        // Создаем событие для Redis
        const redisBaseEvent = (0, events_1.createBaseEvent)('USER_LOGGED_IN', this.source, correlationId);
        const redisEvent = {
            ...redisBaseEvent,
            data: {
                userId: userData.userId,
                email: userData.email,
                loginAt: new Date().toISOString(),
                metadata: userData.metadata
            }
        };
        // Отправляем в оба канала
        await Promise.allSettled([
            this.publishToRedis(redisEvent),
            kafkaEvent ? this.publishToKafka(kafkaEvent) : Promise.resolve(),
        ]);
        console.log(`✅ Событие входа обработано: ${userData.email}`);
    }
    async publishUserLoginFailed(userData) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        // Создаем событие для Kafka
        const kafkaEvent = this.kafkaProducer?.createBaseEvent(kafka_1.EventType.USER_LOGIN_FAILED, this.source, {
            email: userData.email,
            reason: userData.reason,
            failedAt: new Date().toISOString(),
            metadata: {
                ipAddress: userData.metadata?.ipAddress,
                userAgent: userData.metadata?.userAgent,
                attemptCount: userData.metadata?.attemptCount || 1,
            },
        });
        if (kafkaEvent) {
            await this.publishToKafka(kafkaEvent);
        }
        console.log(`✅ Событие ошибки входа обработано: ${userData.email} (${userData.reason})`);
    }
    async publishTwoFactorEnabled(userData) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        const kafkaEvent = this.kafkaProducer?.createBaseEvent(kafka_1.EventType.TWO_FACTOR_ENABLED, this.source, {
            userId: userData.userId,
            email: userData.email,
            enabledAt: new Date().toISOString(),
            method: userData.method,
        });
        if (kafkaEvent) {
            await this.publishToKafka(kafkaEvent);
        }
        console.log(`✅ Событие 2FA включено: ${userData.email} (${userData.method})`);
    }
    async publishPasswordResetRequested(userData) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        const kafkaEvent = this.kafkaProducer?.createBaseEvent(kafka_1.EventType.PASSWORD_RESET_REQUESTED, this.source, {
            userId: userData.userId,
            email: userData.email,
            requestedAt: new Date().toISOString(),
            resetToken: userData.resetToken,
            expiresAt: userData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 часа
        });
        if (kafkaEvent) {
            await this.publishToKafka(kafkaEvent);
        }
        console.log(`✅ Событие сброса пароля: ${userData.email}`);
    }
    // ==================== УТИЛИТЫ ====================
    async shutdown() {
        if (this.isInitialized) {
            try {
                // Отключаем Redis
                if (process.env.USE_REDIS_EVENTS === 'true' || process.env.NODE_ENV === 'production') {
                    await events_1.redisEventPublisher.disconnect();
                }
                // Отключаем Kafka
                if (this.kafkaProducer) {
                    await this.kafkaProducer.disconnect();
                }
                this.isInitialized = false;
                console.log('✅ Event service shutdown (Redis + Kafka)');
            }
            catch (error) {
                console.error('❌ Error during event service shutdown:', error);
            }
        }
    }
    async getStatus() {
        try {
            const redisStatus = await events_1.redisEventPublisher.getStatus();
            const kafkaStatus = this.kafkaProducer?.getStatus();
            return {
                initialized: this.isInitialized,
                redisConnected: redisStatus.connected,
                kafkaConnected: kafkaStatus?.isConnected || false,
            };
        }
        catch (error) {
            return {
                initialized: this.isInitialized,
                redisConnected: false,
                kafkaConnected: false,
            };
        }
    }
}
exports.EventService = EventService;
exports.default = EventService.getInstance();
//# sourceMappingURL=event.service.js.map