// ./04_user-service/src/presentation/middleware/metrics.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../../infrastructure/metrics/metrics';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(MetricsMiddleware.name);
  private readonly excludedPaths = ['/metrics', '/favicon.ico'];

  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const path = this.normalizePath(req.path);

    // Пропускаем excluded paths
    if (this.excludedPaths.includes(path)) {
      return next();
    }

    // Перехватываем отправку ответа
    const originalSend = res.send.bind(res);
    res.send = (body: any): Response => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      
      try {
        this.metricsService.recordHttpRequest(
          req.method,
          path,
          statusCode,
          duration / 1000, // в секундах
        );
      } catch (error) {
        this.logger.warn(`Failed to record metrics for ${req.method} ${path}:`, error);
      }

      return originalSend(body);
    };

    next();
  }

  private normalizePath(path: string): string {
    // Нормализуем path для метрик (убираем IDs)
    return path
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, '/:id')
      .replace(/\/\d+/g, '/:id')
      .replace(/\/$/, ''); // Убираем trailing slash
  }
}