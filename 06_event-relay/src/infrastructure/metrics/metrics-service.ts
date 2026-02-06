import {
  BaseMetricsService,
  ServiceMetricsConfig,
  SLOConfig,
} from '@platform/contracts';
import { METRICS_CONSTANTS } from '@platform/contracts';
import { Counter, Histogram, Gauge } from 'prom-client';

export interface EventRelayMetricsLabels {
  source_db?: string;
  event_type?: string;
  topic?: string;
  table?: string;
  database?: string;
}

export class EventRelayMetricsService extends BaseMetricsService {
  // Event Relay специфичные метрики
  private eventsRelayedTotal!: Counter<'source_db' | 'event_type' | 'status' | 'topic'>;
  private outboxMessagesProcessedTotal!: Counter<'table' | 'status' | 'database' | 'batch_size'>;
  private eventProcessingDurationSeconds!: Histogram<'event_type' | 'status' | 'topic'>;
  private kafkaProducerConnections!: Gauge<'state' | 'client_id'>;
  private dbPollingDurationSeconds!: Histogram<'database' | 'table' | 'polling_strategy'>;

  // DLQ метрики
  private deadLetterQueueSize!: Gauge<'topic' | 'error_type'>;
  private retryAttemptsTotal!: Counter<'topic' | 'event_type' | 'retry_strategy' | 'final_status'>;

  // Circuit breaker метрики
  private circuitBreakerState!: Gauge<'component' | 'name'>;
  private circuitBreakerFailures!: Counter<'component' | 'name' | 'failure_type'>;

  // Throughput и очереди
  private eventsThroughputPerSecond!: Gauge<'direction' | 'topic'>;
  private eventQueueSize!: Gauge<'queue_type' | 'database' | 'table'>;
  private eventProcessingLagSeconds!: Gauge<'database' | 'table'>;
  private loadBalanceFactor!: Gauge;

  constructor() {
    const serviceConfig: ServiceMetricsConfig = {
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

    const sloConfig: SLOConfig = {
      targetAvailability: 0.999,
      targetLatencyP95: 1.0,
      targetLatencyP99: 2.0,
      errorBudgetWindow: 7 * 24 * 60 * 60,
    };

    super(serviceConfig, sloConfig);
    this.setServiceHealth(true);
  }

  protected initializeServiceSpecificMetrics(): void {
    // Основные метрики ретрансляции событий
    this.eventsRelayedTotal = this.registerCounter(
      'events_relayed_total',
      'Total events relayed from outbox tables',
      ['source_db', 'event_type', 'status', 'topic']
    );

    this.outboxMessagesProcessedTotal = this.registerCounter(
      'outbox_messages_processed_total',
      'Total outbox messages processed',
      ['table', 'status', 'database', 'batch_size']
    );

    this.eventProcessingDurationSeconds = this.registerHistogram(
      'event_processing_duration_seconds',
      'Event processing duration in seconds',
      ['event_type', 'status', 'topic'],
      [...METRICS_CONSTANTS.BUCKETS.KAFKA]  // ✅ spread operator создает новый массив
    );

    this.dbPollingDurationSeconds = this.registerHistogram(
      'db_polling_duration_seconds',
      'Database polling duration in seconds',
      ['database', 'table', 'polling_strategy'],
      [0.1, 0.5, 1, 2, 5, 10, 30, 60]
    );

    // Kafka продюсер метрики
    this.kafkaProducerConnections = this.registerGauge(
      'kafka_producer_connections',
      'Active Kafka producer connections',
      ['state', 'client_id']
    );

    // DLQ и retry метрики
    this.deadLetterQueueSize = this.registerGauge(
      'dead_letter_queue_size',
      'Current size of dead letter queue',
      ['topic', 'error_type']
    );

    this.retryAttemptsTotal = this.registerCounter(
      'retry_attempts_total',
      'Total retry attempts for failed events',
      ['topic', 'event_type', 'retry_strategy', 'final_status']
    );

    // Circuit breaker метрики
    this.circuitBreakerState = this.registerGauge(
      'circuit_breaker_state',
      'Circuit breaker state (0=closed, 1=open, 2=half-open)',
      ['component', 'name']
    );

    this.circuitBreakerFailures = this.registerCounter(
      'circuit_breaker_failures_total',
      'Total circuit breaker failures',
      ['component', 'name', 'failure_type']
    );

    // Throughput метрики
    this.eventsThroughputPerSecond = this.registerGauge(
      'events_throughput_per_second',
      'Events throughput per second',
      ['direction', 'topic']
    );

    // Размеры очередей
    this.eventQueueSize = this.registerGauge(
      'event_queue_size',
      'Current event queue size',
      ['queue_type', 'database', 'table']
    );

    // Задержки обработки
    this.eventProcessingLagSeconds = this.registerGauge(
      'event_processing_lag_seconds',
      'Event processing lag in seconds',
      ['database', 'table']
    );

    // Балансировка нагрузки
    this.loadBalanceFactor = this.registerGauge(
      'load_balance_factor',
      'Load balance factor between databases',
      []
    );
  }

  // ============ PUBLIC API ============
  // Event processing metrics
  public recordEventRelayed(
    sourceDb: string,
    eventType: string,
    status: 'success' | 'error',
    topic: string,
    batchSize: number = 1
  ): void {
    this.recordKafkaMessageProduced(topic, status);
    this.eventsRelayedTotal.inc({ 
      source_db: sourceDb, 
      event_type: eventType, 
      status, 
      topic 
    });
    this.recordBusinessTransaction(`event_relay_${eventType}`, status === 'success' ? 'success' : 'failed');
  }

  public recordOutboxMessageProcessed(
    table: string,
    status: 'processed' | 'failed' | 'retry',
    database: string,
    batchSize: number = 1
  ): void {
    this.outboxMessagesProcessedTotal.inc({
      table,
      status,
      database,
      batch_size: batchSize.toString()
    });
  }

  public recordEventProcessingDuration(
    eventType: string,
    status: 'success' | 'error',
    duration: number,
    topic?: string
  ): void {
    this.eventProcessingDurationSeconds.observe(
      { event_type: eventType, status, topic: topic || 'unknown' },
      duration
    );
    if (topic) {
      this.recordKafkaMessageConsumed(topic, status, duration);
    }
  }

  public recordDbPollingDuration(
    database: string,
    table: string,
    duration: number,
    pollingStrategy: 'batch' | 'streaming' | 'interval' = 'interval'
  ): void {
    this.dbPollingDurationSeconds.observe(
      { database, table, polling_strategy: pollingStrategy },
      duration
    );
    this.recordDatabaseQuery('poll', table, duration, true);
  }

  // Kafka producer metrics
  public setKafkaConnections(
    active: number,
    idle: number,
    clientId: string = 'event-relay-producer'
  ): void {
    this.kafkaProducerConnections.set({ state: 'active', client_id: clientId }, active);
    this.kafkaProducerConnections.set({ state: 'idle', client_id: clientId }, idle);
    this.kafkaProducerConnections.set({ state: 'total', client_id: clientId }, active + idle);
  }

  // DLQ and retry metrics
  public setDeadLetterQueueSize(
    topic: string,
    errorType: string,
    size: number
  ): void {
    this.deadLetterQueueSize.set({ topic, error_type: errorType }, size);
  }

  public recordRetryAttempt(
    topic: string,
    eventType: string,
    retryStrategy: 'immediate' | 'exponential' | 'fixed',
    finalStatus: 'success' | 'dlq' | 'abandoned'
  ): void {
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
  public setCircuitBreakerState(
    component: string,
    name: string,
    state: 'closed' | 'open' | 'half_open'
  ): void {
    const stateValue = state === 'closed' ? 0 : state === 'open' ? 1 : 2;
    this.circuitBreakerState.set({ component, name }, stateValue);
  }

  public recordCircuitBreakerFailure(
    component: string,
    name: string,
    failureType: 'timeout' | 'exception' | 'rejection'
  ): void {
    this.circuitBreakerFailures.inc({
      component,
      name,
      failure_type: failureType
    });
    this.recordError(failureType, `circuit_breaker_${component}_${name}`, 'high', true);
  }

  // Batch processing metrics
  public recordBatchProcessing(
    database: string,
    table: string,
    batchSize: number,
    duration: number,
    success: boolean
  ): void {
    this.recordDatabaseQuery('batch_select', table, duration, success);
    if (success) {
      this.recordUserAction('batch_processed', 'system', true);
    }
  }

  // Throughput monitoring
  public setEventsThroughput(
    direction: 'in' | 'out',
    topic: string,
    throughput: number
  ): void {
    this.eventsThroughputPerSecond.set({ direction, topic }, throughput);
  }

  public setQueueSize(
    queueType: 'incoming' | 'processing' | 'outgoing',
    database: string,
    table: string,
    size: number
  ): void {
    this.eventQueueSize.set({ queue_type: queueType, database, table }, size);
  }

  public setProcessingLag(
    database: string,
    table: string,
    lagSeconds: number
  ): void {
    this.eventProcessingLagSeconds.set({ database, table }, lagSeconds);
  }

  public setLoadBalanceFactor(factor: number): void {
    this.loadBalanceFactor.set(factor);
  }

  // Error recording with context
  public recordEventRelayError(
    type: 'database' | 'kafka' | 'processing' | 'serialization' | 'network',
    source: string,
    error: Error,
    recoverable: boolean = false,
    context?: Record<string, any>
  ): void {
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

  private determineErrorSeverity(
    type: string,
    error: Error,
    context?: Record<string, any>
  ): 'low' | 'medium' | 'high' | 'critical' {
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

// Экспорт синглтона
let metricsServiceInstance: EventRelayMetricsService | null = null;

export function getEventRelayMetricsService(): EventRelayMetricsService {
  if (!metricsServiceInstance) {
    metricsServiceInstance = new EventRelayMetricsService();
  }
  return metricsServiceInstance;
}