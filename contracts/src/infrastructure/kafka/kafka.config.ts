// ./contracts/src/infrastructure/kafka/kafka.config.ts
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

export const DEFAULT_KAFKA_CONFIG: Partial<KafkaConfig> = {
  producer: {
    allowAutoTopicCreation: true,
    transactionTimeout: 30000,
    idempotent: false,
    retry: {
      initialRetryTime: 100,
      retries: 8,
    },
  },
  consumer: {
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    allowAutoTopicCreation: true,
    maxBytesPerPartition: 1048576,
    retry: {
      initialRetryTime: 100,
      retries: 8,
    },
  },
};

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