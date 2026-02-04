"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaEventWaiter = void 0;
// /02_bff-gateway/src/application/services/kafka-event-waiter.service.ts
const kafkajs_1 = require("kafkajs");
class KafkaEventWaiter {
    constructor() {
        this.consumer = null;
        this.isInitialized = false;
        this.eventResolvers = new Map();
        const kafkaBrokers = process.env.KAFKA_BROKERS || 'kafka:9092';
        this.kafka = new kafkajs_1.Kafka({
            clientId: 'bff-event-waiter',
            brokers: [kafkaBrokers],
            retry: {
                initialRetryTime: 100,
                retries: 8,
            },
            connectionTimeout: 10000,
            requestTimeout: 30000,
        });
        this.initialize().catch((error) => {
            console.error('[KafkaEventWaiter] Failed to initialize:', error);
        });
    }
    async initialize() {
        try {
            this.consumer = this.kafka.consumer({
                groupId: 'bff-gateway-user-created', // ← ИСПРАВЛЕНО: фиксированный groupId
                sessionTimeout: 30000,
                heartbeatInterval: 3000,
                maxWaitTimeInMs: 100,
            });
            await this.consumer.connect();
            // ← ИСПРАВЛЕНО: правильное имя топика
            await this.consumer.subscribe({
                topic: 'user-service.user-created.v1',
                fromBeginning: false,
            });
            await this.consumer.run({
                autoCommit: true,
                autoCommitInterval: 5000,
                autoCommitThreshold: 1,
                eachMessage: async ({ message }) => {
                    await this.handleMessage(message);
                },
            });
            this.isInitialized = true;
            console.log('[KafkaEventWaiter] Initialized successfully');
        }
        catch (error) {
            console.error('[KafkaEventWaiter] Initialization error:', error);
            this.consumer = null;
        }
    }
    async handleMessage(message) {
        if (!message.value)
            return;
        try {
            const event = JSON.parse(message.value.toString());
            console.log(`[KafkaEventWaiter] Received event: ${event.eventType}`);
            // ← ИСПРАВЛЕНО: проверяем `eventType === 'UserCreated'`
            if (event.eventType === 'UserCreated') {
                const userId = event.payload?.userId;
                if (userId) {
                    this.resolveEvent(userId, event);
                }
            }
        }
        catch (error) {
            console.error('[KafkaEventWaiter] Error parsing event:', error);
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
     * Ждём событие о создании пользователя
     */
    async waitForUserCreated(userId, timeoutMs = 15000 // ← Увеличено до 15 секунд
    ) {
        if (!this.isInitialized || !this.consumer) {
            console.warn('[KafkaEventWaiter] Not initialized, skipping event wait');
            return null;
        }
        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => {
                this.eventResolvers.delete(userId);
                console.log(`[KafkaEventWaiter] Timeout waiting for user ${userId}`);
                resolve(null);
            }, timeoutMs);
            this.eventResolvers.set(userId, (event) => {
                clearTimeout(timeoutId);
                resolve(event || null);
            });
        });
    }
    async disconnect() {
        try {
            if (this.consumer) {
                await this.consumer.disconnect();
                console.log('[KafkaEventWaiter] Disconnected from Kafka');
            }
        }
        catch (error) {
            console.error('[KafkaEventWaiter] Error disconnecting:', error);
        }
    }
}
exports.KafkaEventWaiter = KafkaEventWaiter;
