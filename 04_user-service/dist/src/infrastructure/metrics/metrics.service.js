"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MetricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const prom_client_1 = require("prom-client");
const common_2 = require("@nestjs/common");
let MetricsService = MetricsService_1 = class MetricsService {
    constructor() {
        this.logger = new common_2.Logger(MetricsService_1.name);
        this.metrics = new Map();
        this.metricsInterval = null;
        this.systemMetrics = {
            uptime: null,
            memoryUsage: null,
            cpuUsage: null,
        };
        this.registry = new prom_client_1.Registry();
        this.registry.setDefaultLabels({
            app: 'user-service',
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
        });
        this.initializeMetrics();
    }
    async onModuleInit() {
        this.startSystemMetricsCollection();
        this.logger.log('Metrics service initialized');
    }
    async onModuleDestroy() {
        this.stopSystemMetricsCollection();
        this.logger.log('Metrics service destroyed');
    }
    initializeMetrics() {
        this.registerCounter({
            name: 'http_requests_total',
            help: 'Total HTTP requests',
            labelNames: ['method', 'route', 'status'],
        });
        this.registerHistogram({
            name: 'http_request_duration_seconds',
            help: 'HTTP request duration in seconds',
            labelNames: ['method', 'route', 'status'],
            buckets: [0.1, 0.5, 1, 2, 5, 10],
        });
        this.registerCounter({
            name: 'database_queries_total',
            help: 'Total database queries',
            labelNames: ['operation', 'table', 'success'],
        });
        this.registerHistogram({
            name: 'database_query_duration_seconds',
            help: 'Database query duration in seconds',
            labelNames: ['operation', 'table'],
            buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
        });
        this.registerGauge({
            name: 'database_connections',
            help: 'Current database connections',
            labelNames: ['state'],
        });
        this.registerCounter({
            name: 'kafka_messages_consumed_total',
            help: 'Total Kafka messages consumed',
            labelNames: ['topic', 'status'],
        });
        this.registerCounter({
            name: 'kafka_messages_produced_total',
            help: 'Total Kafka messages produced',
            labelNames: ['topic', 'status'],
        });
        this.registerHistogram({
            name: 'kafka_message_processing_duration_seconds',
            help: 'Kafka message processing duration in seconds',
            labelNames: ['topic', 'status'],
            buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
        });
        this.registerGauge({
            name: 'kafka_consumer_lag',
            help: 'Kafka consumer lag',
            labelNames: ['topic', 'partition'],
        });
        this.registerCounter({
            name: 'user_registrations_total',
            help: 'Total user registrations',
            labelNames: ['source', 'status'],
        });
        this.registerCounter({
            name: 'user_profile_updates_total',
            help: 'Total user profile updates',
            labelNames: ['field'],
        });
        this.registerGauge({
            name: 'users_total',
            help: 'Total number of users',
            labelNames: ['status'],
        });
        this.registerGauge({
            name: 'users_active',
            help: 'Number of active users',
        });
        this.registerHistogram({
            name: 'user_profile_completion_percentage',
            help: 'User profile completion percentage distribution',
            buckets: [0, 25, 50, 75, 90, 100],
        });
        this.registerCounter({
            name: 'errors_total',
            help: 'Total errors',
            labelNames: ['type', 'service', 'severity'],
        });
        this.registerCounter({
            name: 'dead_letter_queue_messages_total',
            help: 'Total messages sent to DLQ',
            labelNames: ['topic', 'error_type'],
        });
        this.systemMetrics.uptime = this.registerGauge({
            name: 'process_uptime_seconds',
            help: 'Process uptime in seconds',
        });
        this.systemMetrics.memoryUsage = this.registerGauge({
            name: 'process_memory_usage_bytes',
            help: 'Process memory usage in bytes',
            labelNames: ['type'],
        });
        this.systemMetrics.cpuUsage = this.registerGauge({
            name: 'process_cpu_usage_percent',
            help: 'Process CPU usage percentage',
        });
    }
    getRegistry() {
        return this.registry;
    }
    async getMetrics() {
        return this.registry.metrics();
    }
    recordHttpRequest(method, route, statusCode, duration) {
        const status = this.getStatusCategory(statusCode);
        this.incrementCounter('http_requests_total', {
            method,
            route,
            status,
        });
        this.observeHistogram('http_request_duration_seconds', duration, {
            method,
            route,
            status,
        });
    }
    recordDatabaseQuery(operation, table, duration, success) {
        this.incrementCounter('database_queries_total', {
            operation,
            table,
            success: success ? 'true' : 'false',
        });
        if (success) {
            this.observeHistogram('database_query_duration_seconds', duration, {
                operation,
                table,
            });
        }
    }
    setDatabaseConnections(active, idle, total) {
        this.setGauge('database_connections', active, { state: 'active' });
        this.setGauge('database_connections', idle, { state: 'idle' });
        this.setGauge('database_connections', total, { state: 'total' });
    }
    recordKafkaMessageConsumed(topic, status, duration) {
        this.incrementCounter('kafka_messages_consumed_total', {
            topic,
            status,
        });
        if (duration !== undefined) {
            this.observeHistogram('kafka_message_processing_duration_seconds', duration, {
                topic,
                status,
            });
        }
    }
    recordKafkaMessageProduced(topic, status) {
        this.incrementCounter('kafka_messages_produced_total', {
            topic,
            status,
        });
    }
    setKafkaConsumerLag(topic, partition, lag) {
        this.setGauge('kafka_consumer_lag', lag, {
            topic,
            partition: partition.toString(),
        });
    }
    recordUserRegistration(source, status) {
        this.incrementCounter('user_registrations_total', {
            source,
            status,
        });
    }
    recordUserProfileUpdate(field) {
        this.incrementCounter('user_profile_updates_total', {
            field,
        });
    }
    setUsersTotal(status, count) {
        this.setGauge('users_total', count, { status });
    }
    setUsersActive(count) {
        this.setGauge('users_active', count);
    }
    recordUserProfileCompletion(percentage) {
        this.observeHistogram('user_profile_completion_percentage', percentage);
    }
    recordError(type, service, severity) {
        this.incrementCounter('errors_total', {
            type,
            service,
            severity,
        });
    }
    recordDlqMessage(topic, errorType) {
        this.incrementCounter('dead_letter_queue_messages_total', {
            topic,
            error_type: errorType,
        });
    }
    registerCounter(options) {
        const counter = new prom_client_1.Counter({
            name: options.name,
            help: options.help,
            labelNames: options.labelNames,
            registers: [this.registry],
        });
        this.metrics.set(options.name, counter);
        return counter;
    }
    registerHistogram(options) {
        const histogram = new prom_client_1.Histogram({
            name: options.name,
            help: options.help,
            labelNames: options.labelNames,
            buckets: options.buckets,
            registers: [this.registry],
        });
        this.metrics.set(options.name, histogram);
        return histogram;
    }
    registerGauge(options) {
        const gauge = new prom_client_1.Gauge({
            name: options.name,
            help: options.help,
            labelNames: options.labelNames,
            registers: [this.registry],
        });
        this.metrics.set(options.name, gauge);
        return gauge;
    }
    incrementCounter(name, labels) {
        const counter = this.metrics.get(name);
        if (counter && counter instanceof prom_client_1.Counter) {
            if (labels) {
                counter.inc(labels);
            }
            else {
                counter.inc();
            }
        }
    }
    observeHistogram(name, value, labels) {
        const histogram = this.metrics.get(name);
        if (histogram && histogram instanceof prom_client_1.Histogram) {
            if (labels) {
                histogram.observe(labels, value);
            }
            else {
                histogram.observe(value);
            }
        }
    }
    setGauge(name, value, labels) {
        const gauge = this.metrics.get(name);
        if (gauge && gauge instanceof prom_client_1.Gauge) {
            if (labels) {
                gauge.set(labels, value);
            }
            else {
                gauge.set(value);
            }
        }
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
    startSystemMetricsCollection() {
        this.metricsInterval = setInterval(() => {
            this.collectSystemMetrics();
        }, 15000);
    }
    stopSystemMetricsCollection() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }
    }
    collectSystemMetrics() {
        try {
            if (this.systemMetrics.uptime) {
                this.systemMetrics.uptime.set(process.uptime());
            }
            if (this.systemMetrics.memoryUsage) {
                const memory = process.memoryUsage();
                this.systemMetrics.memoryUsage.set({ type: 'rss' }, memory.rss);
                this.systemMetrics.memoryUsage.set({ type: 'heapTotal' }, memory.heapTotal);
                this.systemMetrics.memoryUsage.set({ type: 'heapUsed' }, memory.heapUsed);
                this.systemMetrics.memoryUsage.set({ type: 'external' }, memory.external);
            }
            if (this.systemMetrics.cpuUsage) {
                const startUsage = process.cpuUsage();
                setTimeout(() => {
                    const endUsage = process.cpuUsage(startUsage);
                    const cpuPercent = (endUsage.user + endUsage.system) / 10000;
                    if (this.systemMetrics.cpuUsage) {
                        this.systemMetrics.cpuUsage.set(cpuPercent);
                    }
                }, 100);
            }
        }
        catch (error) {
            console.warn('Failed to collect system metrics:', error);
        }
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = MetricsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map