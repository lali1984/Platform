"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
exports.createCircuitBreaker = createCircuitBreaker;
class CircuitBreaker {
    constructor(options) {
        this.states = new Map();
        this.options = Object.assign({ halfOpenMaxAttempts: 3 }, options);
    }
    // ✅ Исправлено: соответствует интерфейсу ICircuitBreaker
    async execute(fn, fallback) {
        const context = 'default';
        if (!this.canExecute(context)) {
            if (fallback) {
                return fallback(new Error(`Circuit breaker is ${this.getState(context).state}`));
            }
            throw new Error(`Circuit breaker is ${this.getState(context).state} for context: ${context}`);
        }
        const startTime = Date.now();
        try {
            const result = await Promise.race([
                fn(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Circuit breaker timeout')), this.options.timeout))
            ]);
            this.recordSuccess(context);
            return result;
        }
        catch (error) {
            const errorType = error instanceof Error && error.message === 'Circuit breaker timeout'
                ? 'timeout'
                : 'exception';
            this.recordFailure(context, errorType);
            if (fallback) {
                return fallback(error instanceof Error ? error : new Error(String(error)));
            }
            throw error;
        }
    }
    canExecute(context = 'default') {
        const state = this.getState(context);
        if (state.state === 'closed')
            return true;
        if (state.state === 'half_open')
            return true;
        if (state.state === 'open' && state.nextAttemptTime) {
            return Date.now() >= state.nextAttemptTime;
        }
        return false;
    }
    recordSuccess(context = 'default') {
        const state = this.states.get(context) || this.createDefaultState();
        state.failureCount = 0;
        state.state = 'closed';
        state.halfOpenAttempts = 0;
        this.states.set(context, state);
    }
    recordFailure(context = 'default', errorType = 'exception') {
        const state = this.states.get(context) || this.createDefaultState();
        state.failureCount++;
        state.lastFailureTime = Date.now();
        if (state.failureCount >= this.options.failureThreshold) {
            state.state = 'open';
            state.nextAttemptTime = Date.now() + this.options.resetTimeout;
        }
        this.states.set(context, state);
    }
    getState(context = 'default') {
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
    reset(context = 'default') {
        this.states.set(context, this.createDefaultState());
    }
    // Добавлен метод получения счетчика ошибок
    getFailureCount(context = 'default') {
        return this.getState(context).failureCount;
    }
    createDefaultState() {
        return {
            state: 'closed',
            failureCount: 0,
            lastFailureTime: undefined,
            nextAttemptTime: undefined,
            halfOpenAttempts: 0
        };
    }
    incrementHalfOpenAttempts(context) {
        const state = this.states.get(context);
        if (state && state.state === 'half_open') {
            state.halfOpenAttempts++;
            this.states.set(context, state);
        }
    }
}
exports.CircuitBreaker = CircuitBreaker;
function createCircuitBreaker(options) {
    return new CircuitBreaker(options);
}
