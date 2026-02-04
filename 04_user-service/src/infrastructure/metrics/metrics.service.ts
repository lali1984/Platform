// ./04_user-service/src/infrastructure/metrics/metrics.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import { Logger } from '@nestjs/common';

export interface MetricsLabels {
  [key: string]: string;
}

@Injectable()
export class MetricsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MetricsService.name);
  private readonly registry: Registry;
  private readonly metrics: Map<string, any> = new Map();
  private metricsInterval: NodeJS.Timeout | null = null;

  // Системные метрики
  private systemMetrics = {
    uptime: null as Gauge | null,
    memoryUsage: null as Gauge | null,
    cpuUsage: null as Gauge | null,
  };

  constructor() {
    // Создаем registry с приложением метками
    this.registry = new Registry();
    
    // Добавляем стандартные метрики Node.js
    this.registry.setDefaultLabels({
      app: 'user-service',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    });

    this.initializeMetrics();
  }

  async onModuleInit(): Promise<void> {
    this.startSystemMetricsCollection();
    this.logger.log('Metrics service initialized');
  }

  async onModuleDestroy(): Promise<void> {
    this.stopSystemMetricsCollection();
    this.logger.log('Metrics service destroyed');
  }

  private initializeMetrics(): void {
    // ============ HTTP METRICS ============
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

    // ============ DATABASE METRICS ============
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

    // ============ KAFKA METRICS ============
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

    // ============ BUSINESS METRICS ============
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

    // ============ ERROR METRICS ============
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

    // ============ SYSTEM METRICS ============
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

  // ============ PUBLIC API ============

  getRegistry(): Registry {
    return this.registry;
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  // HTTP metrics
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ): void {
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

  // Database metrics
  recordDatabaseQuery(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
  ): void {
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

  setDatabaseConnections(active: number, idle: number, total: number): void {
    this.setGauge('database_connections', active, { state: 'active' });
    this.setGauge('database_connections', idle, { state: 'idle' });
    this.setGauge('database_connections', total, { state: 'total' });
  }

  // Kafka metrics
  recordKafkaMessageConsumed(topic: string, status: 'success' | 'error', duration?: number): void {
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

  recordKafkaMessageProduced(topic: string, status: 'success' | 'error'): void {
    this.incrementCounter('kafka_messages_produced_total', {
      topic,
      status,
    });
  }

  setKafkaConsumerLag(topic: string, partition: number, lag: number): void {
    this.setGauge('kafka_consumer_lag', lag, {
      topic,
      partition: partition.toString(),
    });
  }

  // Business metrics
  recordUserRegistration(source: string, status: 'success' | 'error'): void {
    this.incrementCounter('user_registrations_total', {
      source,
      status,
    });
  }

  recordUserProfileUpdate(field: string): void {
    this.incrementCounter('user_profile_updates_total', {
      field,
    });
  }

  setUsersTotal(status: string, count: number): void {
    this.setGauge('users_total', count, { status });
  }

  setUsersActive(count: number): void {
    this.setGauge('users_active', count);
  }

  recordUserProfileCompletion(percentage: number): void {
    this.observeHistogram('user_profile_completion_percentage', percentage);
  }

  // Error metrics
  recordError(type: string, service: string, severity: 'low' | 'medium' | 'high' | 'critical'): void {
    this.incrementCounter('errors_total', {
      type,
      service,
      severity,
    });
  }

  recordDlqMessage(topic: string, errorType: string): void {
    this.incrementCounter('dead_letter_queue_messages_total', {
      topic,
      error_type: errorType,
    });
  }

  // ============ PRIVATE METHODS ============

  private registerCounter(options: {
    name: string;
    help: string;
    labelNames?: string[];
  }): Counter {
    const counter = new Counter({
      name: options.name,
      help: options.help,
      labelNames: options.labelNames,
      registers: [this.registry],
    });
    
    this.metrics.set(options.name, counter);
    return counter;
  }

  private registerHistogram(options: {
    name: string;
    help: string;
    labelNames?: string[];
    buckets?: number[];
  }): Histogram {
    const histogram = new Histogram({
      name: options.name,
      help: options.help,
      labelNames: options.labelNames,
      buckets: options.buckets,
      registers: [this.registry],
    });
    
    this.metrics.set(options.name, histogram);
    return histogram;
  }

  private registerGauge(options: {
    name: string;
    help: string;
    labelNames?: string[];
  }): Gauge {
    const gauge = new Gauge({
      name: options.name,
      help: options.help,
      labelNames: options.labelNames,
      registers: [this.registry],
    });
    
    this.metrics.set(options.name, gauge);
    return gauge;
  }

  private incrementCounter(name: string, labels?: MetricsLabels): void {
    const counter = this.metrics.get(name);
    if (counter && counter instanceof Counter) {
      if (labels) {
        counter.inc(labels);
      } else {
        counter.inc();
      }
    }
  }

  private observeHistogram(name: string, value: number, labels?: MetricsLabels): void {
    const histogram = this.metrics.get(name);
    if (histogram && histogram instanceof Histogram) {
      if (labels) {
        histogram.observe(labels, value);
      } else {
        histogram.observe(value);
      }
    }
  }

  private setGauge(name: string, value: number, labels?: MetricsLabels): void {
    const gauge = this.metrics.get(name);
    if (gauge && gauge instanceof Gauge) {
      if (labels) {
        gauge.set(labels, value);
      } else {
        gauge.set(value);
      }
    }
  }

  private getStatusCategory(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '2xx';
    if (statusCode >= 300 && statusCode < 400) return '3xx';
    if (statusCode >= 400 && statusCode < 500) return '4xx';
    if (statusCode >= 500) return '5xx';
    return 'other';
  }

  private startSystemMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 15000); // Каждые 15 секунд
  }

  private stopSystemMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  // В методе collectSystemMetrics добавить проверку:
private collectSystemMetrics(): void {
  try {
    // Uptime
    if (this.systemMetrics.uptime) {
      this.systemMetrics.uptime.set(process.uptime());
    }

    // Memory usage
    if (this.systemMetrics.memoryUsage) {
      const memory = process.memoryUsage();
      this.systemMetrics.memoryUsage.set({ type: 'rss' }, memory.rss);
      this.systemMetrics.memoryUsage.set({ type: 'heapTotal' }, memory.heapTotal);
      this.systemMetrics.memoryUsage.set({ type: 'heapUsed' }, memory.heapUsed);
      this.systemMetrics.memoryUsage.set({ type: 'external' }, memory.external);
    }

    // CPU usage с проверкой на null
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
  } catch (error) {
    console.warn('Failed to collect system metrics:', error);
  }
}
}