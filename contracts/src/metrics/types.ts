// contracts/src/metrics/types.ts
// УДАЛИТЬ: эта строка создает дублирование
// Экспортируем типы из констант
// УДАЛИТЬ СТРОКУ: export { SeverityLevelType as SeverityLevel, StatusTypeType as StatusType } from './constants';

// contracts/src/metrics/types.ts
import { SeverityLevel, StatusType } from './constants';

// Расширить типы ошибок для Event Relay
export type ErrorType =
  | 'processing'
  | 'database'
  | 'kafka'
  | 'serialization'
  | 'network'
  | 'initialization'
  | 'cleanup'
  | 'shutdown'
  | 'circuit_breaker'
  | 'dlq'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'timeout'
  | 'resource'
  | 'configuration'
  | 'express';  // Добавлено для обработки Express ошибок

// Расширить типы бизнес-транзакций
export type BusinessTransactionStatus = 'started' | 'completed' | 'success' | 'failed' | 'cancelled';

// ... остальные типы без изменений
// Circuit Breaker типы
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
  execute<T>(
    fn: () => Promise<T>,
    fallback?: (error: Error) => Promise<T> | T
  ): Promise<T>;
  getState(): CircuitBreakerState;
  reset(): void;
}

// Интерфейсы для Event Relay специфичных метрик
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