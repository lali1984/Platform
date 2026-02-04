import {
  Registry,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
  Metric,
  Summary
} from 'prom-client';

export interface MetricsLabels {
  [key: string]: string;
}
export interface ServiceMetricsConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  defaultLabels?: MetricsLabels;
  enableDefaultMetrics?: boolean;
  enableHttpMetrics?: boolean;
  enableDbMetrics?: boolean;
  enableKafkaMetrics?: boolean;
  enableSystemMetrics?: boolean;
  enableCircuitBreakerMetrics?: boolean;
  enableDLQMetrics?: boolean;
}

export interface SLOConfig {
  targetAvailability: number;  // 0.99 = 99%
  targetLatencyP95: number;    // в секундах
  targetLatencyP99: number;    // в секундах
  errorBudgetWindow: number;   // в секундах (28 дней = 2419200)
}

export abstract class BaseMetricsService {
  protected readonly registry: Registry;
  protected readonly config: ServiceMetricsConfig;
  protected readonly sloConfig?: SLOConfig;
  protected readonly metrics: Map<string, Metric> = new Map();

  // Стандартные метрики
  protected httpRequestsTotal?: Counter;
  protected httpRequestDuration?: Histogram;
  protected httpAvailability?: Gauge;
  protected latencyPercentile95?: Gauge;
  protected latencyPercentile99?: Gauge;
  protected errorBudgetRemaining?: Gauge;
  protected databaseQueriesTotal?: Counter;
  protected databaseQueryDuration?: Histogram;
  protected databaseConnections?: Gauge;
  protected kafkaMessagesProduced?: Counter;
  protected kafkaMessagesConsumed?: Counter;
  protected kafkaConsumerLag?: Gauge;
  protected kafkaProcessingDuration?: Histogram;
  protected errorsTotal?: Counter;
  protected deadLetterQueueMessages?: Counter;
  protected serviceHealth?: Gauge;
  protected businessTransactionsTotal?: Counter;
  protected userActionsTotal?: Counter;

  // Системные метрики
  protected systemUptime?: Gauge;
  protected systemMemoryUsage?: Gauge;
  protected systemCpuUsage?: Gauge;
  protected systemGcDuration?: Histogram;

  constructor(config: ServiceMetricsConfig, sloConfig?: SLOConfig) {
    this.config = config;
    this.sloConfig = sloConfig;
    this.registry = new Registry();
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

  private setupDefaultLabels(): void {
    const defaultLabels: MetricsLabels = {
      service: this.config.serviceName,
      version: this.config.serviceVersion,
      environment: this.config.environment,
      instance: process.env.HOSTNAME || process.pid.toString(),
      ...this.config.defaultLabels,
    };
    this.registry.setDefaultLabels(defaultLabels);
  }

  private enableDefaultMetrics(): void {
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'node_',
      gcDurationBuckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2],
    });
  }

  private initializeStandardMetrics(): void {
    // HTTP метрики (если включены)
    if (this.config.enableHttpMetrics !== false) {
      this.httpRequestsTotal = this.registerCounter(
        'http_requests_total',
        'Total HTTP requests',
        ['method', 'route', 'status', 'status_category']
      );

      this.httpRequestDuration = this.registerHistogram(
        'http_request_duration_seconds',
        'HTTP request duration in seconds',
        ['method', 'route', 'status'],
        [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
      );

      this.httpAvailability = this.registerGauge(
        'http_availability_percentage',
        'HTTP availability percentage',
        ['route']
      );
    }

    // Database метрики (если включены)
    if (this.config.enableDbMetrics !== false) {
      this.databaseQueriesTotal = this.registerCounter(
        'database_queries_total',
        'Total database queries',
        ['operation', 'table', 'success']
      );

      this.databaseQueryDuration = this.registerHistogram(
        'database_query_duration_seconds',
        'Database query duration in seconds',
        ['operation', 'table'],
        [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1]
      );

      this.databaseConnections = this.registerGauge(
        'database_connections',
        'Current database connections',
        ['state', 'database']
      );
    }

    // Kafka метрики (если включены)
    if (this.config.enableKafkaMetrics !== false) {
      this.kafkaMessagesProduced = this.registerCounter(
        'kafka_messages_produced_total',
        'Total Kafka messages produced',
        ['topic', 'status']
      );

      this.kafkaMessagesConsumed = this.registerCounter(
        'kafka_messages_consumed_total',
        'Total Kafka messages consumed',
        ['topic', 'status']
      );

      this.kafkaConsumerLag = this.registerGauge(
        'kafka_consumer_lag',
        'Kafka consumer lag',
        ['topic', 'partition']
      );

      this.kafkaProcessingDuration = this.registerHistogram(
        'kafka_message_processing_duration_seconds',
        'Kafka message processing duration in seconds',
        ['topic', 'status'],
        [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1]
      );
    }

    // Error метрики
    this.errorsTotal = this.registerCounter(
      'errors_total',
      'Total errors',
      ['type', 'source', 'severity', 'recoverable']
    );

    this.deadLetterQueueMessages = this.registerCounter(
      'dead_letter_queue_messages_total',
      'Total messages sent to DLQ',
      ['topic', 'error_type', 'retry_count']
    );

    // Business метрики
    this.businessTransactionsTotal = this.registerCounter(
      'business_transactions_total',
      'Total business transactions',
      ['transaction_type', 'status']
    );

    this.userActionsTotal = this.registerCounter(
      'user_actions_total',
      'Total user actions',
      ['action_type', 'user_type', 'success']
    );

    // System health метрики
    this.serviceHealth = this.registerGauge(
      'service_health',
      'Service health status (1 = healthy, 0 = unhealthy)'
    );

    // System метрики
    if (this.config.enableSystemMetrics !== false) {
      this.systemUptime = this.registerGauge(
        'process_uptime_seconds',
        'Process uptime in seconds'
      );

      this.systemMemoryUsage = this.registerGauge(
        'process_memory_usage_bytes',
        'Process memory usage in bytes',
        ['type']
      );

      this.systemCpuUsage = this.registerGauge(
        'process_cpu_usage_percent',
        'Process CPU usage percentage'
      );

      this.systemGcDuration = this.registerHistogram(
        'process_gc_duration_seconds',
        'Garbage collection duration in seconds',
        [],
        [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1]
      );
    }
  }

  private initializeSLOMetrics(): void {
    if (!this.sloConfig) return;

    this.latencyPercentile95 = this.registerGauge(
      'latency_percentile_95_seconds',
      '95th percentile latency in seconds',
      ['route']
    );

    this.latencyPercentile99 = this.registerGauge(
      'latency_percentile_99_seconds',
      '99th percentile latency in seconds',
      ['route']
    );

    this.errorBudgetRemaining = this.registerGauge(
      'error_budget_remaining_percentage',
      'Remaining error budget percentage',
      ['slo_period']
    );
  }

  protected abstract initializeServiceSpecificMetrics(): void;

  // ============ PROTECTED HELPERS ============
 // registerCounter (строка ~260)
// Строка ~260 - заменить registerCounter
protected registerCounter(name: string, help: string, labelNames?: string[]): Counter {
  const counter = new Counter({
    name,
    help,
    ...(labelNames && labelNames.length > 0 ? { labelNames } : {}),  // ✅ Безопасная передача
    registers: [this.registry],
  });
  this.metrics.set(name, counter);
  return counter;
}

// Строка ~268 - заменить registerHistogram
protected registerHistogram(
  name: string,
  help: string,
  labelNames?: string[],
  buckets?: number[]
): Histogram {
  const histogram = new Histogram({
    name,
    help,
    ...(labelNames && labelNames.length > 0 ? { labelNames } : {}),  // ✅ Безопасная передача
    buckets: buckets || [0.1, 0.5, 1, 2, 5, 10],
    registers: [this.registry],
  });
  this.metrics.set(name, histogram);
  return histogram;
}

// Строка ~286 - заменить registerGauge
protected registerGauge(name: string, help: string, labelNames?: string[]): Gauge {
  const gauge = new Gauge({
    name,
    help,
    ...(labelNames && labelNames.length > 0 ? { labelNames } : {}),  // ✅ Безопасная передача
    registers: [this.registry],
  });
  this.metrics.set(name, gauge);
  return gauge;
}
  protected registerSummary(name: string, help: string, labelNames?: string[]): Summary {
    const summary = new Summary({
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
  public async getMetrics(): Promise<string> {
    try {
      return await this.registry.metrics();
    } catch (error) {
      console.error('Failed to get metrics from registry:', error);
      return this.getBasicMetrics();
    }
  }

  public getRegistry(): Registry {
    return this.registry;
  }

  public setServiceHealth(healthy: boolean): void {
    if (this.serviceHealth) {
      this.serviceHealth.set(healthy ? 1 : 0);
    }
  }

  public recordBusinessTransaction(
    type: string,
    status: 'success' | 'failed'
  ): void {
    if (this.businessTransactionsTotal) {
      this.businessTransactionsTotal.inc({
        transaction_type: type,
        status
      });
    }
  }

  public recordError(
    type: string,
    source: string,
    severity: string,
    recoverable: boolean = false
  ): void {
    if (this.errorsTotal) {
      this.errorsTotal.inc({
        type,
        source,
        severity,
        recoverable: recoverable.toString()
      });
    }
  }

  public recordUserAction(
    actionType: string,
    userType: string,
    success: boolean
  ): void {
    if (this.userActionsTotal) {
      this.userActionsTotal.inc({
        action_type: actionType,
        user_type: userType,
        success: success.toString()
      });
    }
  }

  public recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number
  ): void {
    if (this.httpRequestsTotal && this.httpRequestDuration) {
      const statusCategory = this.getStatusCategory(statusCode);
      this.httpRequestsTotal.inc({
        method: method.toUpperCase(),
        route: this.normalizeRoute(route),
        status: statusCode.toString(),
        status_category: statusCategory
      });

      this.httpRequestDuration.observe(
        {
          method: method.toUpperCase(),
          route: this.normalizeRoute(route),
          status: statusCode.toString()
        },
        duration
      );
    }
  }

  public recordDatabaseQuery(
    operation: string,
    table: string,
    duration: number,
    success: boolean
  ): void {
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

  public setDatabaseConnections(
    database: string,
    active: number,
    idle: number,
    total: number
  ): void {
    if (this.databaseConnections) {
      this.databaseConnections.set({ database, state: 'active' }, active);
      this.databaseConnections.set({ database, state: 'idle' }, idle);
      this.databaseConnections.set({ database, state: 'total' }, total);
    }
  }

  public recordKafkaMessageProduced(topic: string, status: 'success' | 'error'): void {
    if (this.kafkaMessagesProduced) {
      this.kafkaMessagesProduced.inc({ topic, status });
    }
  }

  public recordKafkaMessageConsumed(
    topic: string,
    status: 'success' | 'error',
    duration?: number
  ): void {
    if (this.kafkaMessagesConsumed) {
      this.kafkaMessagesConsumed.inc({ topic, status });
      if (duration && this.kafkaProcessingDuration) {
        this.kafkaProcessingDuration.observe({ topic, status }, duration);
      }
    }
  }

  public setKafkaConsumerLag(topic: string, partition: number, lag: number): void {
    if (this.kafkaConsumerLag) {
      this.kafkaConsumerLag.set({ topic, partition: partition.toString() }, lag);
    }
  }

  public recordDLQMessage(topic: string, errorType: string, retryCount: number): void {
    if (this.deadLetterQueueMessages) {
      this.deadLetterQueueMessages.inc({
        topic,
        error_type: errorType,
        retry_count: retryCount.toString()
      });
    }
  }

  public updateSystemMetrics(): void {
    if (!this.config.enableSystemMetrics) return;

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
  private getBasicMetrics(): string {
    return `# HELP metrics_service_fallback Fallback metrics due to registry error
# TYPE metrics_service_fallback counter
metrics_service_fallback 1
# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${process.uptime()}`;
  }

  private getStatusCategory(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '2xx';
    if (statusCode >= 300 && statusCode < 400) return '3xx';
    if (statusCode >= 400 && statusCode < 500) return '4xx';
    if (statusCode >= 500) return '5xx';
    return 'other';
  }

  private normalizeRoute(route: string): string {
    // Нормализуем пути с параметрами
    return route
      .replace(/\d+/g, ':id')
      .replace(/[a-f0-9-]{36}/gi, ':uuid')
      .replace(/\/[^/]+\/[^/]+/g, '/:resource/:id');
  }
}