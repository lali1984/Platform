import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
export declare class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
    private producer;
    private isConnected;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    connect(): Promise<void>;
    shutdown(): Promise<void>;
}
