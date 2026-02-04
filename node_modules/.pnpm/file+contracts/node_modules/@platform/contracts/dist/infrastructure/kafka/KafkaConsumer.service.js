"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaConsumerService = void 0;
// ./contracts/src/infrastructure/kafka/KafkaConsumer.service.ts
const kafkajs_1 = require("kafkajs");
class KafkaConsumerService {
    constructor(config) {
        this.config = config;
        this.isConnected = false;
        this.isRunning = false; // НОВОЕ: отслеживаем состояние запуска
        this.handlers = new Map();
        this.subscribedTopics = new Set(); // НОВОЕ: отслеживаем подписки
        if (!config.consumer?.groupId) {
            throw new Error('Consumer groupId is required');
        }
        const kafka = new kafkajs_1.Kafka({
            brokers: config.brokers,
            clientId: config.clientId,
            ssl: config.ssl,
            sasl: config.sasl,
        });
        this.consumer = kafka.consumer({
            groupId: config.consumer.groupId,
            sessionTimeout: config.consumer.sessionTimeout,
            heartbeatInterval: config.consumer.heartbeatInterval,
            maxBytesPerPartition: config.consumer.maxBytesPerPartition,
            retry: config.consumer.retry,
            allowAutoTopicCreation: config.consumer.allowAutoTopicCreation,
        });
    }
    async connect() {
        if (this.isConnected)
            return;
        try {
            await this.consumer.connect();
            this.isConnected = true;
            this.log('✅ Kafka consumer connected');
            // ⚠️ ВАЖНО: НЕ ЗАПУСКАЕМ consumer.run() здесь!
        }
        catch (error) {
            this.log(`❌ Failed to connect Kafka consumer: ${error}`, 'error');
            throw new Error(`Failed to connect Kafka consumer: ${error}`);
        }
    }
    // НОВЫЙ МЕТОД: подписка на топики без запуска
    async subscribe(topic, handler) {
        try {
            if (!this.isConnected) {
                throw new Error('Consumer not connected. Call connect() first.');
            }
            // Проверяем, не подписаны ли уже
            if (this.subscribedTopics.has(topic)) {
                this.log(`⚠️ Already subscribed to topic: ${topic}`, 'warn');
                return;
            }
            const topics = {
                topics: [topic],
                fromBeginning: false,
            };
            await this.consumer.subscribe(topics);
            this.handlers.set(topic, handler);
            this.subscribedTopics.add(topic);
            this.log(`✅ Subscribed to topic: ${topic}`);
        }
        catch (error) {
            this.log(`❌ Failed to subscribe to topic ${topic}: ${error}`, 'error');
            throw new Error(`Failed to subscribe to topic ${topic}: ${error}`);
        }
    }
    // НОВЫЙ МЕТОД: запуск consumer после подписки
    async start() {
        if (!this.isConnected) {
            throw new Error('Consumer not connected. Call connect() first.');
        }
        if (this.isRunning) {
            this.log('⚠️ Consumer already running', 'warn');
            return;
        }
        if (this.subscribedTopics.size === 0) {
            this.log('ℹ️ No topics subscribed. Consumer will start but wait for subscriptions.', 'info');
        }
        try {
            await this.consumer.run({
                eachMessage: async (payload) => {
                    await this.handleMessage(payload);
                },
            });
            this.isRunning = true;
            this.log('✅ Kafka consumer started successfully');
        }
        catch (error) {
            this.log(`❌ Failed to start Kafka consumer: ${error}`, 'error');
            throw new Error(`Failed to start Kafka consumer: ${error}`);
        }
    }
    // НОВЫЙ МЕТОД: остановка consumer без отключения
    async stop() {
        if (!this.isRunning)
            return;
        try {
            await this.consumer.stop();
            this.isRunning = false;
            this.log('✅ Kafka consumer stopped');
        }
        catch (error) {
            this.log(`❌ Failed to stop Kafka consumer: ${error}`, 'error');
            throw error;
        }
    }
    async handleMessage(payload) {
        const { topic, message } = payload;
        const handler = this.handlers.get(topic);
        if (!handler) {
            this.log(`⚠️ No handler found for topic: ${topic}`, 'warn');
            return;
        }
        try {
            const messageValue = message.value?.toString();
            if (!messageValue) {
                this.log(`⚠️ Empty message received from topic: ${topic}`, 'warn');
                return;
            }
            const event = JSON.parse(messageValue);
            await handler(event);
        }
        catch (error) {
            this.log(`❌ Error processing message from topic ${topic}: ${error}`, 'error');
            // PRODUCTION: Здесь нужно отправлять в DLQ
            throw error;
        }
    }
    async disconnect() {
        try {
            // Сначала останавливаем consumer
            if (this.isRunning) {
                await this.stop();
            }
            // Затем отключаемся
            if (this.isConnected) {
                await this.consumer.disconnect();
                this.isConnected = false;
                this.subscribedTopics.clear();
                this.handlers.clear();
                this.log('✅ Kafka consumer disconnected');
            }
        }
        catch (error) {
            this.log(`❌ Error disconnecting Kafka consumer: ${error}`, 'error');
            throw error;
        }
    }
    getSubscriptions() {
        return Array.from(this.subscribedTopics);
    }
    getStatus() {
        return {
            isConnected: this.isConnected,
            isRunning: this.isRunning,
            topics: this.getSubscriptions(),
            subscribedTopicsCount: this.subscribedTopics.size,
        };
    }
    // Вспомогательный метод для логирования
    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [KafkaConsumer] ${message}`;
        switch (level) {
            case 'error':
                console.error(logMessage);
                break;
            case 'warn':
                console.warn(logMessage);
                break;
            default:
                console.log(logMessage);
        }
    }
}
exports.KafkaConsumerService = KafkaConsumerService;
//# sourceMappingURL=KafkaConsumer.service.js.map