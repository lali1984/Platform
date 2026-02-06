// ./04_user-service/src/infrastructure/kafka/kafka-bootstrap.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { 
  KafkaConsumerService, 
  KafkaProducerService 
} from '@platform/contracts';
import { HandleUserRegisteredEventUseCase } from '../../application/use-cases/handle-user-registered-event';

@Injectable()
export class KafkaBootstrapService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaBootstrapService.name);
  private isInitialized = false;
  private isHealthy = false;
  private startTime = Date.now();
  private readonly healthCheckInterval = 30000;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  // Метрики
  private metrics = {
    messagesProcessed: 0,
    errors: 0,
    lastMessageTime: null as Date | null,
    reconnectAttempts: 0,
    consumerLag: 0, // НОВОЕ: отслеживание lag
  };

  constructor(
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly handleUserRegisteredEvent: HandleUserRegisteredEventUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.initializeKafka();
      this.startHealthChecks();
    } catch (error) {
      this.logger.error('Failed to initialize Kafka:', error);
      // Сервис продолжает работу без Kafka
    }
  }

  private async initializeKafka(): Promise<void> {
    try {
      this.logger.log('🚀 Initializing Kafka infrastructure...');

      // 1. Инициализируем producer
      await this.kafkaProducer.connect();
      this.logger.log('✅ Kafka producer connected');

      // 2. Подключаем consumer (но не запускаем)
      await this.kafkaConsumer.connect();
      this.logger.log('✅ Kafka consumer connected');

      // 3. ПОДПИСЫВАЕМСЯ на топики
      await this.setupSubscriptions();

      // 4. ЗАПУСКАЕМ consumer ПОСЛЕ подписки
      await this.kafkaConsumer.start(); // ИЗМЕНЕНО: используем новый метод
      
      this.isInitialized = true;
      this.isHealthy = true;
      this.startTime = Date.now();
      
      this.logger.log('🎉 Kafka infrastructure fully initialized and healthy');

    } catch (error) {
      this.logger.error('❌ Failed to initialize Kafka infrastructure:', error);
      this.isHealthy = false;
      this.metrics.reconnectAttempts++;
      
      // Пробуем реконнект через 10 секунд
      setTimeout(() => this.attemptReconnect(), 10000);
      
      throw error;
    }
  }

  private async setupSubscriptions(): Promise<void> {
    try {
      this.logger.log('📝 Setting up Kafka subscriptions...');
      
      // ИСПРАВЛЕНО: используем новый метод subscribe
      await this.kafkaConsumer.subscribe(
        'auth-service.user-registered.v1',
        this.handleUserRegisteredMessage.bind(this)
      );
      
      this.logger.log('✅ Subscribed to auth-service.user-registered.v1');

      // НОВОЕ: можно подписаться на дополнительные топики
      // await this.kafkaConsumer.subscribe(
      //   'auth-service.user-logged-in.v1',
      //   this.handleUserLoggedInMessage.bind(this)
      // );

    } catch (error) {
      this.logger.error('❌ Failed to setup subscriptions:', error);
      throw error;
    }
  }

  private async handleUserRegisteredMessage(message: any): Promise<void> {
    const startTime = Date.now();
    const messageId = message.eventId || 'unknown';
    
    try {
      this.logger.debug(`📨 Processing message ${messageId}`);
      
      // НОВОЕ: валидация сообщения
      const validationResult = this.validateMessage(message);
      if (!validationResult.isValid) {
        this.logger.error(`Invalid message ${messageId}:`, validationResult.errors);
        // PRODUCTION: отправляем в DLQ
        await this.sendToDeadLetterQueue(message, new Error(`Invalid message: ${validationResult.errors.join(', ')}`));
        return;
      }
      
      await this.handleUserRegisteredEvent.execute(message);
      
      const processingTime = Date.now() - startTime;
      this.metrics.messagesProcessed++;
      this.metrics.lastMessageTime = new Date();
      
      this.logger.log(`✅ Processed message ${messageId} in ${processingTime}ms`);
      
    } catch (error) {
      this.metrics.errors++;
      this.logger.error(`❌ Failed to process message ${messageId}:`, error);
      
      // НОВОЕ: пробуем retry с exponential backoff
      await this.retryMessageProcessing(message, error as Error, 0);
    }
  }

  // НОВЫЙ МЕТОД: валидация сообщений
  private validateMessage(message: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!message?.eventId) {
      errors.push('Missing eventId');
    }
    
    if (!message?.data?.userId) {
      errors.push('Missing userId in data');
    }
    
    if (!message?.data?.email) {
      errors.push('Missing email in data');
    }
    
    // Проверка формата UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (message?.data?.userId && !uuidRegex.test(message.data.userId)) {
      errors.push('Invalid userId format (must be UUID)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // НОВЫЙ МЕТОД: retry с exponential backoff
  private async retryMessageProcessing(
    message: any,
    error: Error,
    attempt: number,
    maxAttempts: number = 3
  ): Promise<void> {
    const messageId = message.eventId || 'unknown';
    
    if (attempt >= maxAttempts) {
      this.logger.error(`❌ Max retries exceeded for message ${messageId}. Sending to DLQ.`);
      await this.sendToDeadLetterQueue(message, error);
      return;
    }
    
    const delay = Math.min(30000, 1000 * Math.pow(2, attempt)); // Exponential backoff
    
    this.logger.warn(`⚠️ Retry attempt ${attempt + 1}/${maxAttempts} for message ${messageId} in ${delay}ms`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      await this.handleUserRegisteredEvent.execute(message);
      this.logger.log(`✅ Successfully processed message ${messageId} on retry ${attempt + 1}`);
    } catch (retryError) {
      await this.retryMessageProcessing(message, retryError as Error, attempt + 1, maxAttempts);
    }
  }

  // НОВЫЙ МЕТОД: отправка в DLQ
  private async sendToDeadLetterQueue(message: any, error: Error): Promise<void> {
    try {
      const dlqMessage = {
        originalMessage: message,
        error: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString(),
        service: 'user-service',
      };
      
      await this.kafkaProducer.publishEvent(
        'user-service.dlq.v1',
        {
          eventId: `${message.eventId || 'unknown'}-dlq`,
          eventType: 'DeadLetterQueue',
          eventVersion: '1.0.0',
          timestamp: new Date().toISOString(),
          payload: dlqMessage,
          metadata: {
            sourceService: 'user-service',
            originalTopic: 'auth-service.user-registered.v1',
          },
        },
        {
          key: message.eventId || 'unknown',
        }
      );
      
      this.logger.log(`📭 Message sent to DLQ: ${message.eventId || 'unknown'}`);
    } catch (dlqError) {
      this.logger.error(`❌ Failed to send message to DLQ:`, dlqError);
      // Если не можем отправить в DLQ, хотя бы логируем
      this.logger.error(`💀 CRITICAL: Lost message ${message.eventId}:`, {
        message,
        originalError: error.message,
        dlqError: (dlqError as Error).message,
      });
    }
  }

  private startHealthChecks(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        this.logger.error('Health check failed:', error);
      }
    }, this.healthCheckInterval);
  }

  private async performHealthCheck(): Promise<void> {
    try {
      // Проверяем подключение и состояние
      const isAlive = this.isInitialized && await this.checkConnection();
      
      if (!isAlive) {
        this.isHealthy = false;
        this.logger.warn('⚠️ Kafka health check failed. Attempting to reconnect...');
        await this.attemptReconnect();
      } else {
        this.isHealthy = true;
        this.logger.debug('✅ Kafka health check passed');
      }
      
    } catch (error) {
      this.logger.error('Health check error:', error);
      this.isHealthy = false;
    }
  }

  private async checkConnection(): Promise<boolean> {
    try {
      // Проверяем статус consumer
      const consumerStatus = this.kafkaConsumer.getStatus();
      return consumerStatus.isConnected && consumerStatus.isRunning;
    } catch (error) {
      return false;
    }
  }

  private async attemptReconnect(): Promise<void> {
    if (this.metrics.reconnectAttempts >= 5) {
      this.logger.error('❌ Max reconnect attempts reached. Giving up.');
      return;
    }
    
    this.metrics.reconnectAttempts++;
    this.logger.log(`Attempting Kafka reconnection (attempt ${this.metrics.reconnectAttempts}/5)...`);
    
    try {
      // Останавливаем и переинициализируем
      await this.safeShutdown();
      await this.initializeKafka();
      
      this.logger.log('✅ Kafka reconnected successfully');
    } catch (error) {
      this.logger.error('❌ Kafka reconnection failed:', error);
      
      // Экспоненциальная задержка
      const delay = Math.min(30000, 5000 * Math.pow(2, this.metrics.reconnectAttempts));
      setTimeout(() => this.attemptReconnect(), delay);
    }
  }

  private async safeShutdown(): Promise<void> {
    try {
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
        this.healthCheckTimer = null;
      }
      
      // Останавливаем consumer если запущен
      await this.kafkaConsumer.stop();
      
      // Отключаем соединения
      await this.kafkaConsumer.disconnect();
      await this.kafkaProducer.disconnect();
      
    } catch (error) {
      this.logger.warn('Error during safe shutdown:', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.safeShutdown();
    this.logger.log('✅ Kafka infrastructure shut down');
  }

  // Public methods
  async initializeConsumer(): Promise<void> {
    return this.onModuleInit();
  }

  async disconnect(): Promise<void> {
    return this.onModuleDestroy();
  }

  async getHealthStatus(): Promise<{
    status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
    details: {
      initialized: boolean;
      healthy: boolean;
      uptime: number;
      messagesProcessed: number;
      errors: number;
      reconnectAttempts: number;
      lastMessageTime: string | null;
      consumerLag: number;
    };
    message: string;
  }> {
    const uptime = this.isInitialized ? Date.now() - this.startTime : 0;
    
    return {
      status: this.isHealthy ? 'HEALTHY' : (this.isInitialized ? 'DEGRADED' : 'UNHEALTHY'),
      details: {
        initialized: this.isInitialized,
        healthy: this.isHealthy,
        uptime,
        messagesProcessed: this.metrics.messagesProcessed,
        errors: this.metrics.errors,
        reconnectAttempts: this.metrics.reconnectAttempts,
        lastMessageTime: this.metrics.lastMessageTime?.toISOString() || null,
        consumerLag: this.metrics.consumerLag,
      },
      message: this.isHealthy 
        ? 'Kafka infrastructure is fully operational'
        : this.isInitialized
        ? 'Kafka is running in degraded mode'
        : 'Kafka is not initialized'
    };
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptime: this.isInitialized ? Date.now() - this.startTime : 0,
      initialized: this.isInitialized,
      healthy: this.isHealthy,
    };
  }
}