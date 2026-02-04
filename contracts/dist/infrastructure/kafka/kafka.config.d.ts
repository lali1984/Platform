export interface KafkaConfig {
    brokers: string[];
    clientId: string;
    ssl?: boolean;
    sasl?: {
        mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
        username: string;
        password: string;
    };
    producer?: {
        allowAutoTopicCreation?: boolean;
        transactionTimeout?: number;
        idempotent?: boolean;
        retry?: {
            initialRetryTime?: number;
            retries?: number;
        };
    };
    consumer?: {
        groupId?: string;
        sessionTimeout?: number;
        heartbeatInterval?: number;
        allowAutoTopicCreation?: boolean;
        maxBytesPerPartition?: number;
        retry?: {
            initialRetryTime?: number;
            retries?: number;
        };
    };
}
export declare const DEFAULT_KAFKA_CONFIG: Partial<KafkaConfig>;
export interface EventMessage {
    eventId: string;
    eventType: string;
    eventVersion: string;
    timestamp: string;
    aggregateId?: string;
    payload: any;
    metadata?: {
        sourceService: string;
        correlationId?: string;
        [key: string]: any;
    };
}
//# sourceMappingURL=kafka.config.d.ts.map