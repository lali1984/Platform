"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKafkaProducer = exports.KafkaProducerService = void 0;
const kafkajs_1 = require("kafkajs");
const CircuitBreaker_1 = require("./CircuitBreaker");
class KafkaProducerService {
    constructor(config) {
        this.config = config;
        this.isConnected = false;
        const kafka = new kafkajs_1.Kafka({
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
        this.circuitBreaker = new CircuitBreaker_1.CircuitBreaker({
            failureThreshold: 5,
            resetTimeout: 60000,
            timeout: 10000, // ✅ Добавлен обязательный параметр
            halfOpenMaxAttempts: 3,
        });
    }
    // ✅ Добавлен метод connect
    async connect() {
        if (this.isConnected)
            return;
        try {
            await this.producer.connect();
            this.isConnected = true;
            console.log('✅ Kafka producer connected');
        }
        catch (error) {
            console.error('❌ Failed to connect Kafka producer:', error);
            throw error;
        }
    }
    // ✅ Добавлен метод publishEvent
    async publishEvent(topic, event, options = {}) {
        if (!this.isConnected) {
            console.warn('⚠️ Kafka producer not connected');
            return false;
        }
        return this.circuitBreaker.execute(async () => {
            var _a;
            try {
                const record = {
                    topic,
                    messages: [{
                            key: options.key || event.eventId,
                            value: JSON.stringify(event),
                            headers: Object.assign({ 'event-type': event.eventType, 'event-version': event.eventVersion, 'event-id': event.eventId, 'timestamp': event.timestamp, 'source-service': ((_a = event.metadata) === null || _a === void 0 ? void 0 : _a.sourceService) || 'event-relay' }, options.headers),
                            partition: options.partition,
                        }],
                    timeout: options.timeout || 5000,
                };
                const result = await this.producer.send(record);
                console.log(`📤 Event published to ${topic}:`, {
                    eventId: event.eventId,
                    eventType: event.eventType,
                    partition: result[0].partition,
                    offset: result[0].baseOffset,
                });
                return true;
            }
            catch (error) {
                console.error(`❌ Failed to publish event to ${topic}:`, {
                    eventId: event.eventId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                throw error;
            }
        });
    }
    // ✅ Добавлен метод publishToDLQ
    async publishToDLQ(originalEvent, error, metadata) {
        const dlqTopic = `${metadata.serviceName}.dlq.v1`;
        const dlqEvent = {
            eventId: crypto.randomUUID(),
            eventType: 'DLQEvent',
            eventVersion: '1.0.0',
            timestamp: new Date().toISOString(),
            payload: {
                originalEvent,
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                },
                metadata,
            },
            metadata: {
                sourceService: 'event-relay',
                dlqReason: 'max_attempts_exceeded',
            },
        };
        return this.publishEvent(dlqTopic, dlqEvent, {
            headers: {
                'dlq-reason': 'max_attempts_exceeded',
            },
        });
    }
    // ✅ Добавлен метод disconnect
    async disconnect() {
        if (!this.isConnected)
            return;
        try {
            await this.producer.disconnect();
            this.isConnected = false;
            console.log('✅ Kafka producer disconnected');
        }
        catch (error) {
            console.error('❌ Error disconnecting Kafka producer:', error);
        }
    }
    getStatus() {
        const state = this.circuitBreaker.getState();
        return {
            isConnected: this.isConnected,
            circuitBreakerState: state.state, // ✅ Исправлено: возвращаем строку
            failureCount: this.circuitBreaker.getFailureCount(),
        };
    }
}
exports.KafkaProducerService = KafkaProducerService;
const createKafkaProducer = (config) => {
    return new KafkaProducerService(config);
};
exports.createKafkaProducer = createKafkaProducer;
