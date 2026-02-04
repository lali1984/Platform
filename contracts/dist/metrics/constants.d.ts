export declare const METRICS_CONSTANTS: {
    readonly BUCKETS: {
        readonly HTTP: readonly [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
        readonly DATABASE: readonly [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1];
        readonly KAFKA: readonly [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1];
        readonly GC: readonly [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1];
    };
    readonly SLO_TARGETS: {
        readonly AVAILABILITY: 0.999;
        readonly LATENCY_P95: 0.5;
        readonly LATENCY_P99: 1;
        readonly ERROR_BUDGET_WINDOW: number;
    };
    readonly SEVERITY: readonly ["low", "medium", "high", "critical"];
    readonly STATUS: readonly ["success", "error", "failed"];
    readonly UPDATE_INTERVALS: {
        readonly SYSTEM_METRICS: 15000;
        readonly SLO_METRICS: 60000;
    };
};
export type SeverityLevel = typeof METRICS_CONSTANTS.SEVERITY[number];
export type StatusType = typeof METRICS_CONSTANTS.STATUS[number];
//# sourceMappingURL=constants.d.ts.map