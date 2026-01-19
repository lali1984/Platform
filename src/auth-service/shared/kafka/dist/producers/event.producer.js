"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventProducer = void 0;
const kafka_config_1 = __importDefault(require("../config/kafka.config"));
const events_1 = require("../types/events");
const uuid_1 = require("uuid");
const producer = kafka_config_1.default.producer();
class EventProducer {
    constructor() {
        this.isConnected = false;
        this.connectionPromise = null;
        console.log('🔧 EventProducer инициализирован');
    }
    static getInstance() {
        if (!EventProducer.instance) {
            EventProducer.instance = new EventProducer();
        }
        return EventProducer.instance;
    }
    async connect() {
        if (this.isConnected) {
            return;
        }
        // Если уже идет подключение, ждем его
        if (this.connectionPromise) {
            await this.connectionPromise;
            return;
        }
        this.connectionPromise = (async () => {
            try {
                console.log('🔌 Подключение к Kafka producer...');
                await producer.connect();
                this.isConnected = true;
                console.log('✅ Kafka producer успешно подключен');
            }
            catch (error) {
                console.error('❌ Ошибка подключения к Kafka producer:', error);
                throw error;
            }
            finally {
                this.connectionPromise = null;
            }
        })();
        await this.connectionPromise;
    }
    async disconnect() {
        if (this.isConnected) {
            try {
                await producer.disconnect();
                this.isConnected = false;
                console.log('🔌 Kafka producer отключен');
            }
            catch (error) {
                console.error('❌ Ошибка отключения от Kafka producer:', error);
                throw error;
            }
        }
    }
    async sendEvent(event) {
        if (!this.isConnected) {
            await this.connect();
        }
        const topic = events_1.EventTopicMapping[event.type];
        if (!topic) {
            console.error(`❌ Неизвестный тип события: ${event.type}`);
            throw new Error(`Unknown event type: ${event.type}`);
        }
        try {
            // Создаем ключ для сообщения на основе данных события
            let key;
            // Безопасное извлечение userId или email
            if ('userId' in event.data && event.data.userId) {
                key = event.data.userId;
            }
            else if ('email' in event.data && event.data.email) {
                key = event.data.email;
            }
            else {
                key = 'system';
            }
            const result = await producer.send({
                topic,
                messages: [
                    {
                        key,
                        value: JSON.stringify(event),
                        headers: {
                            'event-type': event.type,
                            'event-version': event.version,
                            'event-source': event.source,
                            'event-id': event.eventId,
                            timestamp: event.timestamp,
                            'correlation-id': event.correlationId || 'none',
                        },
                    },
                ],
            });
            console.log(`📤 Событие ${event.type} отправлено в топик ${topic}`, {
                eventId: event.eventId,
                partition: result[0].partition,
                offset: result[0].baseOffset,
            });
        }
        catch (error) {
            console.error(`❌ Ошибка отправки события ${event.type}:`, error);
            // Не пробрасываем ошибку дальше, чтобы не ломать основной flow
            // В продакшене можно добавить retry логику или отправить в dead letter queue
            console.log('⚠️ Событие не отправлено, но основной процесс продолжается');
        }
    }
    // Helper method для создания базового события
    createBaseEvent(type, source, data) {
        return {
            type,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            source,
            eventId: (0, uuid_1.v4)(),
            data,
        };
    }
    getStatus() {
        return {
            isConnected: this.isConnected,
        };
    }
}
exports.EventProducer = EventProducer;
exports.default = EventProducer.getInstance();
//# sourceMappingURL=event.producer.js.map