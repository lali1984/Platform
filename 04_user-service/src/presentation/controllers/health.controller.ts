// ./04_user-service/src/presentation/controllers/health.controller.ts
import { 
  Controller, 
  Get, 
  Injectable, 
  Logger,
  ServiceUnavailableException,
  InternalServerErrorException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { 
  HealthCheck, 
  HealthCheckService, 
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthCheckResult,
  HealthIndicatorResult,
  HealthIndicatorStatus
} from '@nestjs/terminus';
import { KafkaConsumerService, KafkaProducerService } from '@platform/contracts';
import { Connection } from 'typeorm';

// Упрощенный интерфейс без наследования
export interface ExtendedHealthCheckResult {
  status: 'ok' | 'error';
  info?: {
    service: string;
    version: string;
    environment: string;
    timestamp: string;
    uptime: number;
  };
  details?: {
    database: HealthIndicatorResult;
    kafka: HealthIndicatorResult;
    memory: HealthIndicatorResult;
    disk: HealthIndicatorResult;
  };
  metrics?: {
    database: {
      poolSize: number;
      connected: boolean;
    };
    kafka: {
      consumerConnected: boolean;
      producerConnected: boolean;
      topics: string[];
    };
    memory: {
      heapUsed: number;
      heapTotal: number;
      rss: number;
    };
  };
  message?: string;
}

@ApiTags('Health')
@Controller('')
@Injectable()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly connection: Connection,
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  @Get('helth')
  @HealthCheck()
  @ApiOperation({ summary: 'Полная проверка здоровья сервиса' })
  @ApiResponse({ status: 200, description: 'Сервис здоров' })
  @ApiResponse({ status: 503, description: 'Сервис нездоров' })
  async check(): Promise<ExtendedHealthCheckResult> {
    try {
      // Запускаем health checks
      const healthResult = await this.health.check([
        () => this.checkDatabase(),
        () => this.checkKafka(),
        () => this.checkMemory(),
        () => this.checkDisk(),
      ]);

      // Получаем метрики
      const metrics = await this.getMetrics();
      
      // Собираем результат
      const extendedResult: ExtendedHealthCheckResult = {
        status: 'ok',
        info: this.getServiceInfo(),
        metrics,
        details: {
          database: this.getHealthIndicatorResult(healthResult, 'database'),
          kafka: this.getHealthIndicatorResult(healthResult, 'kafka'),
          memory: this.getHealthIndicatorResult(healthResult, 'memory_heap'),
          disk: this.getHealthIndicatorResult(healthResult, 'disk'),
        },
        message: 'Service is healthy',
      };

      // Проверяем критичные зависимости
      const dbStatus = this.getIndicatorStatus(extendedResult.details?.database);
      const kafkaStatus = this.getIndicatorStatus(extendedResult.details?.kafka);

      if (dbStatus === 'down') {
        this.logger.error('Database is down');
        extendedResult.status = 'error';
        extendedResult.message = 'Database unavailable';
        throw new ServiceUnavailableException('Database unavailable');
      }

      if (kafkaStatus === 'down') {
        this.logger.warn('Kafka is down - service running in degraded mode');
        // Kafka может быть down, но сервис продолжает работу
        extendedResult.message = 'Service running in degraded mode (Kafka down)';
      }

      return extendedResult;

    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'error',
        message: 'Service is unhealthy',
        info: this.getServiceInfo(),
      };
    }
  }

  @Get('helth/live')
  @ApiOperation({ summary: 'Liveness probe - проверка что сервис жив' })
  @ApiResponse({ status: 200, description: 'Сервис жив' })
  async liveness(): Promise<{ status: string; timestamp: string }> {
    // Простейшая проверка - сервис отвечает на запросы
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('helth/ready')
  @ApiOperation({ summary: 'Readiness probe - готовность принимать трафик' })
  @ApiResponse({ status: 200, description: 'Сервис готов' })
  @ApiResponse({ status: 503, description: 'Сервис не готов' })
  async readiness(): Promise<{ status: string; checks: any[] }> {
    const checks = [];
    let isReady = true;

    // Проверяем БД
    try {
      const dbResult = await this.checkDatabase();
      checks.push({ 
        service: 'database', 
        status: 'healthy',
        details: dbResult.database,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      checks.push({ 
        service: 'database', 
        status: 'unhealthy', 
        error: errorMessage 
      });
      isReady = false;
    }

    // Kafka не обязательна для readiness (сервис может работать без нее)
    try {
      const kafkaResult = await this.checkKafka();
      const consumerStatus = this.kafkaConsumer.getStatus();
      
      checks.push({ 
        service: 'kafka', 
        status: consumerStatus.isConnected ? 'healthy' : 'degraded',
        isConnected: consumerStatus.isConnected,
        details: kafkaResult.kafka,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      checks.push({ 
        service: 'kafka', 
        status: 'unhealthy', 
        error: errorMessage 
      });
      // Kafka ошибка не делает сервис не ready
    }

    if (!isReady) {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        checks,
        message: 'Service is not ready to accept traffic',
      });
    }

    return {
      status: 'ready',
      checks,
    };
  }

  @Get('helth/database')
  @ApiOperation({ summary: 'Проверка состояния базы данных' })
  async checkDatabaseHealth(): Promise<any> {
    try {
      const result = await this.checkDatabase();
      
      // Дополнительная информация о подключении
      const driver = this.connection.driver as any;
      const pool = driver.pool;
      const poolInfo = pool ? {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
      } : null;

      return {
        status: 'healthy',
        details: {
          database: this.connection.options.database,
          // Используем безопасное извлечение host и port
          host: (this.connection.options as any).host || 'unknown',
          port: (this.connection.options as any).port || 'unknown',
          pool: poolInfo,
          migrations: await this.checkMigrations(),
        },
        ...result,
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error),
        details: {
          database: this.connection.options.database,
          connected: this.connection.isConnected,
        },
      };
    }
  }

  @Get('helth/kafka')
  @ApiOperation({ summary: 'Проверка состояния Kafka' })
  async checkKafkaHealth(): Promise<any> {
    try {
      const result = await this.checkKafka();
      
      const consumerStatus = this.kafkaConsumer.getStatus();
      const producerStatus = this.kafkaProducer.getStatus();

      return {
        status: 'healthy',
        details: {
          consumer: {
            isConnected: consumerStatus.isConnected,
            isRunning: consumerStatus.isRunning,
            topics: consumerStatus.topics,
            subscribedTopicsCount: consumerStatus.subscribedTopicsCount,
          },
          producer: {
            isConnected: producerStatus.isConnected,
            circuitBreakerState: (producerStatus as any).circuitBreakerState ?? 'not_implemented',
            failureCount: (producerStatus as any).failureCount ?? 0,
          },
        },
        ...result,
      };
    } catch (error) {
      this.logger.error('Kafka health check failed:', error);
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error),
        details: {
          consumer: this.kafkaConsumer.getStatus(),
          producer: this.kafkaProducer.getStatus(),
        },
      };
    }
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    return this.db.pingCheck('database', {
      timeout: 3000,
      connection: this.connection,
    });
  }

  private async checkKafka(): Promise<HealthIndicatorResult> {
    const consumerStatus = this.kafkaConsumer.getStatus();
    const producerStatus = this.kafkaProducer.getStatus();

    const isHealthy = consumerStatus.isConnected && producerStatus.isConnected;

    return {
      kafka: {
        status: isHealthy ? 'up' : 'down',
        consumerConnected: consumerStatus.isConnected,
        producerConnected: producerStatus.isConnected,
        topics: consumerStatus.topics,
        subscribedTopicsCount: consumerStatus.subscribedTopicsCount,
        circuitBreakerState: (producerStatus as any).circuitBreakerState ?? 'not_implemented',
      },
    };
  }

  private async checkMemory(): Promise<HealthIndicatorResult> {
    // Проверка heap памяти (150MB threshold)
    return this.memory.checkHeap('memory_heap', 150 * 1024 * 1024);
  }

  private async checkDisk(): Promise<HealthIndicatorResult> {
    // Проверка диска (90% threshold)
    return this.disk.checkStorage('disk', {
      thresholdPercent: 0.9,
      path: process.cwd(),
    });
  }

  private getServiceInfo() {
    return {
      service: 'user-service',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      nodeVersion: process.version,
      pid: process.pid,
    };
  }

  private async getMetrics() {
    const memoryUsage = process.memoryUsage();
    const driver = this.connection.driver as any;
    
    return {
      database: {
        poolSize: driver.pool?.totalCount || 0,
        connected: this.connection.isConnected,
      },
      kafka: {
        consumerConnected: this.kafkaConsumer.getStatus().isConnected,
        producerConnected: this.kafkaProducer.getStatus().isConnected,
        topics: this.kafkaConsumer.getStatus().topics,
      },
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      },
    };
  }

  private async checkMigrations(): Promise<{ pending: number; applied: number }> {
    try {
      const queryRunner = this.connection.createQueryRunner();
      const migrationsTable = (this.connection.options as any).migrationsTableName || 'migrations';
      
      const appliedMigrations = await queryRunner.query(
        `SELECT * FROM "${migrationsTable}" ORDER BY "timestamp" DESC`
      );
      
      const allMigrations = this.connection.migrations || [];
      
      return {
        pending: allMigrations.length - appliedMigrations.length,
        applied: appliedMigrations.length,
      };
    } catch (error) {
      this.logger.warn('Failed to check migrations:', error);
      return { pending: -1, applied: -1 };
    }
  }

  private getHealthIndicatorResult(
    healthResult: HealthCheckResult, 
    key: string
  ): HealthIndicatorResult {
    const result = healthResult.info?.[key];
    if (result && typeof result === 'object' && 'status' in result) {
      return result as HealthIndicatorResult;
    }
    
    // Возвращаем дефолтный результат
    return {
      [key]: {
        status: 'down',
        message: 'Health check not available',
      }
    };
  }

  private getIndicatorStatus(indicator?: HealthIndicatorResult): HealthIndicatorStatus | 'unknown' {
    if (!indicator) return 'unknown';
    
    // Находим первый ключ в объекте
    const firstKey = Object.keys(indicator)[0];
    if (firstKey && indicator[firstKey] && typeof indicator[firstKey] === 'object') {
      const healthInfo = indicator[firstKey] as any;
      return healthInfo.status || 'unknown';
    }
    
    return 'unknown';
  }
}