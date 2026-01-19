import { Kafka, logLevel } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

// Упростите логику определения окружения
const isDocker = process.env.NODE_ENV === 'production' || 
                process.env.RUNNING_IN_DOCKER === 'true' ||
                process.env.KAFKA_BROKER?.includes('kafka');

// Определяем брокера в зависимости от окружения
const defaultBroker = isDocker ? 'kafka:9092' : 'localhost:9092';
const broker = process.env.KAFKA_BROKER || defaultBroker;
const clientId = process.env.KAFKA_CLIENT_ID || 'auth-service';

const kafka = new Kafka({
  clientId,
  brokers: [broker], // Используйте переменную broker, а не жестко заданный адрес
  logLevel: logLevel.ERROR,
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

console.log(`🔧 Kafka config: clientId=${clientId}, broker=${broker}, isDocker=${isDocker}`);

export default kafka;