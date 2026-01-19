import kafka from '../config/kafka.config';
import { PlatformEvent, EventTopicMapping, EventType } from '../types/events';
import { v4 as uuidv4 } from 'uuid';

const producer = kafka.producer();

export class EventProducer {
  private static instance: EventProducer;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {
    console.log('🔧 EventProducer инициализирован');
  }

  public static getInstance(): EventProducer {
    if (!EventProducer.instance) {
      EventProducer.instance = new EventProducer();
    }
    return EventProducer.instance;
  }

  public async connect(): Promise<void> {
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
      } catch (error) {
        console.error('❌ Ошибка подключения к Kafka producer:', error);
        throw error;
      } finally {
        this.connectionPromise = null;
      }
    })();

    await this.connectionPromise;
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await producer.disconnect();
        this.isConnected = false;
        console.log('🔌 Kafka producer отключен');
      } catch (error) {
        console.error('❌ Ошибка отключения от Kafka producer:', error);
        throw error;
      }
    }
  }

  public async sendEvent(event: PlatformEvent): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    const topic = EventTopicMapping[event.type];
    
    if (!topic) {
      console.error(`❌ Неизвестный тип события: ${event.type}`);
      throw new Error(`Unknown event type: ${event.type}`);
    }

    try {
      // Создаем ключ для сообщения на основе данных события
      let key: string;
      
      // Безопасное извлечение userId или email
      if ('userId' in event.data && event.data.userId) {
        key = event.data.userId;
      } else if ('email' in event.data && event.data.email) {
        key = event.data.email;
      } else {
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
      
    } catch (error) {
      console.error(`❌ Ошибка отправки события ${event.type}:`, error);
      
      // Не пробрасываем ошибку дальше, чтобы не ломать основной flow
      // В продакшене можно добавить retry логику или отправить в dead letter queue
      console.log('⚠️ Событие не отправлено, но основной процесс продолжается');
    }
  }

  // Helper method для создания базового события
  public createBaseEvent(type: EventType, source: string, data: any): PlatformEvent {
    return {
      type,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      source,
      eventId: uuidv4(),
      data,
    } as PlatformEvent;
  }

  public getStatus(): { isConnected: boolean } {
    return {
      isConnected: this.isConnected,
    };
  }
}

export default EventProducer.getInstance();
