"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var KafkaConsumerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaConsumerService = void 0;
const common_1 = require("@nestjs/common");
const kafkajs_1 = require("kafkajs");
let KafkaConsumerService = KafkaConsumerService_1 = class KafkaConsumerService {
    constructor() {
        this.logger = new common_1.Logger(KafkaConsumerService_1.name);
        this.connected = false;
        this.handlers = new Map();
        const kafka = new kafkajs_1.Kafka({
            clientId: 'user-service-consumer',
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
        });
        const consumerConfig = {
            groupId: 'user-service-group',
            sessionTimeout: 30000,
            heartbeatInterval: 3000,
            maxBytesPerPartition: 1048576,
            retry: {
                initialRetryTime: 100,
                retries: 8
            },
            maxWaitTimeInMs: 5000,
            minBytes: 1,
            maxBytes: 10485760,
            allowAutoTopicCreation: true,
            metadataMaxAge: 300000,
        };
        this.consumer = kafka.consumer(consumerConfig);
    }
    async onModuleInit() {
        await this.connect();
    }
    async onModuleDestroy() {
        await this.disconnect();
    }
    async connect() {
        if (this.connected)
            return;
        try {
            await this.consumer.connect();
            this.connected = true;
            this.logger.log('✅ Kafka consumer connected');
            await this.consumer.run({
                eachMessage: async (payload) => {
                    await this.handleMessage(payload);
                },
            });
        }
        catch (error) {
            this.logger.error('❌ Failed to connect Kafka consumer:', error);
            throw error;
        }
    }
    async disconnect() {
        if (!this.connected)
            return;
        try {
            await this.consumer.disconnect();
            this.connected = false;
            this.logger.log('✅ Kafka consumer disconnected');
        }
        catch (error) {
            this.logger.error('❌ Error disconnecting Kafka consumer:', error);
            throw error;
        }
    }
    async subscribe(topic, handler) {
        try {
            const topics = {
                topics: [topic],
                fromBeginning: false,
            };
            await this.consumer.subscribe(topics);
            this.handlers.set(topic, handler);
            this.logger.log(`✅ Subscribed to topic: ${topic}`);
        }
        catch (error) {
            this.logger.error(`❌ Failed to subscribe to topic ${topic}:`, error);
            throw error;
        }
    }
    async handleMessage(payload) {
        var _a;
        const { topic, partition, message } = payload;
        const handler = this.handlers.get(topic);
        if (!handler) {
            this.logger.warn(`No handler registered for topic: ${topic}`);
            return;
        }
        try {
            const messageValue = (_a = message.value) === null || _a === void 0 ? void 0 : _a.toString();
            if (!messageValue) {
                this.logger.warn(`Empty message received from topic ${topic}`);
                return;
            }
            const event = JSON.parse(messageValue);
            this.logger.debug(`📥 Received event from ${topic} (partition ${partition}): ${event.type}`);
            await handler(event);
        }
        catch (error) {
            this.logger.error(`❌ Error processing message from topic ${topic}:`, error);
            throw error;
        }
    }
    isConnected() {
        return this.connected;
    }
    getStatus() {
        return {
            isConnected: this.connected,
            topics: Array.from(this.handlers.keys()),
        };
    }
    getSubscriptions() {
        return Array.from(this.handlers.keys());
    }
    async unsubscribe(topic) {
        try {
            this.handlers.delete(topic);
            this.logger.log(`Unsubscribed from topic: ${topic}`);
        }
        catch (error) {
            this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
            throw error;
        }
    }
};
exports.KafkaConsumerService = KafkaConsumerService;
exports.KafkaConsumerService = KafkaConsumerService = KafkaConsumerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], KafkaConsumerService);
//# sourceMappingURL=kafka-consumer.service.js.map