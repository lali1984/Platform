import { KafkaConfig } from './kafka.config';
export interface MessageHandler {
    (message: any): Promise<void>;
}
export declare class KafkaConsumerService {
    private readonly config;
    private consumer;
    private isConnected;
    private isRunning;
    private handlers;
    private subscribedTopics;
    constructor(config: KafkaConfig);
    connect(): Promise<void>;
    subscribe(topic: string, handler: MessageHandler): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    private handleMessage;
    disconnect(): Promise<void>;
    getSubscriptions(): string[];
    getStatus(): {
        isConnected: boolean;
        isRunning: boolean;
        topics: string[];
        subscribedTopicsCount: number;
    };
    private log;
}
//# sourceMappingURL=KafkaConsumer.service.d.ts.map