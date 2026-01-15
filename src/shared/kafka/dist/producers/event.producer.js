"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventProducer = void 0;
const kafka_config_1 = __importDefault(require("../config/kafka.config"));
const producer = kafka_config_1.default.producer();
class EventProducer {
    constructor() {
        this.isConnected = false;
    }
    static getInstance() {
        if (!EventProducer.instance) {
            EventProducer.instance = new EventProducer();
        }
        return EventProducer.instance;
    }
    async connect() {
        if (!this.isConnected) {
            await producer.connect();
            this.isConnected = true;
            console.log('Kafka producer connected successfully');
        }
    }
    async disconnect() {
        if (this.isConnected) {
            await producer.disconnect();
            this.isConnected = false;
            console.log('Kafka producer disconnected');
        }
    }
    async sendEvent(event) {
        if (!this.isConnected) {
            await this.connect();
        }
        const topic = this.getTopicFromEventType(event.type);
        try {
            await producer.send({
                topic,
                messages: [
                    {
                        key: event.data.userId || 'system',
                        value: JSON.stringify(event),
                        headers: {
                            'event-type': event.type,
                            'event-version': event.version,
                            'event-source': event.source,
                            'timestamp': event.timestamp,
                        },
                    },
                ],
            });
            console.log(`Event ${event.type} sent to topic ${topic}`);
        }
        catch (error) {
            console.error(`Failed to send event ${event.type}:`, error);
            throw error;
        }
    }
    getTopicFromEventType(eventType) {
        // Преобразуем event.type в имя топика
        // Пример: 'user.registered' -> 'user-events'
        const prefix = eventType.split('.')[0];
        return `${prefix}-events`;
    }
}
exports.EventProducer = EventProducer;
exports.default = EventProducer.getInstance();
//# sourceMappingURL=event.producer.js.map