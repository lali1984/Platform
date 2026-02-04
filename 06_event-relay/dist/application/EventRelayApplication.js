"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventRelayApplication = exports.EventRelayApplication = void 0;
const DatabaseConfig_1 = require("../infrastructure/db/DatabaseConfig");
const OutboxReaderRepository_1 = require("../infrastructure/db/OutboxReaderRepository");
const KafkaProducerService_1 = require("../infrastructure/messaging/KafkaProducerService");
const metrics_service_1 = require("../infrastructure/metrics/metrics.service");
const CircuitBreaker_1 = require("../infrastructure/messaging/CircuitBreaker");
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'Unknown error';
}
class EventRelayApplication {
    constructor() {
        this.outboxReaders = new Map();
        this.isRunning = false;
        this.pollingInterval = null;
        this.POLLING_INTERVAL_MS = 5000;
        this.MAX_ATTEMPTS = 3;
        this.metricsService = (0, metrics_service_1.getEventRelayMetricsService)();
        this.serviceHealth = new Map();
        this.kafkaProducer = (0, KafkaProducerService_1.createKafkaProducer)({
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
            clientId: 'event-relay-producer',
        });
        this.circuitBreaker = (0, CircuitBreaker_1.createCircuitBreaker)({
            name: 'kafka-publisher',
            failureThreshold: 5,
            resetTimeout: 60000,
            timeout: 10000,
            halfOpenMaxAttempts: 3
        });
    }
    async initialize() {
        const startTime = Date.now();
        console.log('🚀 Initializing Event Relay Application...');
        try {
            this.metricsService.recordBusinessTransaction('application_initialization', 'success');
            await DatabaseConfig_1.databaseConfig.initializeDataSources();
            const services = DatabaseConfig_1.databaseConfig.getAllServices();
            for (const service of services) {
                const dataSource = DatabaseConfig_1.databaseConfig.getDataSource(service.name);
                if (dataSource) {
                    const reader = (0, OutboxReaderRepository_1.createOutboxReaderRepository)(dataSource, service);
                    this.outboxReaders.set(service.name, reader);
                    this.serviceHealth.set(service.name, true);
                    console.log(`✅ Created outbox reader for ${service.name}`);
                }
            }
            await this.kafkaProducer.connect();
            const kafkaStatus = this.kafkaProducer.getStatus();
            this.metricsService.setKafkaConnections(kafkaStatus.isConnected ? 1 : 0, kafkaStatus.isConnected ? 0 : 1, 'event-relay-producer');
            const duration = (Date.now() - startTime) / 1000;
            this.metricsService.recordBusinessTransaction('application_initialization', 'success');
            this.metricsService.setServiceHealth(true);
            console.log('✅ Event Relay Application initialized successfully');
            console.log(`📊 Monitoring ${this.outboxReaders.size} services`);
            this.metricsService.recordDatabaseQuery('initialize', 'outbox_events', duration, true);
        }
        catch (error) {
            const duration = (Date.now() - startTime) / 1000;
            this.metricsService.recordEventRelayError('processing', 'EventRelayApplication.initialize', error instanceof Error ? error : new Error(String(error)), false, { operation: 'initialize' });
            this.metricsService.recordBusinessTransaction('application_initialization', 'failed');
            this.metricsService.setServiceHealth(false);
            console.error('❌ Failed to initialize Event Relay Application:', error);
            throw error;
        }
    }
    async startPolling() {
        if (this.isRunning) {
            console.warn('⚠️ Polling already running');
            return;
        }
        this.isRunning = true;
        console.log('🔍 Starting event polling...');
        this.metricsService.recordBusinessTransaction('polling_start', 'success');
        await this.pollEvents();
        this.pollingInterval = setInterval(async () => {
            await this.pollEvents();
        }, this.POLLING_INTERVAL_MS);
        console.log(`⏰ Polling interval: ${this.POLLING_INTERVAL_MS}ms`);
        this.metricsService.recordUserAction('polling_started', 'system', true);
    }
    async pollEvents() {
        if (!this.isRunning)
            return;
        const pollStartTime = Date.now();
        const timestamp = new Date().toISOString();
        this.metricsService.updateSystemMetrics();
        this.metricsService.setServiceHealth(true);
        console.log(`\n[${timestamp}] Polling for events...`);
        let totalProcessed = 0;
        let totalFailed = 0;
        let totalServices = 0;
        for (const [serviceName, reader] of this.outboxReaders) {
            try {
                const serviceStartTime = Date.now();
                totalServices++;
                const processed = await this.processServiceEvents(serviceName, reader);
                totalProcessed += processed.processed;
                totalFailed += processed.failed;
                const duration = (Date.now() - serviceStartTime) / 1000;
                this.metricsService.recordDbPollingDuration(serviceName, 'outbox_events', duration, 'batch');
                this.serviceHealth.set(serviceName, true);
            }
            catch (error) {
                console.error(`❌ Error processing events for ${serviceName}:`, error);
                totalFailed++;
                this.serviceHealth.set(serviceName, false);
                this.metricsService.recordEventRelayError('database', `pollEvents.${serviceName}`, error instanceof Error ? error : new Error(String(error)), true, { service: serviceName });
            }
        }
        const pollDuration = (Date.now() - pollStartTime) / 1000;
        this.metricsService.recordBusinessTransaction('poll_cycle', 'success');
        if (totalProcessed > 0 || totalFailed > 0) {
            console.log(`📊 Polling results: ${totalProcessed} processed, ${totalFailed} failed`);
            this.metricsService.setEventsThroughput('out', 'all_services', totalProcessed);
        }
        this.updateServiceHealthMetrics();
    }
    async processServiceEvents(serviceName, reader) {
        let processed = 0;
        let failed = 0;
        const batchStartTime = Date.now();
        try {
            if (this.circuitBreaker && !this.circuitBreaker.canExecute(serviceName)) {
                console.warn(`⏸️ Circuit breaker open for ${serviceName}, skipping`);
                this.metricsService.setCircuitBreakerState('database', serviceName, 'open');
                return { processed: 0, failed: 0 };
            }
            const events = await reader.getPendingEvents(50);
            if (events.length === 0) {
                const duration = (Date.now() - batchStartTime) / 1000;
                this.metricsService.recordDbPollingDuration(serviceName, 'outbox_events', duration, 'batch');
                return { processed: 0, failed: 0 };
            }
            console.log(`📥 Found ${events.length} pending events in ${serviceName}`);
            this.metricsService.setQueueSize('incoming', serviceName, 'outbox_events', events.length);
            for (const event of events) {
                const eventStartTime = Date.now();
                try {
                    if (event.status === 'completed') {
                        console.log(`⏭️ Skipping completed event ${event.id}`);
                        continue;
                    }
                    await reader.markAsProcessing(event.id);
                    const success = await this.publishEventToKafka(serviceName, event);
                    const eventDuration = (Date.now() - eventStartTime) / 1000;
                    if (success) {
                        if (serviceName === 'auth-service') {
                            await reader.markAsCompleted(event.id);
                        }
                        else {
                            await reader.markAsPublished(event.id);
                        }
                        processed++;
                        this.metricsService.recordEventRelayed(serviceName, event.type, 'success', this.getTopicForEvent(serviceName, event.type), events.length);
                        this.metricsService.recordEventProcessingDuration(event.type, 'success', eventDuration, this.getTopicForEvent(serviceName, event.type));
                        console.log(`✅ Published event ${event.id} from ${serviceName}`);
                        if (this.circuitBreaker) {
                            this.circuitBreaker.recordSuccess(serviceName);
                            this.metricsService.setCircuitBreakerState('database', serviceName, 'closed');
                        }
                    }
                    else {
                        await reader.incrementAttempts(event.id);
                        if (event.attempts >= this.MAX_ATTEMPTS) {
                            await this.sendToDLQ(serviceName, event, new Error('Max attempts exceeded'));
                            await reader.markAsFailed(event.id, 'Max attempts exceeded');
                            this.metricsService.recordRetryAttempt(this.getTopicForEvent(serviceName, event.type), event.type, 'exponential', 'dlq');
                            this.metricsService.setDeadLetterQueueSize(this.getTopicForEvent(serviceName, event.type), 'max_attempts', 1);
                            console.log(`⛔ Event ${event.id} sent to DLQ (max attempts)`);
                        }
                        failed++;
                        this.metricsService.recordEventRelayed(serviceName, event.type, 'error', this.getTopicForEvent(serviceName, event.type), 1);
                        this.metricsService.recordEventProcessingDuration(event.type, 'error', eventDuration, this.getTopicForEvent(serviceName, event.type));
                        if (this.circuitBreaker) {
                            this.circuitBreaker.recordFailure(serviceName);
                            this.metricsService.recordCircuitBreakerFailure('database', serviceName, 'exception');
                        }
                    }
                }
                catch (error) {
                    const eventDuration = (Date.now() - eventStartTime) / 1000;
                    const errorMessage = getErrorMessage(error);
                    console.error(`❌ Error processing event ${event.id}:`, error);
                    await reader.markAsFailed(event.id, errorMessage);
                    failed++;
                    this.metricsService.recordEventRelayError('processing', `processServiceEvents.${serviceName}.${event.id}`, error instanceof Error ? error : new Error(String(error)), true, {
                        service: serviceName,
                        eventId: event.id,
                        eventType: event.type
                    });
                    this.metricsService.recordEventProcessingDuration(event.type, 'error', eventDuration, this.getTopicForEvent(serviceName, event.type));
                }
            }
            const remainingEvents = await reader.getPendingEvents(1);
            this.metricsService.setQueueSize('processing', serviceName, 'outbox_events', remainingEvents.length);
            await this.cleanupOldEvents(reader);
            const batchDuration = (Date.now() - batchStartTime) / 1000;
            this.metricsService.recordBatchProcessing(serviceName, 'outbox_events', events.length, batchDuration, processed > 0 || failed === 0);
        }
        catch (error) {
            console.error(`❌ Error reading events from ${serviceName}:`, error);
            this.metricsService.recordEventRelayError('database', `processServiceEvents.${serviceName}`, error instanceof Error ? error : new Error(String(error)), true, { service: serviceName });
            throw error;
        }
        return { processed, failed };
    }
    async publishEventToKafka(serviceName, event) {
        const startTime = Date.now();
        try {
            if (this.circuitBreaker && !this.circuitBreaker.canExecute('kafka')) {
                console.warn(`⏸️ Kafka circuit breaker open, skipping event ${event.id}`);
                this.metricsService.setCircuitBreakerState('kafka', 'producer', 'open');
                return false;
            }
            const topic = this.getTopicForEvent(serviceName, event.type);
            const eventMessage = {
                eventId: event.id,
                eventType: event.type,
                eventVersion: '1.0.0',
                timestamp: new Date().toISOString(),
                payload: event.payload,
                metadata: Object.assign({ sourceService: serviceName, originalCreatedAt: event.createdAt.toISOString() }, event.metadata),
            };
            const success = await this.kafkaProducer.publishEvent(topic, eventMessage, {
                key: event.id,
                headers: {
                    'original-service': serviceName,
                    'event-type': event.type,
                    'source-service': serviceName,
                },
            });
            const duration = (Date.now() - startTime) / 1000;
            if (success) {
                if (this.circuitBreaker) {
                    this.circuitBreaker.recordSuccess('kafka');
                    this.metricsService.setCircuitBreakerState('kafka', 'producer', 'closed');
                }
                this.metricsService.recordKafkaMessageProduced(topic, 'success');
                return true;
            }
            else {
                if (this.circuitBreaker) {
                    this.circuitBreaker.recordFailure('kafka');
                    this.metricsService.recordCircuitBreakerFailure('kafka', 'producer', 'timeout');
                }
                this.metricsService.recordKafkaMessageProduced(topic, 'error');
                return false;
            }
        }
        catch (error) {
            const duration = (Date.now() - startTime) / 1000;
            const topic = this.getTopicForEvent(serviceName, event.type);
            this.metricsService.recordEventRelayError('kafka', `publishEventToKafka.${serviceName}.${event.id}`, error instanceof Error ? error : new Error(String(error)), true, {
                service: serviceName,
                eventId: event.id,
                topic: topic
            });
            this.metricsService.recordKafkaMessageProduced(topic, 'error');
            if (this.circuitBreaker) {
                this.circuitBreaker.recordFailure('kafka');
                this.metricsService.recordCircuitBreakerFailure('kafka', 'producer', 'exception');
            }
            return false;
        }
    }
    getTopicForEvent(serviceName, eventType) {
        const topicName = eventType
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/--+/g, '-');
        return `${serviceName}.${topicName}.v1`;
    }
    async sendToDLQ(serviceName, event, error) {
        const startTime = Date.now();
        try {
            const result = await this.kafkaProducer.publishToDLQ(event, error, {
                serviceName,
                attempts: event.attempts || 1,
                lastAttemptAt: new Date(),
            });
            const duration = (Date.now() - startTime) / 1000;
            this.metricsService.recordDLQMessage(this.getTopicForEvent(serviceName, event.type), error.message, event.attempts || 1);
            this.metricsService.recordBusinessTransaction('dlq_publish', 'success');
            console.log(`📭 Event ${event.id} sent to DLQ`);
        }
        catch (dlqError) {
            const duration = (Date.now() - startTime) / 1000;
            console.error(`❌ Failed to send event to DLQ:`, dlqError);
            this.metricsService.recordEventRelayError('kafka', `sendToDLQ.${serviceName}.${event.id}`, dlqError instanceof Error ? dlqError : new Error(String(dlqError)), false, {
                service: serviceName,
                eventId: event.id,
                originalError: error.message
            });
            this.metricsService.recordBusinessTransaction('dlq_publish', 'failed');
        }
    }
    async cleanupOldEvents(reader) {
        const startTime = Date.now();
        try {
            const deletedCount = await reader.cleanupOldEvents(30);
            const duration = (Date.now() - startTime) / 1000;
            if (deletedCount > 0) {
                console.log(`🧹 Cleaned up ${deletedCount} old events`);
                this.metricsService.recordDatabaseQuery('cleanup', 'outbox_events', duration, true);
                this.metricsService.recordUserAction('events_cleaned', 'system', true);
            }
        }
        catch (error) {
            const duration = (Date.now() - startTime) / 1000;
            console.error('❌ Error cleaning up old events:', error);
            this.metricsService.recordEventRelayError('processing', 'cleanupOldEvents', error instanceof Error ? error : new Error(String(error)), true, { operation: 'cleanup_old_events' });
            this.metricsService.recordDatabaseQuery('cleanup', 'outbox_events', duration, false);
        }
    }
    updateServiceHealthMetrics() {
        let healthyServices = 0;
        let totalServices = 0;
        for (const [serviceName, isHealthy] of this.serviceHealth) {
            totalServices++;
            if (isHealthy)
                healthyServices++;
        }
        const loadBalanceFactor = totalServices > 0 ? healthyServices / totalServices : 1;
        this.metricsService.setLoadBalanceFactor(loadBalanceFactor);
        const overallHealth = loadBalanceFactor > 0.5;
        this.metricsService.setServiceHealth(overallHealth);
    }
    async shutdown() {
        const startTime = Date.now();
        console.log('\n🔻 Shutting down Event Relay Application...');
        this.metricsService.recordBusinessTransaction('application_shutdown', 'success');
        this.isRunning = false;
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('✅ Polling stopped');
        }
        try {
            await this.kafkaProducer.disconnect();
            console.log('✅ Kafka producer disconnected');
            this.metricsService.setKafkaConnections(0, 0, 'event-relay-producer');
        }
        catch (error) {
            console.error('❌ Error disconnecting Kafka producer:', error);
            this.metricsService.recordEventRelayError('processing', 'kafka_disconnect', error instanceof Error ? error : new Error(String(error)), false, { operation: 'kafka_disconnect' });
        }
        try {
            await DatabaseConfig_1.databaseConfig.shutdown();
            console.log('✅ Database connections closed');
        }
        catch (error) {
            console.error('❌ Error closing database connections:', error);
            this.metricsService.recordEventRelayError('processing', 'database_shutdown', error instanceof Error ? error : new Error(String(error)), false, { operation: 'database_shutdown' });
        }
        this.outboxReaders.clear();
        this.serviceHealth.clear();
        const duration = (Date.now() - startTime) / 1000;
        this.metricsService.recordBusinessTransaction('application_shutdown', 'success');
        this.metricsService.setServiceHealth(false);
        console.log('👋 Event Relay Application shutdown complete');
    }
    getStatus() {
        const healthyServices = Array.from(this.serviceHealth.values()).filter(Boolean).length;
        const totalServices = this.serviceHealth.size;
        return {
            isRunning: this.isRunning,
            monitoredServices: this.outboxReaders.size,
            kafkaStatus: this.kafkaProducer.getStatus(),
            pollingInterval: this.POLLING_INTERVAL_MS,
            metrics: {
                healthyServices,
                totalServices,
                healthPercentage: totalServices > 0 ? (healthyServices / totalServices) * 100 : 100,
                lastUpdate: new Date().toISOString(),
            },
        };
    }
}
exports.EventRelayApplication = EventRelayApplication;
const createEventRelayApplication = () => {
    return new EventRelayApplication();
};
exports.createEventRelayApplication = createEventRelayApplication;
