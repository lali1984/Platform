import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { KafkaConsumerService, KafkaProducerService } from '@platform/contracts';
import { HandleUserRegisteredEventUseCase } from '../../application/use-cases/handle-user-registered-event.use-case';
export declare class KafkaBootstrapService implements OnModuleInit, OnModuleDestroy {
    private readonly kafkaConsumer;
    private readonly kafkaProducer;
    private readonly handleUserRegisteredEvent;
    private readonly logger;
    private isInitialized;
    private isHealthy;
    private startTime;
    private readonly healthCheckInterval;
    private healthCheckTimer;
    private metrics;
    constructor(kafkaConsumer: KafkaConsumerService, kafkaProducer: KafkaProducerService, handleUserRegisteredEvent: HandleUserRegisteredEventUseCase);
    onModuleInit(): Promise<void>;
    private initializeKafka;
    private setupSubscriptions;
    private handleUserRegisteredMessage;
    private validateMessage;
    private retryMessageProcessing;
    private sendToDeadLetterQueue;
    private startHealthChecks;
    private performHealthCheck;
    private checkConnection;
    private attemptReconnect;
    private safeShutdown;
    onModuleDestroy(): Promise<void>;
    initializeConsumer(): Promise<void>;
    disconnect(): Promise<void>;
    getHealthStatus(): Promise<{
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
    }>;
    getMetrics(): {
        uptime: number;
        initialized: boolean;
        healthy: boolean;
        messagesProcessed: number;
        errors: number;
        lastMessageTime: Date | null;
        reconnectAttempts: number;
        consumerLag: number;
    };
}
