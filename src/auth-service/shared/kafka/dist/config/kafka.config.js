"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isDocker = process.env.NODE_ENV === 'production' ||
    process.env.RUNNING_IN_DOCKER === 'true' ||
    process.env.KAFKA_BROKER?.includes('kafka');
// Определяем брокера в зависимости от окружения
const defaultBroker = isDocker ? 'kafka:9092' : 'localhost:29092';
const broker = process.env.KAFKA_BROKER || defaultBroker;
const clientId = process.env.KAFKA_CLIENT_ID || 'auth-service';
const kafka = new kafkajs_1.Kafka({
    clientId,
    brokers: [broker],
    logLevel: kafkajs_1.logLevel.ERROR,
    retry: {
        initialRetryTime: 100,
        retries: 8,
        maxRetryTime: 60000,
        factor: 2,
    },
    connectionTimeout: 10000,
    requestTimeout: 30000,
    ssl: process.env.KAFKA_SSL === 'true' ? {} : undefined,
    sasl: process.env.KAFKA_USERNAME ? {
        mechanism: 'plain',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD || '',
    } : undefined,
});
console.log(`🔧 Kafka config: clientId=${clientId}, broker=${broker}`);
exports.default = kafka;
//# sourceMappingURL=kafka.config.js.map