// Создать файл
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export class MetricsService {
  private readonly registry = new Registry();
  
  constructor() {
    this.registry.setDefaultLabels({
      app: 'bff-gateway',
      environment: process.env.NODE_ENV || 'development',
    });
    
    this.initializeMetrics();
  }
  
  private initializeMetrics(): void {
    // BFF-specific metrics
    new Counter({
      name: 'bff_requests_total',
      help: 'Total BFF requests',
      labelNames: ['endpoint', 'status'],
      registers: [this.registry],
    });
    
    new Histogram({
      name: 'bff_response_time_seconds',
      help: 'BFF response time',
      labelNames: ['endpoint'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });
    
    new Gauge({
      name: 'bff_cache_hit_ratio',
      help: 'Cache hit ratio',
      registers: [this.registry],
    });
    
    // External service metrics
    new Histogram({
      name: 'external_service_call_duration_seconds',
      help: 'External service call duration',
      labelNames: ['service', 'endpoint', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });
  }
  
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}