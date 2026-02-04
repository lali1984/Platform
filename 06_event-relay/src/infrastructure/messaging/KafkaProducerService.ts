import { Kafka, Producer, ProducerRecord, Partitioners } from 'kafkajs';
import { CircuitBreaker } from './CircuitBreaker';

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
  private circuitBreaker: CircuitBreaker;
  private isConnected = false;

  constructor(private readonly config: KafkaConfig) {
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

    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000,
      timeout: 10000,  // ✅ Добавлен обязательный параметр
      halfOpenMaxAttempts: 3,
    });
  }

  // ✅ Добавлен метод connect
  public async connect(): Promise<void> {
    if (this.isConnected) return;
    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log('✅ Kafka producer connected');
    } catch (error) {
      console.error('❌ Failed to connect Kafka producer:', error);
      throw error;
    }
  }

  // ✅ Добавлен метод publishEvent
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
      console.warn('⚠️ Kafka producer not connected');
      return false;
    }

    return this.circuitBreaker.execute(async () => {
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
              'source-service': event.metadata?.sourceService || 'event-relay',
              ...options.headers,
            },
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
      } catch (error) {
        console.error(`❌ Failed to publish event to ${topic}:`, {
          eventId: event.eventId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    });
  }

  // ✅ Добавлен метод publishToDLQ
  public async publishToDLQ(
    originalEvent: any,
    error: Error,
    metadata: {
      serviceName: string;
      attempts: number;
      lastAttemptAt: Date;
    }
  ): Promise<boolean> {
    const dlqTopic = `${metadata.serviceName}.dlq.v1`;
    const dlqEvent: EventMessage = {
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
  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log('✅ Kafka producer disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Kafka producer:', error);
    }
  }

  public getStatus(): {
    isConnected: boolean;
    circuitBreakerState: string;
    failureCount: number;
  } {
    const state = this.circuitBreaker.getState();
    return {
      isConnected: this.isConnected,
      circuitBreakerState: state.state,  // ✅ Исправлено: возвращаем строку
      failureCount: this.circuitBreaker.getFailureCount(),
    };
  }
}

export const createKafkaProducer = (config: KafkaConfig): KafkaProducerService => {
  return new KafkaProducerService(config);
};