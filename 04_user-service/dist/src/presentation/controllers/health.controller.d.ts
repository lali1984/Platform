import { HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { KafkaConsumerService, KafkaProducerService } from '@platform/contracts';
import { Connection } from 'typeorm';
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
export declare class HealthController {
    private readonly health;
    private readonly db;
    private readonly memory;
    private readonly disk;
    private readonly connection;
    private readonly kafkaConsumer;
    private readonly kafkaProducer;
    private readonly logger;
    private readonly startTime;
    constructor(health: HealthCheckService, db: TypeOrmHealthIndicator, memory: MemoryHealthIndicator, disk: DiskHealthIndicator, connection: Connection, kafkaConsumer: KafkaConsumerService, kafkaProducer: KafkaProducerService);
    check(): Promise<ExtendedHealthCheckResult>;
    liveness(): Promise<{
        status: string;
        timestamp: string;
    }>;
    readiness(): Promise<{
        status: string;
        checks: any[];
    }>;
    checkDatabaseHealth(): Promise<any>;
    checkKafkaHealth(): Promise<any>;
    private checkDatabase;
    private checkKafka;
    private checkMemory;
    private checkDisk;
    private getServiceInfo;
    private getMetrics;
    private checkMigrations;
    private getHealthIndicatorResult;
    private getIndicatorStatus;
}
