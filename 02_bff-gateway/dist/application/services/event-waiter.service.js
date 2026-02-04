"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventWaiterService = void 0;
// /02_bff-gateway/src/application/services/event-waiter.service.ts
const kafkajs_1 = require("kafkajs");
class EventWaiterService {
    constructor() {
        this.pendingEvents = new Map();
        this.eventResolvers = new Map();
        const kafkaBrokers = process.env.KAFKA_BROKERS || 'localhost:9092';
        this.kafka = new kafkajs_1.Kafka({
            clientId: 'bff-event-waiter',
            brokers: [kafkaBrokers],
            retry: {
                initialRetryTime: 100,
                retries: 8
            }
        });
        this.consumer = this.kafka.consumer({
            groupId: 'bff-event-waiter-group',
            sessionTimeout: 30000,
            heartbeatInterval: 3000
        });
        this.initializeConsumer();
    }
    async initializeConsumer() {
        try {
            await this.consumer.connect();
            // Подписываемся на топики, которые нас интересуют
            await this.consumer.subscribe({
                topic: 'user.events',
                fromBeginning: false
            });
            // Запускаем обработку сообщений
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    if (!message.value)
                        return;
                    try {
                        const event = JSON.parse(message.value.toString());
                        console.log(`[EventWaiter] Received event: ${event.type} for userId: ${event.userId}`);
                        // Обрабатываем события создания пользователя
                        if (event.type === 'UserCreatedEvent' || event.type === 'UserRegisteredEvent') {
                            this.resolveEvent(event.userId, event);
                        }
                    }
                    catch (error) {
                        console.error('[EventWaiter] Error processing Kafka message:', error);
                    }
                },
            });
            console.log('[EventWaiter] Kafka consumer initialized successfully');
        }
        catch (error) {
            console.error('[EventWaiter] Failed to initialize Kafka consumer:', error);
            // В случае ошибки, waiter будет всегда возвращать false, но не сломает регистрацию
        }
    }
    resolveEvent(userId, event) {
        const resolver = this.eventResolvers.get(userId);
        if (resolver) {
            resolver(event);
            this.eventResolvers.delete(userId);
        }
    }
    /**
     * Ждем событие о создании пользователя с таймаутом
     */
    async waitForUserCreated(userId, timeoutMs = 3000) {
        return new Promise((resolve) => {
            // Сразу создаем промис для ожидания
            const timeoutId = setTimeout(() => {
                this.eventResolvers.delete(userId);
                resolve(false); // Таймаут - событие не получено
            }, timeoutMs);
            // Сохраняем резолвер
            this.eventResolvers.set(userId, (event) => {
                clearTimeout(timeoutId);
                resolve(true); // Событие получено
            });
            // Если consumer не инициализирован, сразу возвращаем false
            if (!this.consumer) {
                clearTimeout(timeoutId);
                resolve(false);
            }
        });
    }
    async disconnect() {
        try {
            await this.consumer.disconnect();
            console.log('[EventWaiter] Kafka consumer disconnected');
        }
        catch (error) {
            console.error('[EventWaiter] Error disconnecting consumer:', error);
        }
    }
}
exports.EventWaiterService = EventWaiterService;
