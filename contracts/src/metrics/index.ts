// contracts/src/metrics/index.ts
export * from './BaseMetricsService';
export * from './constants';

// Явный экспорт из types без дублирования
export type {
  ErrorType,
  BusinessTransactionStatus,
  CircuitBreakerOptions,
  CircuitBreakerState,
  CircuitBreakerStateType,
  ICircuitBreaker,
  EventRelayMetricLabels,
} from './types';

export {
  BaseMetricsService,
} from './BaseMetricsService';