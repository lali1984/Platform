"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventConsumer = void 0;
const kafka_config_1 = __importDefault(require("../config/kafka.config"));
class EventConsumer {
    constructor() {
        this.consumer = kafka_config_1.default.consumer({
            groupId: process.env.KAFKA_CONSUMER_GROUP || 'platform-consumers'
        });
        this.handlers = new Map();
        this.isRunning = false;
    }
    async connect() {
        await this.consumer.connect();
        console.log('Kafka consumer connected successfully');
    }
    async disconnect() {
        await this.consumer.disconnect();
        this.isRunning = false;
        console.log('Kafka consumer disconnected');
    }
    registerHandler(handler) {
        if (!this.handlers.has(handler.eventType)) {
            this.handlers.set(handler.eventType, []);
        }
        this.handlers.get(handler.eventType).push(handler);
        console.log(`Handler registered for event: ${handler.eventType}`);
    }
    async start() {
        if (this.isRunning) {
            console.warn('Consumer is already running');
            return;
        }
        // Подписываемся на все топики, для которых есть handlers
        const topics = Array.from(this.handlers.keys()).map(eventType => `${eventType.split('.')[0]}-events`);
        const uniqueTopics = [...new Set(topics)];
        await this.consumer.subscribe({
            topics: uniqueTopics,
            fromBeginning: false
        });
        await this.consumer.run({
            eachMessage: async ({ topic, message }) => {
                try {
                    if (!message.value)
                        return;
                    const event = JSON.parse(message.value.toString());
                    const handlers = this.handlers.get(event.type) || [];
                    console.log(`Processing event ${event.type} from topic ${topic}`);
                    // Запускаем все обработчики для этого типа события
                    await Promise.all(handlers.map(handler => handler.handle(event)));
                }
                catch (error) {
                    console.error('Error processing message:', error);
                }
            },
        });
        this.isRunning = true;
        console.log(`Kafka consumer started for topics: ${uniqueTopics.join(', ')}`);
    }
    async stop() {
        if (this.isRunning) {
            await this.consumer.stop();
            this.isRunning = false;
            console.log('Kafka consumer stopped');
        }
    }
}
exports.EventConsumer = EventConsumer;
exports.default = new EventConsumer();
//# sourceMappingURL=event.consumer.js.map