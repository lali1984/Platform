import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private consumer;
    private connected;
    private handlers;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    subscribe(topic: string, handler: (message: any) => Promise<void>): Promise<void>;
    private handleMessage;
    isConnected(): boolean;
    getStatus(): {
        isConnected: boolean;
        topics: string[];
    };
    getSubscriptions(): string[];
    unsubscribe(topic: string): Promise<void>;
}
