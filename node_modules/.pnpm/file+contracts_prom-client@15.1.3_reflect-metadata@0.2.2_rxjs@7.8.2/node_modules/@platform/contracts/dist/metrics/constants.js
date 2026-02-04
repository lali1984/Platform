"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.METRICS_CONSTANTS = void 0;
exports.METRICS_CONSTANTS = {
    // Стандартные buckets для различных типов метрик
    BUCKETS: {
        HTTP: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        DATABASE: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
        KAFKA: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
        GC: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
    },
    // Стандартные SLO targets
    SLO_TARGETS: {
        AVAILABILITY: 0.999, // 99.9%
        LATENCY_P95: 0.5, // 500ms
        LATENCY_P99: 1, // 1s
        ERROR_BUDGET_WINDOW: 28 * 24 * 60 * 60, // 28 дней в секундах
    },
    // Стандартные label values
    SEVERITY: ['low', 'medium', 'high', 'critical'],
    STATUS: ['success', 'error', 'failed'],
    // Интервалы обновления
    UPDATE_INTERVALS: {
        SYSTEM_METRICS: 15000, // 15 секунд
        SLO_METRICS: 60000, // 1 минута
    },
};
//# sourceMappingURL=constants.js.map