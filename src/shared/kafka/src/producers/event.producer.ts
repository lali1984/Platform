import kafka from '../config/kafka.config';
import { PlatformEvent } from '../types/events';

const producer = kafka.producer();

export class EventProducer {
  private static instance: EventProducer;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): EventProducer {
    if (!EventProducer.instance) {
      EventProducer.instance = new EventProducer();
    }
    return EventProducer.instance;
  }

  public async connect(): Promise<void> {
    if (!this.isConnected) {
      await producer.connect();
      this.isConnected = true;
      console.log('Kafka producer connected successfully');
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await producer.disconnect();
      this.isConnected = false;
      console.log('Kafka producer disconnected');
    }
  }

  public async sendEvent(event: PlatformEvent): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    const topic = this.getTopicFromEventType(event.type);
    
    try {
      await producer.send({
        topic,
        messages: [
          {
            key: event.data.userId || 'system',
            value: JSON.stringify(event),
            headers: {
              'event-type': event.type,
              'event-version': event.version,
              'event-source': event.source,
              'timestamp': event.timestamp,
            },
          },
        ],
      });
      
      console.log(`Event ${event.type} sent to topic ${topic}`);
    } catch (error) {
      console.error(`Failed to send event ${event.type}:`, error);
      throw error;
    }
  }

  private getTopicFromEventType(eventType: string): string {
    // Преобразуем event.type в имя топика
    // Пример: 'user.registered' -> 'user-events'
    const prefix = eventType.split('.')[0];
    return `${prefix}-events`;
  }
}

export default EventProducer.getInstance();
