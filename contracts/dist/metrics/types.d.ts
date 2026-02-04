export type ErrorType = 'processing' | 'database' | 'kafka' | 'serialization' | 'network' | 'initialization' | 'cleanup' | 'shutdown' | 'circuit_breaker' | 'dlq' | 'authentication' | 'authorization' | 'validation' | 'timeout' | 'resource' | 'configuration' | 'express';
export type BusinessTransactionStatus = 'started' | 'completed' | 'success' | 'failed' | 'cancelled';
export type CircuitBreakerStateType = 'closed' | 'open' | 'half_open';
export interface CircuitBreakerOptions {
    name?: string;
    failureThreshold: number;
    resetTimeout: number;
    timeout: number;
    halfOpenMaxAttempts?: number;
    fallback?: (error: Error) => any;
}
export interface CircuitBreakerState {
    state: CircuitBreakerStateType;
    failureCount: number;
    lastFailureTime?: number;
    nextAttemptTime?: number;
}
export interface ICircuitBreaker {
    execute<T>(fn: () => Promise<T>, fallback?: (error: Error) => Promise<T> | T): Promise<T>;
    getState(): CircuitBreakerState;
    reset(): void;
}
export interface EventRelayMetricLabels {
    source_db?: string;
    event_type?: string;
    topic?: string;
    table?: string;
    database?: string;
    polling_strategy?: 'batch' | 'streaming' | 'interval';
    batch_size?: string;
    retry_strategy?: 'immediate' | 'exponential' | 'fixed';
    final_status?: 'success' | 'dlq' | 'abandoned';
    failure_type?: 'timeout' | 'exception' | 'rejection';
    component?: string;
    direction?: 'in' | 'out';
    queue_type?: 'incoming' | 'processing' | 'outgoing';
}
//# sourceMappingURL=types.d.ts.map