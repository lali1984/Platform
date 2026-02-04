"use strict";
// contracts/src/infrastructure/kafka/KafkaProducer.service.ts
/**
 * NOTE: This file should NOT contain CircuitBreaker implementation.
 * Circuit breaker pattern should be applied at service level (e.g., event-relay),
 * not in shared contracts package.
 *
 * For production use, services should wrap Kafka operations with CircuitBreaker
 * from their own implementation (e.g., event-relay/src/infrastructure/messaging/CircuitBreaker.ts)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKafkaProducer = exports.KafkaProducerService = void 0;
const kafkajs_1 = require("kafkajs");
class KafkaProducerService {
    constructor(config) {
        this.config = config;
        this.isConnected = false;
        const { Kafka } = require('kafkajs');
        const kafka = new Kafka({
            brokers: config.brokers,
            clientId: config.clientId,
            ssl: config.ssl,
            sasl: config.sasl,
        });
        this.producer = kafka.producer({
            createPartitioner: kafkajs_1.Partitioners.DefaultPartitioner,
            allowAutoTopicCreation: true,
            transactionTimeout: 30000,
            retry: {
                initialRetryTime: 300,
                retries: 10,
            },
        });
    }
    async connect() {
        if (this.isConnected)
            return;
        await this.producer.connect();
        this.isConnected = true;
    }
    async publishEvent(topic, event, options = {}) {
        if (!this.isConnected) {
            console.warn('Kafka producer not connected');
            return false;
        }
        try {
            const record = {
                topic,
                messages: [{
                        key: options.key || event.eventId,
                        value: JSON.stringify(event),
                        headers: {
                            'event-type': event.eventType,
                            'event-version': event.eventVersion,
                            'event-id': event.eventId,
                            'timestamp': event.timestamp,
                            'source-service': event.metadata?.sourceService || 'unknown',
                            ...options.headers,
                        },
                        partition: options.partition,
                    }],
                timeout: options.timeout || 5000,
            };
            await this.producer.send(record);
            return true;
        }
        catch (error) {
            console.error(`Failed to publish event to ${topic}:`, error);
            return false;
        }
    }
    async disconnect() {
        if (!this.isConnected)
            return;
        await this.producer.disconnect();
        this.isConnected = false;
    }
    getStatus() {
        return { isConnected: this.isConnected };
    }
}
exports.KafkaProducerService = KafkaProducerService;
const createKafkaProducer = (config) => {
    return new KafkaProducerService(config);
};
exports.createKafkaProducer = createKafkaProducer;
//# sourceMappingURL=KafkaProducer.service.js.map