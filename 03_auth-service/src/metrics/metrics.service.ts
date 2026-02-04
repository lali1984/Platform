import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit, OnModuleDestroy {
  private readonly registry = new Registry();
  private httpRequestsTotal!: Counter;
  private httpRequestDuration!: Histogram;
  private authRequestsTotal!: Counter;
  private jwtTokensIssuedTotal!: Counter;

  constructor() {
    this.registry.setDefaultLabels({
      app: 'auth-service',
      environment: process.env.NODE_ENV || 'development',
    });
  }

  // ✅ Обязательный метод OnModuleInit
  onModuleInit(): void {
    this.initializeMetrics();
  }

  // ✅ Обязательный метод OnModuleDestroy
  async onModuleDestroy(): Promise<void> {
    // Очистка ресурсов при необходимости
    this.registry.clear();
  }

  private initializeMetrics(): void {
    // Auth-specific metrics
    this.authRequestsTotal = new Counter({
      name: 'auth_requests_total',
      help: 'Total authentication requests',
      labelNames: ['type', 'status'] as const,
      registers: [this.registry],
    });

    this.jwtTokensIssuedTotal = new Counter({
      name: 'jwt_tokens_issued_total',
      help: 'Total JWT tokens issued',
      labelNames: ['type'] as const,
      registers: [this.registry],
    });

    // HTTP metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status'] as const,
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status'] as const,
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });
  }

  async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }

  // Методы для записи метрик
  recordAuthRequest(type: string, status: string): void {
    this.authRequestsTotal.inc({ type, status });
  }

  recordJwtTokenIssued(type: string): void {
    this.jwtTokensIssuedTotal.inc({ type });
  }

  recordHttpRequest(method: string, route: string, status: number, duration: number): void {
    this.httpRequestsTotal.inc({ method, route, status: status.toString() });
    this.httpRequestDuration.observe({ method, route, status: status.toString() }, duration);
  }
}