"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRelayMetricsService = void 0;
exports.getEventRelayMetricsService = getEventRelayMetricsService;
const contracts_1 = require("@platform/contracts");
const contracts_2 = require("@platform/contracts");
class EventRelayMetricsService extends contracts_1.BaseMetricsService {
    constructor() {
        const serviceConfig = {
            serviceName: 'event-relay',
            serviceVersion: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            defaultLabels: {
                instance: process.env.HOSTNAME || `event-relay-${process.pid}`,
                deployment: process.env.DEPLOYMENT_ENV || 'local',
            },
            enableDefaultMetrics: true,
            enableHttpMetrics: false,
            enableDbMetrics: true,
            enableKafkaMetrics: true,
            enableSystemMetrics: true,
        };
        const sloConfig = {
            targetAvailability: 0.999,
            targetLatencyP95: 1.0,
            targetLatencyP99: 2.0,
            errorBudgetWindow: 7 * 24 * 60 * 60,
        };
        super(serviceConfig, sloConfig);
        this.setServiceHealth(true);
    }
    initializeServiceSpecificMetrics() {
        // Основные метрики ретрансляции событий
        this.eventsRelayedTotal = this.registerCounter('events_relayed_total', 'Total events relayed from outbox tables', ['source_db', 'event_type', 'status', 'topic']);
        this.outboxMessagesProcessedTotal = this.registerCounter('outbox_messages_processed_total', 'Total outbox messages processed', ['table', 'status', 'database', 'batch_size']);
        this.eventProcessingDurationSeconds = this.registerHistogram('event_processing_duration_seconds', 'Event processing duration in seconds', ['event_type', 'status', 'topic'], [...contracts_2.METRICS_CONSTANTS.BUCKETS.KAFKA] // ✅ spread operator создает новый массив
        );
        this.dbPollingDurationSeconds = this.registerHistogram('db_polling_duration_seconds', 'Database polling duration in seconds', ['database', 'table', 'polling_strategy'], [0.1, 0.5, 1, 2, 5, 10, 30, 60]);
        // Kafka продюсер метрики
        this.kafkaProducerConnections = this.registerGauge('kafka_producer_connections', 'Active Kafka producer connections', ['state', 'client_id']);
        // DLQ и retry метрики
        this.deadLetterQueueSize = this.registerGauge('dead_letter_queue_size', 'Current size of dead letter queue', ['topic', 'error_type']);
        this.retryAttemptsTotal = this.registerCounter('retry_attempts_total', 'Total retry attempts for failed events', ['topic', 'event_type', 'retry_strategy', 'final_status']);
        // Circuit breaker метрики
        this.circuitBreakerState = this.registerGauge('circuit_breaker_state', 'Circuit breaker state (0=closed, 1=open, 2=half-open)', ['component', 'name']);
        this.circuitBreakerFailures = this.registerCounter('circuit_breaker_failures_total', 'Total circuit breaker failures', ['component', 'name', 'failure_type']);
        // Throughput метрики
        this.eventsThroughputPerSecond = this.registerGauge('events_throughput_per_second', 'Events throughput per second', ['direction', 'topic']);
        // Размеры очередей
        this.eventQueueSize = this.registerGauge('event_queue_size', 'Current event queue size', ['queue_type', 'database', 'table']);
        // Задержки обработки
        this.eventProcessingLagSeconds = this.registerGauge('event_processing_lag_seconds', 'Event processing lag in seconds', ['database', 'table']);
        // Балансировка нагрузки
        this.loadBalanceFactor = this.registerGauge('load_balance_factor', 'Load balance factor between databases', []);
    }
    // ============ PUBLIC API ============
    // Event processing metrics
    recordEventRelayed(sourceDb, eventType, status, topic, batchSize = 1) {
        this.recordKafkaMessageProduced(topic, status);
        this.eventsRelayedTotal.inc({
            source_db: sourceDb,
            event_type: eventType,
            status,
            topic
        });
        this.recordBusinessTransaction(`event_relay_${eventType}`, status === 'success' ? 'success' : 'failed');
    }
    recordOutboxMessageProcessed(table, status, database, batchSize = 1) {
        this.outboxMessagesProcessedTotal.inc({
            table,
            status,
            database,
            batch_size: batchSize.toString()
        });
    }
    recordEventProcessingDuration(eventType, status, duration, topic) {
        this.eventProcessingDurationSeconds.observe({ event_type: eventType, status, topic: topic || 'unknown' }, duration);
        if (topic) {
            this.recordKafkaMessageConsumed(topic, status, duration);
        }
    }
    recordDbPollingDuration(database, table, duration, pollingStrategy = 'interval') {
        this.dbPollingDurationSeconds.observe({ database, table, polling_strategy: pollingStrategy }, duration);
        this.recordDatabaseQuery('poll', table, duration, true);
    }
    // Kafka producer metrics
    setKafkaConnections(active, idle, clientId = 'event-relay-producer') {
        this.kafkaProducerConnections.set({ state: 'active', client_id: clientId }, active);
        this.kafkaProducerConnections.set({ state: 'idle', client_id: clientId }, idle);
        this.kafkaProducerConnections.set({ state: 'total', client_id: clientId }, active + idle);
    }
    // DLQ and retry metrics
    setDeadLetterQueueSize(topic, errorType, size) {
        this.deadLetterQueueSize.set({ topic, error_type: errorType }, size);
    }
    recordRetryAttempt(topic, eventType, retryStrategy, finalStatus) {
        this.retryAttemptsTotal.inc({
            topic,
            event_type: eventType,
            retry_strategy: retryStrategy,
            final_status: finalStatus
        });
        if (finalStatus === 'dlq') {
            this.recordDLQMessage(topic, eventType, 0);
        }
    }
    // Circuit breaker metrics
    setCircuitBreakerState(component, name, state) {
        const stateValue = state === 'closed' ? 0 : state === 'open' ? 1 : 2;
        this.circuitBreakerState.set({ component, name }, stateValue);
    }
    recordCircuitBreakerFailure(component, name, failureType) {
        this.circuitBreakerFailures.inc({
            component,
            name,
            failure_type: failureType
        });
        this.recordError(failureType, `circuit_breaker_${component}_${name}`, 'high', true);
    }
    // Batch processing metrics
    recordBatchProcessing(database, table, batchSize, duration, success) {
        this.recordDatabaseQuery('batch_select', table, duration, success);
        if (success) {
            this.recordUserAction('batch_processed', 'system', true);
        }
    }
    // Throughput monitoring
    setEventsThroughput(direction, topic, throughput) {
        this.eventsThroughputPerSecond.set({ direction, topic }, throughput);
    }
    setQueueSize(queueType, database, table, size) {
        this.eventQueueSize.set({ queue_type: queueType, database, table }, size);
    }
    setProcessingLag(database, table, lagSeconds) {
        this.eventProcessingLagSeconds.set({ database, table }, lagSeconds);
    }
    setLoadBalanceFactor(factor) {
        this.loadBalanceFactor.set(factor);
    }
    // Error recording with context
    recordEventRelayError(type, source, error, recoverable = false, context) {
        const severity = this.determineErrorSeverity(type, error, context);
        this.recordError(type, source, severity, recoverable);
        console.error(`Event Relay Error [${type}]:`, {
            source,
            message: error.message,
            stack: error.stack,
            recoverable,
            context,
            timestamp: new Date().toISOString(),
        });
    }
    determineErrorSeverity(type, error, context) {
        switch (type) {
            case 'database':
                return error.message.includes('connection') ? 'critical' : 'high';
            case 'kafka':
                return error.message.includes('broker') ? 'critical' : 'high';
            case 'processing':
                return 'medium';
            case 'serialization':
                return 'low';
            case 'network':
                return 'high';
            default:
                return 'medium';
        }
    }
}
exports.EventRelayMetricsService = EventRelayMetricsService;
// Экспорт синглтона
let metricsServiceInstance = null;
function getEventRelayMetricsService() {
    if (!metricsServiceInstance) {
        metricsServiceInstance = new EventRelayMetricsService();
    }
    return metricsServiceInstance;
}
