"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const kafka = new kafkajs_1.Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'platform-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:29092'],
    logLevel: kafkajs_1.logLevel.ERROR,
    retry: {
        initialRetryTime: 100,
        retries: 8
    }
});
exports.default = kafka;
//# sourceMappingURL=kafka.config.js.map