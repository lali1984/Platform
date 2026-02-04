import { Registry, Counter, Histogram, Gauge, Metric, Summary } from 'prom-client';
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
    targetAvailability: number;
    targetLatencyP95: number;
    targetLatencyP99: number;
    errorBudgetWindow: number;
}
export declare abstract class BaseMetricsService {
    protected readonly registry: Registry;
    protected readonly config: ServiceMetricsConfig;
    protected readonly sloConfig?: SLOConfig;
    protected readonly metrics: Map<string, Metric>;
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
    protected systemUptime?: Gauge;
    protected systemMemoryUsage?: Gauge;
    protected systemCpuUsage?: Gauge;
    protected systemGcDuration?: Histogram;
    constructor(config: ServiceMetricsConfig, sloConfig?: SLOConfig);
    private setupDefaultLabels;
    private enableDefaultMetrics;
    private initializeStandardMetrics;
    private initializeSLOMetrics;
    protected abstract initializeServiceSpecificMetrics(): void;
    protected registerCounter(name: string, help: string, labelNames?: string[]): Counter;
    protected registerHistogram(name: string, help: string, labelNames?: string[], buckets?: number[]): Histogram;
    protected registerGauge(name: string, help: string, labelNames?: string[]): Gauge;
    protected registerSummary(name: string, help: string, labelNames?: string[]): Summary;
    getMetrics(): Promise<string>;
    getRegistry(): Registry;
    setServiceHealth(healthy: boolean): void;
    recordBusinessTransaction(type: string, status: 'success' | 'failed'): void;
    recordError(type: string, source: string, severity: string, recoverable?: boolean): void;
    recordUserAction(actionType: string, userType: string, success: boolean): void;
    recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void;
    recordDatabaseQuery(operation: string, table: string, duration: number, success: boolean): void;
    setDatabaseConnections(database: string, active: number, idle: number, total: number): void;
    recordKafkaMessageProduced(topic: string, status: 'success' | 'error'): void;
    recordKafkaMessageConsumed(topic: string, status: 'success' | 'error', duration?: number): void;
    setKafkaConsumerLag(topic: string, partition: number, lag: number): void;
    recordDLQMessage(topic: string, errorType: string, retryCount: number): void;
    updateSystemMetrics(): void;
    private getBasicMetrics;
    private getStatusCategory;
    private normalizeRoute;
}
//# sourceMappingURL=BaseMetricsService.d.ts.map