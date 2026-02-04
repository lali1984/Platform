"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_KAFKA_CONFIG = void 0;
exports.DEFAULT_KAFKA_CONFIG = {
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
//# sourceMappingURL=kafka.config.js.map