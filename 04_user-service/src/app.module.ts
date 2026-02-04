import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaModule } from '@platform/contracts';
import * as path from 'path';

// Сущности
import { UserProfileEntity } from './infrastructure/persistence/user-profile.entity';
import { OutboxEventEntity } from './infrastructure/persistence/outbox-event.entity';

// Контроллеры
import { UserController } from './presentation/controllers/user.controller';
import { HealthController } from './presentation/controllers/health.controller';

// Use Cases
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { HandleUserRegisteredEventUseCase } from './application/use-cases/handle-user-registered-event.use-case';

// Репозитории
import { UserTypormRepository } from './infrastructure/persistence/user.typeorm.repository';

// Мапперы
import { UserMapper } from './application/mappers/user.mapper';

// Сервисы
import { OutboxEventPublisher } from './infrastructure/messaging/outbox-event-publisher.service';
import { EventValidator } from './application/validators/event.validator';
// Порты
import { EventPublisher } from './domain/ports/event-publisher.port';
import { KafkaBootstrapService } from './infrastructure/kafka/kafka-bootstrap.service';
import { TerminusModule } from '@nestjs/terminus';

@Module({

  
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'pretty',
    }),

    // 1. Config Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '.env.local'),
        path.resolve(process.cwd(), '.env.development'),
      ],
    }),
    
    // 2. Kafka Module с безопасной конфигурацией
    KafkaModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const brokers = configService.get('KAFKA_BROKERS', 'kafka:9092').split(',');
    
    return {
      brokers,
      clientId: configService.get('KAFKA_CLIENT_ID', 'user-service'),
      
      // PRODUCTION настройки соединения
      connectionTimeout: 10000,           // 10 секунд
      authenticationTimeout: 5000,        // 5 секунд
      reauthenticationThreshold: 10000,   // 10 секунд
      
      // PRODUCTION настройки consumer
      consumer: {
        groupId: configService.get('KAFKA_CONSUMER_GROUP_ID', 'user-service-group'),
        sessionTimeout: parseInt(configService.get('KAFKA_CONSUMER_SESSION_TIMEOUT', '60000')),
        heartbeatInterval: parseInt(configService.get('KAFKA_CONSUMER_HEARTBEAT_INTERVAL', '15000')),
        maxPollInterval: parseInt(configService.get('KAFKA_CONSUMER_MAX_POLL_INTERVAL', '300000')),
        maxPollRecords: parseInt(configService.get('KAFKA_CONSUMER_MAX_POLL_RECORDS', '500')),
        allowAutoTopicCreation: true,
        maxWaitTimeInMs: 5000,
        retry: {
          initialRetryTime: 100,
          maxRetryTime: 30000,
          retries: 10,
        },
      },
      
      // PRODUCTION настройки producer
      producer: {
        allowAutoTopicCreation: true,
        transactionTimeout: 60000,
        idempotent: true,
        maxInFlightRequests: 5,
        retry: {
          initialRetryTime: 100,
          maxRetryTime: 30000,
          retries: 10,
        },
      },
    };
  },
  inject: [ConfigService],
}),
    
    // 3. TypeORM Module с production настройками
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        
        return {
          type: 'postgres',
          host: configService.get('DATABASE_HOST', 'postgres-user'),
          port: parseInt(configService.get('DATABASE_PORT', '5432')),
          username: configService.get('DATABASE_USERNAME', 'admin'),
          password: configService.get('DATABASE_PASSWORD', 'secret'),
          database: configService.get('DATABASE_NAME', 'user_db'),
          entities: [UserProfileEntity, OutboxEventEntity],
          migrations: [path.join(__dirname, 'infrastructure/migrations/*.{ts,js}')],
          migrationsTableName: 'typeorm_migrations_history',
          migrationsRun: configService.get('RUN_MIGRATIONS', 'false') === 'true',
          synchronize: false, // Никогда не используем в production
          logging: isProduction 
            ? ['error', 'warn', 'migration'] 
            : ['query', 'error', 'warn', 'migration'],
          autoLoadEntities: false,
          maxQueryExecutionTime: 1000,
          poolSize: parseInt(configService.get('DATABASE_POOL_SIZE', '10')),
          extra: {
            max: parseInt(configService.get('DATABASE_POOL_MAX', '20')),
            connectionTimeoutMillis: 5000,
            idleTimeoutMillis: 30000,
          },
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
      inject: [ConfigService],
    }),
    
    // 4. TypeORM entities для репозиториев
    TypeOrmModule.forFeature([UserProfileEntity, OutboxEventEntity]),
  ],
  controllers: [
    UserController,
    HealthController,
  ],
  providers: [
    // Репозитории
    {
      provide: 'UserRepository',
      useClass: UserTypormRepository,
    },
    
    // Event Publisher порт
    {
      provide: 'EventPublisher',
      useClass: OutboxEventPublisher,

    },

    EventValidator,
    // Use Cases
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ListUsersUseCase,
    HandleUserRegisteredEventUseCase,
    
    // Мапперы
    UserMapper,
    
    // Сервисы
    OutboxEventPublisher,
    
    // Kafka Bootstrap Service
    KafkaBootstrapService,
  ],
  exports: [
    'UserRepository',
    'EventPublisher',
    KafkaModule,
  ],
})
export class AppModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly kafkaBootstrapService: KafkaBootstrapService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const nodeEnv = this.configService.get('NODE_ENV', 'development');
    const isProduction = nodeEnv === 'production';
    
    console.log(`Starting User Service in ${nodeEnv} mode...`);
    
    try {
      // Инициализируем Kafka consumer если нужно
      if (isProduction || this.configService.get('KAFKA_ENABLE_CONSUMER') === 'true') {
        console.log('Initializing Kafka consumer...');
        // Метод будет реализован в KafkaBootstrapService
        await this.kafkaBootstrapService.onModuleInit?.();
        console.log('Kafka consumer initialized');
      }
      
      console.log('User Service initialization completed successfully');
      
    } catch (error) {
      console.error('Failed to initialize User Service:', error);
      
      // В production не падаем сразу
      if (isProduction) {
        console.warn('Service starting in degraded mode. Some features may be unavailable.');
      } else {
        throw error;
      }
    }
  }

  async onModuleDestroy() {
    console.log('Shutting down User Service...');
    
    try {
      await this.kafkaBootstrapService.onModuleDestroy?.();
      console.log('User Service shutdown completed');
    } catch (error) {
      console.error('Error during shutdown:', error);
    }
  }
}