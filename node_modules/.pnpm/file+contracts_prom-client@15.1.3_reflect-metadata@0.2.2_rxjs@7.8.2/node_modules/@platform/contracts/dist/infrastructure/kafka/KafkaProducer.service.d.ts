/**
 * NOTE: This file should NOT contain CircuitBreaker implementation.
 * Circuit breaker pattern should be applied at service level (e.g., event-relay),
 * not in shared contracts package.
 *
 * For production use, services should wrap Kafka operations with CircuitBreaker
 * from their own implementation (e.g., event-relay/src/infrastructure/messaging/CircuitBreaker.ts)
 */
export interface KafkaConfig {
    brokers: string[];
    clientId: string;
    ssl?: boolean;
    sasl?: {
        mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
        username: string;
        password: string;
    };
}
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
export declare class KafkaProducerService {
    private readonly config;
    private producer;
    private isConnected;
    constructor(config: KafkaConfig);
    connect(): Promise<void>;
    publishEvent(topic: string, event: EventMessage, options?: {
        key?: string;
        headers?: Record<string, string>;
        partition?: number;
        timeout?: number;
    }): Promise<boolean>;
    disconnect(): Promise<void>;
    getStatus(): {
        isConnected: boolean;
    };
}
export declare const createKafkaProducer: (config: KafkaConfig) => KafkaProducerService;
//# sourceMappingURL=KafkaProducer.service.d.ts.map