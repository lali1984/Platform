import { Response } from 'express';
import { MetricsService } from '../../infrastructure/metrics/metrics';
export declare class MetricsController {
    private readonly metricsService;
    constructor(metricsService: MetricsService);
    getMetrics(res: Response): Promise<void>;
}
