// /02_bff-gateway/src/application/services/kafka-event-waiter.service.ts
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';

/**
 * Формат события, получаемого из Kafka (после обработки event-relay)
 */
export interface KafkaEvent {
  eventId: string;
  eventType: string;      // ← ИСПРАВЛЕНО: не `type`, а `eventType`
  eventVersion: string;
  timestamp: string;
  aggregateId?: string;
  payload: any;
  metadata?: Record<string, any>;
}

export class KafkaEventWaiter {
  private kafka: Kafka;
  private consumer: Consumer | null = null;
  private isInitialized = false;
  private eventResolvers: Map<string, (event: KafkaEvent | null) => void> = new Map();

  constructor() {
    const kafkaBrokers = process.env.KAFKA_BROKERS || 'kafka:9092';
    this.kafka = new Kafka({
      clientId: 'bff-event-waiter',
      brokers: [kafkaBrokers],
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
      connectionTimeout: 10000,
      requestTimeout: 30000,
    });

    this.initialize().catch((error) => {
      console.error('[KafkaEventWaiter] Failed to initialize:', error);
    });
  }

  private async initialize(): Promise<void> {
    try {
      this.consumer = this.kafka.consumer({
        groupId: 'bff-gateway-user-created',  // ← ИСПРАВЛЕНО: фиксированный groupId
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
        maxWaitTimeInMs: 100,
      });

      await this.consumer.connect();

      // ← ИСПРАВЛЕНО: правильное имя топика
      await this.consumer.subscribe({
        topic: 'user-service.user-created.v1',
        fromBeginning: false,
      });

      await this.consumer.run({
        autoCommit: true,
        autoCommitInterval: 5000,
        autoCommitThreshold: 1,
        eachMessage: async ({ message }: EachMessagePayload) => {
          await this.handleMessage(message);
        },
      });

      this.isInitialized = true;
      console.log('[KafkaEventWaiter] Initialized successfully');
    } catch (error) {
      console.error('[KafkaEventWaiter] Initialization error:', error);
      this.consumer = null;
    }
  }

  private async handleMessage(message: any): Promise<void> {
    if (!message.value) return;
    try {
      const event = JSON.parse(message.value.toString()) as KafkaEvent;
      console.log(`[KafkaEventWaiter] Received event: ${event.eventType}`);

      // ← ИСПРАВЛЕНО: проверяем `eventType === 'UserCreated'`
      if (event.eventType === 'UserCreated') {
        const userId = event.payload?.userId;
        if (userId) {
          this.resolveEvent(userId, event);
        }
      }
    } catch (error) {
      console.error('[KafkaEventWaiter] Error parsing event:', error);
    }
  }

  private resolveEvent(userId: string, event: KafkaEvent): void {
    const resolver = this.eventResolvers.get(userId);
    if (resolver) {
      resolver(event);
      this.eventResolvers.delete(userId);
    }
  }

  /**
   * Ждём событие о создании пользователя
   */
  async waitForUserCreated(
    userId: string,
    timeoutMs: number = 15000  // ← Увеличено до 15 секунд
  ): Promise<KafkaEvent | null> {
    if (!this.isInitialized || !this.consumer) {
      console.warn('[KafkaEventWaiter] Not initialized, skipping event wait');
      return null;
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        this.eventResolvers.delete(userId);
        console.log(`[KafkaEventWaiter] Timeout waiting for user ${userId}`);
        resolve(null);
      }, timeoutMs);

      this.eventResolvers.set(userId, (event) => {
        clearTimeout(timeoutId);
        resolve(event || null);
      });
    });
  }

  async disconnect(): Promise<void> {
    try {
      if (this.consumer) {
        await this.consumer.disconnect();
        console.log('[KafkaEventWaiter] Disconnected from Kafka');
      }
    } catch (error) {
      console.error('[KafkaEventWaiter] Error disconnecting:', error);
    }
  }
}