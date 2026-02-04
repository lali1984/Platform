/**
 * Circuit Breaker contracts for platform services
 * 
 * NOTE: This file contains ONLY type definitions.
 * Actual implementations live in individual services (e.g., event-relay).
 */

export type {
  CircuitBreakerStateType,
  CircuitBreakerOptions,
  CircuitBreakerState,
  ICircuitBreaker
} from '../../metrics/types';