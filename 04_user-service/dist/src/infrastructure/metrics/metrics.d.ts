import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Registry } from 'prom-client';
export interface MetricsLabels {
    [key: string]: string;
}
export declare class MetricsService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private readonly registry;
    private readonly metrics;
    private metricsInterval;
    private systemMetrics;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private initializeMetrics;
    getRegistry(): Registry;
    getMetrics(): Promise<string>;
    recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void;
    recordDatabaseQuery(operation: string, table: string, duration: number, success: boolean): void;
    setDatabaseConnections(active: number, idle: number, total: number): void;
    recordKafkaMessageConsumed(topic: string, status: 'success' | 'error', duration?: number): void;
    recordKafkaMessageProduced(topic: string, status: 'success' | 'error'): void;
    setKafkaConsumerLag(topic: string, partition: number, lag: number): void;
    recordUserRegistration(source: string, status: 'success' | 'error'): void;
    recordUserProfileUpdate(field: string): void;
    setUsersTotal(status: string, count: number): void;
    setUsersActive(count: number): void;
    recordUserProfileCompletion(percentage: number): void;
    recordError(type: string, service: string, severity: 'low' | 'medium' | 'high' | 'critical'): void;
    recordDlqMessage(topic: string, errorType: string): void;
    private registerCounter;
    private registerHistogram;
    private registerGauge;
    private incrementCounter;
    private observeHistogram;
    private setGauge;
    private getStatusCategory;
    private startSystemMetricsCollection;
    private stopSystemMetricsCollection;
    private collectSystemMetrics;
}
