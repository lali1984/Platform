"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMetricsService = void 0;
const prom_client_1 = require("prom-client");
class BaseMetricsService {
    constructor(config, sloConfig) {
        this.metrics = new Map();
        this.config = config;
        this.sloConfig = sloConfig;
        this.registry = new prom_client_1.Registry();
        this.setupDefaultLabels();
        if (config.enableDefaultMetrics !== false) {
            this.enableDefaultMetrics();
        }
        this.initializeStandardMetrics();
        this.initializeServiceSpecificMetrics();
        if (sloConfig) {
            this.initializeSLOMetrics();
        }
    }
    setupDefaultLabels() {
        const defaultLabels = {
            service: this.config.serviceName,
            version: this.config.serviceVersion,
            environment: this.config.environment,
            instance: process.env.HOSTNAME || process.pid.toString(),
            ...this.config.defaultLabels,
        };
        this.registry.setDefaultLabels(defaultLabels);
    }
    enableDefaultMetrics() {
        (0, prom_client_1.collectDefaultMetrics)({
            register: this.registry,
            prefix: 'node_',
            gcDurationBuckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2],
        });
    }
    initializeStandardMetrics() {
        // HTTP метрики (если включены)
        if (this.config.enableHttpMetrics !== false) {
            this.httpRequestsTotal = this.registerCounter('http_requests_total', 'Total HTTP requests', ['method', 'route', 'status', 'status_category']);
            this.httpRequestDuration = this.registerHistogram('http_request_duration_seconds', 'HTTP request duration in seconds', ['method', 'route', 'status'], [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]);
            this.httpAvailability = this.registerGauge('http_availability_percentage', 'HTTP availability percentage', ['route']);
        }
        // Database метрики (если включены)
        if (this.config.enableDbMetrics !== false) {
            this.databaseQueriesTotal = this.registerCounter('database_queries_total', 'Total database queries', ['operation', 'table', 'success']);
            this.databaseQueryDuration = this.registerHistogram('database_query_duration_seconds', 'Database query duration in seconds', ['operation', 'table'], [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1]);
            this.databaseConnections = this.registerGauge('database_connections', 'Current database connections', ['state', 'database']);
        }
        // Kafka метрики (если включены)
        if (this.config.enableKafkaMetrics !== false) {
            this.kafkaMessagesProduced = this.registerCounter('kafka_messages_produced_total', 'Total Kafka messages produced', ['topic', 'status']);
            this.kafkaMessagesConsumed = this.registerCounter('kafka_messages_consumed_total', 'Total Kafka messages consumed', ['topic', 'status']);
            this.kafkaConsumerLag = this.registerGauge('kafka_consumer_lag', 'Kafka consumer lag', ['topic', 'partition']);
            this.kafkaProcessingDuration = this.registerHistogram('kafka_message_processing_duration_seconds', 'Kafka message processing duration in seconds', ['topic', 'status'], [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1]);
        }
        // Error метрики
        this.errorsTotal = this.registerCounter('errors_total', 'Total errors', ['type', 'source', 'severity', 'recoverable']);
        this.deadLetterQueueMessages = this.registerCounter('dead_letter_queue_messages_total', 'Total messages sent to DLQ', ['topic', 'error_type', 'retry_count']);
        // Business метрики
        this.businessTransactionsTotal = this.registerCounter('business_transactions_total', 'Total business transactions', ['transaction_type', 'status']);
        this.userActionsTotal = this.registerCounter('user_actions_total', 'Total user actions', ['action_type', 'user_type', 'success']);
        // System health метрики
        this.serviceHealth = this.registerGauge('service_health', 'Service health status (1 = healthy, 0 = unhealthy)');
        // System метрики
        if (this.config.enableSystemMetrics !== false) {
            this.systemUptime = this.registerGauge('process_uptime_seconds', 'Process uptime in seconds');
            this.systemMemoryUsage = this.registerGauge('process_memory_usage_bytes', 'Process memory usage in bytes', ['type']);
            this.systemCpuUsage = this.registerGauge('process_cpu_usage_percent', 'Process CPU usage percentage');
            this.systemGcDuration = this.registerHistogram('process_gc_duration_seconds', 'Garbage collection duration in seconds', [], [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1]);
        }
    }
    initializeSLOMetrics() {
        if (!this.sloConfig)
            return;
        this.latencyPercentile95 = this.registerGauge('latency_percentile_95_seconds', '95th percentile latency in seconds', ['route']);
        this.latencyPercentile99 = this.registerGauge('latency_percentile_99_seconds', '99th percentile latency in seconds', ['route']);
        this.errorBudgetRemaining = this.registerGauge('error_budget_remaining_percentage', 'Remaining error budget percentage', ['slo_period']);
    }
    // ============ PROTECTED HELPERS ============
    // registerCounter (строка ~260)
    // Строка ~260 - заменить registerCounter
    registerCounter(name, help, labelNames) {
        const counter = new prom_client_1.Counter({
            name,
            help,
            ...(labelNames && labelNames.length > 0 ? { labelNames } : {}), // ✅ Безопасная передача
            registers: [this.registry],
        });
        this.metrics.set(name, counter);
        return counter;
    }
    // Строка ~268 - заменить registerHistogram
    registerHistogram(name, help, labelNames, buckets) {
        const histogram = new prom_client_1.Histogram({
            name,
            help,
            ...(labelNames && labelNames.length > 0 ? { labelNames } : {}), // ✅ Безопасная передача
            buckets: buckets || [0.1, 0.5, 1, 2, 5, 10],
            registers: [this.registry],
        });
        this.metrics.set(name, histogram);
        return histogram;
    }
    // Строка ~286 - заменить registerGauge
    registerGauge(name, help, labelNames) {
        const gauge = new prom_client_1.Gauge({
            name,
            help,
            ...(labelNames && labelNames.length > 0 ? { labelNames } : {}), // ✅ Безопасная передача
            registers: [this.registry],
        });
        this.metrics.set(name, gauge);
        return gauge;
    }
    registerSummary(name, help, labelNames) {
        const summary = new prom_client_1.Summary({
            name,
            help,
            labelNames,
            percentiles: [0.01, 0.05, 0.5, 0.9, 0.95, 0.99, 0.999],
            registers: [this.registry],
        });
        this.metrics.set(name, summary);
        return summary;
    }
    // ============ PUBLIC API ============
    async getMetrics() {
        try {
            return await this.registry.metrics();
        }
        catch (error) {
            console.error('Failed to get metrics from registry:', error);
            return this.getBasicMetrics();
        }
    }
    getRegistry() {
        return this.registry;
    }
    setServiceHealth(healthy) {
        if (this.serviceHealth) {
            this.serviceHealth.set(healthy ? 1 : 0);
        }
    }
    recordBusinessTransaction(type, status) {
        if (this.businessTransactionsTotal) {
            this.businessTransactionsTotal.inc({
                transaction_type: type,
                status
            });
        }
    }
    recordError(type, source, severity, recoverable = false) {
        if (this.errorsTotal) {
            this.errorsTotal.inc({
                type,
                source,
                severity,
                recoverable: recoverable.toString()
            });
        }
    }
    recordUserAction(actionType, userType, success) {
        if (this.userActionsTotal) {
            this.userActionsTotal.inc({
                action_type: actionType,
                user_type: userType,
                success: success.toString()
            });
        }
    }
    recordHttpRequest(method, route, statusCode, duration) {
        if (this.httpRequestsTotal && this.httpRequestDuration) {
            const statusCategory = this.getStatusCategory(statusCode);
            this.httpRequestsTotal.inc({
                method: method.toUpperCase(),
                route: this.normalizeRoute(route),
                status: statusCode.toString(),
                status_category: statusCategory
            });
            this.httpRequestDuration.observe({
                method: method.toUpperCase(),
                route: this.normalizeRoute(route),
                status: statusCode.toString()
            }, duration);
        }
    }
    recordDatabaseQuery(operation, table, duration, success) {
        if (this.databaseQueriesTotal && this.databaseQueryDuration) {
            this.databaseQueriesTotal.inc({
                operation,
                table,
                success: success.toString()
            });
            if (success) {
                this.databaseQueryDuration.observe({ operation, table }, duration);
            }
        }
    }
    setDatabaseConnections(database, active, idle, total) {
        if (this.databaseConnections) {
            this.databaseConnections.set({ database, state: 'active' }, active);
            this.databaseConnections.set({ database, state: 'idle' }, idle);
            this.databaseConnections.set({ database, state: 'total' }, total);
        }
    }
    recordKafkaMessageProduced(topic, status) {
        if (this.kafkaMessagesProduced) {
            this.kafkaMessagesProduced.inc({ topic, status });
        }
    }
    recordKafkaMessageConsumed(topic, status, duration) {
        if (this.kafkaMessagesConsumed) {
            this.kafkaMessagesConsumed.inc({ topic, status });
            if (duration && this.kafkaProcessingDuration) {
                this.kafkaProcessingDuration.observe({ topic, status }, duration);
            }
        }
    }
    setKafkaConsumerLag(topic, partition, lag) {
        if (this.kafkaConsumerLag) {
            this.kafkaConsumerLag.set({ topic, partition: partition.toString() }, lag);
        }
    }
    recordDLQMessage(topic, errorType, retryCount) {
        if (this.deadLetterQueueMessages) {
            this.deadLetterQueueMessages.inc({
                topic,
                error_type: errorType,
                retry_count: retryCount.toString()
            });
        }
    }
    updateSystemMetrics() {
        if (!this.config.enableSystemMetrics)
            return;
        // Uptime
        if (this.systemUptime) {
            this.systemUptime.set(process.uptime());
        }
        // Memory usage
        if (this.systemMemoryUsage) {
            const memory = process.memoryUsage();
            this.systemMemoryUsage.set({ type: 'rss' }, memory.rss);
            this.systemMemoryUsage.set({ type: 'heapTotal' }, memory.heapTotal);
            this.systemMemoryUsage.set({ type: 'heapUsed' }, memory.heapUsed);
            this.systemMemoryUsage.set({ type: 'external' }, memory.external);
        }
    }
    // ============ PRIVATE HELPERS ============
    getBasicMetrics() {
        return `# HELP metrics_service_fallback Fallback metrics due to registry error
# TYPE metrics_service_fallback counter
metrics_service_fallback 1
# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${process.uptime()}`;
    }
    getStatusCategory(statusCode) {
        if (statusCode >= 200 && statusCode < 300)
            return '2xx';
        if (statusCode >= 300 && statusCode < 400)
            return '3xx';
        if (statusCode >= 400 && statusCode < 500)
            return '4xx';
        if (statusCode >= 500)
            return '5xx';
        return 'other';
    }
    normalizeRoute(route) {
        // Нормализуем пути с параметрами
        return route
            .replace(/\d+/g, ':id')
            .replace(/[a-f0-9-]{36}/gi, ':uuid')
            .replace(/\/[^/]+\/[^/]+/g, '/:resource/:id');
    }
}
exports.BaseMetricsService = BaseMetricsService;
//# sourceMappingURL=BaseMetricsService.js.map