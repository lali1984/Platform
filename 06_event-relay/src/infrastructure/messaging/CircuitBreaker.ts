import {
  CircuitBreakerOptions,
  CircuitBreakerState,
  ICircuitBreaker
} from '@platform/contracts';

export class CircuitBreaker implements ICircuitBreaker {
  private readonly options: CircuitBreakerOptions;
  private readonly states: Map<string, {
    state: 'closed' | 'open' | 'half_open';
    failureCount: number;
    lastFailureTime?: number;
    nextAttemptTime?: number;
    halfOpenAttempts: number;
  }> = new Map();

  constructor(options: CircuitBreakerOptions) {
    this.options = {
      halfOpenMaxAttempts: 3,
      ...options
    };
  }

  // ✅ Исправлено: соответствует интерфейсу ICircuitBreaker
  public async execute<T>(
    fn: () => Promise<T>,
    fallback?: (error: Error) => Promise<T> | T
  ): Promise<T> {
    const context = 'default';
    
    if (!this.canExecute(context)) {
      if (fallback) {
        return fallback(new Error(`Circuit breaker is ${this.getState(context).state}`)) as T;
      }
      throw new Error(`Circuit breaker is ${this.getState(context).state} for context: ${context}`);
    }

    const startTime = Date.now();

    try {
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Circuit breaker timeout')), this.options.timeout)
        )
      ]) as T;

      this.recordSuccess(context);
      return result;

    } catch (error) {
      const errorType = error instanceof Error && error.message === 'Circuit breaker timeout' 
        ? 'timeout' 
        : 'exception';
      
      this.recordFailure(context, errorType);
      
      if (fallback) {
        return fallback(error instanceof Error ? error : new Error(String(error))) as T;
      }
      
      throw error;
    }
  }

  public canExecute(context: string = 'default'): boolean {
    const state = this.getState(context);
    if (state.state === 'closed') return true;
    if (state.state === 'half_open') return true;

    if (state.state === 'open' && state.nextAttemptTime) {
      return Date.now() >= state.nextAttemptTime;
    }

    return false;
  }

  public recordSuccess(context: string = 'default'): void {
    const state = this.states.get(context) || this.createDefaultState();
    state.failureCount = 0;
    state.state = 'closed';
    state.halfOpenAttempts = 0;

    this.states.set(context, state);
  }

  public recordFailure(context: string = 'default', errorType: string = 'exception'): void {
    const state = this.states.get(context) || this.createDefaultState();
    state.failureCount++;
    state.lastFailureTime = Date.now();

    if (state.failureCount >= this.options.failureThreshold) {
      state.state = 'open';
      state.nextAttemptTime = Date.now() + this.options.resetTimeout;
    }

    this.states.set(context, state);
  }

  public getState(context: string = 'default'): CircuitBreakerState {
    const state = this.states.get(context) || this.createDefaultState();

    if (state.state === 'open' && state.nextAttemptTime && Date.now() >= state.nextAttemptTime) {
      state.state = 'half_open';
      state.halfOpenAttempts = 0;
      state.nextAttemptTime = undefined;
    }

    if (state.state === 'half_open' && 
        state.halfOpenAttempts >= (this.options.halfOpenMaxAttempts || 3)) {
      state.state = 'closed';
      state.failureCount = 0;
      state.halfOpenAttempts = 0;
    }

    return {
      state: state.state,
      failureCount: state.failureCount,
      lastFailureTime: state.lastFailureTime,
      nextAttemptTime: state.nextAttemptTime
    };
  }

  public reset(context: string = 'default'): void {
    this.states.set(context, this.createDefaultState());
  }

  // Добавлен метод получения счетчика ошибок
  public getFailureCount(context: string = 'default'): number {
    return this.getState(context).failureCount;
  }

  private createDefaultState() {
    return {
      state: 'closed' as const,
      failureCount: 0,
      lastFailureTime: undefined,
      nextAttemptTime: undefined,
      halfOpenAttempts: 0
    };
  }

  private incrementHalfOpenAttempts(context: string): void {
    const state = this.states.get(context);
    if (state && state.state === 'half_open') {
      state.halfOpenAttempts++;
      this.states.set(context, state);
    }
  }
}

export function createCircuitBreaker(options: CircuitBreakerOptions): CircuitBreaker {
  return new CircuitBreaker(options);
}