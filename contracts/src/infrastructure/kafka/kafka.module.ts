// ./contracts/src/infrastructure/kafka/kafka.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { KafkaProducerService } from './KafkaProducer.service';
import { KafkaConsumerService } from './KafkaConsumer.service';
import { KafkaConfig } from './kafka.config';

@Module({})
export class KafkaModule {
  static forRoot(config: KafkaConfig): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        {
          provide: 'KAFKA_CONFIG',
          useValue: config,
        },
        {
          provide: KafkaProducerService,
          useFactory: (config: KafkaConfig) => new KafkaProducerService(config),
          inject: ['KAFKA_CONFIG'],
        },
        {
          provide: KafkaConsumerService,
          useFactory: (config: KafkaConfig) => new KafkaConsumerService(config),
          inject: ['KAFKA_CONFIG'],
        },
      ],
      exports: [KafkaProducerService, KafkaConsumerService],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => Promise<KafkaConfig> | KafkaConfig;
    inject?: any[];
  }): DynamicModule {
    return {
      module: KafkaModule,
      imports: options.imports || [],
      providers: [
        {
          provide: 'KAFKA_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: KafkaProducerService,
          useFactory: (config: KafkaConfig) => new KafkaProducerService(config),
          inject: ['KAFKA_CONFIG'],
        },
        {
          provide: KafkaConsumerService,
          useFactory: (config: KafkaConfig) => new KafkaConsumerService(config),
          inject: ['KAFKA_CONFIG'],
        },
      ],
      exports: [KafkaProducerService, KafkaConsumerService],
    };
  }

  static forConsumer(config: KafkaConfig): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        {
          provide: 'KAFKA_CONFIG',
          useValue: config,
        },
        {
          provide: KafkaConsumerService,
          useFactory: (config: KafkaConfig) => new KafkaConsumerService(config),
          inject: ['KAFKA_CONFIG'],
        },
      ],
      exports: [KafkaConsumerService],
    };
  }

  static forConsumerAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => Promise<KafkaConfig> | KafkaConfig;
    inject?: any[];
  }): DynamicModule {
    return {
      module: KafkaModule,
      imports: options.imports || [],
      providers: [
        {
          provide: 'KAFKA_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: KafkaConsumerService,
          useFactory: (config: KafkaConfig) => new KafkaConsumerService(config),
          inject: ['KAFKA_CONFIG'],
        },
      ],
      exports: [KafkaConsumerService],
    };
  }
}