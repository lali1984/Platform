// contracts/src/infrastructure/kafka/KafkaProducer.service.ts
/**
 * NOTE: This file should NOT contain CircuitBreaker implementation.
 * Circuit breaker pattern should be applied at service level (e.g., event-relay),
 * not in shared contracts package.
 * 
 * For production use, services should wrap Kafka operations with CircuitBreaker
 * from their own implementation (e.g., event-relay/src/infrastructure/messaging/CircuitBreaker.ts)
 */

import { Kafka, Producer, ProducerRecord, Partitioners } from 'kafkajs';

export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  ssl?: boolean;
  sasl?: {
    mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
    username: string;
    password: string;
  };
}

export interface EventMessage {
  eventId: string;
  eventType: string;
  eventVersion: string;
  timestamp: string;
  aggregateId?: string;
  payload: any;
  metadata?: {
    sourceService: string;
    correlationId?: string;
    [key: string]: any;
  };
}

export class KafkaProducerService {
  private producer: Producer;
  private isConnected = false;

  constructor(private readonly config: KafkaConfig) {
    const { Kafka } = require('kafkajs');
    const kafka = new Kafka({
      brokers: config.brokers,
      clientId: config.clientId,
      ssl: config.ssl,
      sasl: config.sasl as any,
    });

    this.producer = kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
      allowAutoTopicCreation: true,
      transactionTimeout: 30000,
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    });
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;
    await this.producer.connect();
    this.isConnected = true;
  }

  public async publishEvent(
    topic: string,
    event: EventMessage,
    options: {
      key?: string;
      headers?: Record<string, string>;
      partition?: number;
      timeout?: number;
    } = {}
  ): Promise<boolean> {
    if (!this.isConnected) {
      console.warn('Kafka producer not connected');
      return false;
    }

    try {
      const record: ProducerRecord = {
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
    } catch (error) {
      console.error(`Failed to publish event to ${topic}:`, error);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    await this.producer.disconnect();
    this.isConnected = false;
  }

  public getStatus(): { isConnected: boolean } {
    return { isConnected: this.isConnected };
  }
}

export const createKafkaProducer = (config: KafkaConfig): KafkaProducerService => {
  return new KafkaProducerService(config);
};