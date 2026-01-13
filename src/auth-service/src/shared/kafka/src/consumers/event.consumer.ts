import kafka from '../config/kafka.config';
import { EventType, PlatformEvent } from '../types/events';

export interface EventHandler {
  eventType: EventType;
  handle: (event: PlatformEvent) => Promise<void>;
}

export class EventConsumer {
  private consumer = kafka.consumer({ 
    groupId: process.env.KAFKA_CONSUMER_GROUP || 'platform-consumers' 
  });
  private handlers: Map<EventType, EventHandler[]> = new Map();
  private isRunning = false;

  public async connect(): Promise<void> {
    await this.consumer.connect();
    console.log('Kafka consumer connected successfully');
  }

  public async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    this.isRunning = false;
    console.log('Kafka consumer disconnected');
  }

  public registerHandler(handler: EventHandler): void {
    if (!this.handlers.has(handler.eventType)) {
      this.handlers.set(handler.eventType, []);
    }
    this.handlers.get(handler.eventType)!.push(handler);
    console.log(`Handler registered for event: ${handler.eventType}`);
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Consumer is already running');
      return;
    }

    // Подписываемся на все топики, для которых есть handlers
    const topics = Array.from(this.handlers.keys()).map(eventType => 
      `${eventType.split('.')[0]}-events`
    );
    
    const uniqueTopics = [...new Set(topics)];
    
    await this.consumer.subscribe({ 
      topics: uniqueTopics,
      fromBeginning: false 
    });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          if (!message.value) return;

          const event: PlatformEvent = JSON.parse(message.value.toString());
          const handlers = this.handlers.get(event.type as EventType) || [];

          console.log(`Processing event ${event.type} from topic ${topic}`);

          // Запускаем все обработчики для этого типа события
          await Promise.all(
            handlers.map(handler => handler.handle(event))
          );

        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });

    this.isRunning = true;
    console.log(`Kafka consumer started for topics: ${uniqueTopics.join(', ')}`);
  }

  public async stop(): Promise<void> {
    if (this.isRunning) {
      await this.consumer.stop();
      this.isRunning = false;
      console.log('Kafka consumer stopped');
    }
  }
}

export default new EventConsumer();
