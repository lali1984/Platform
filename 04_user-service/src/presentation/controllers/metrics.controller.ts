// ./04_user-service/src/presentation/controllers/metrics.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { MetricsService } from '../../infrastructure/metrics/metrics.service';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns Prometheus metrics',
    content: {
      'text/plain': {
        example: '# TYPE http_requests_total counter\nhttp_requests_total{method="GET",route="/health",status="2xx"} 42'
      }
    }
  })
  async getMetrics(@Res() res: Response): Promise<void> {
    try {
      const metrics = await this.metricsService.getMetrics();
      
      res.set('Content-Type', 'text/plain');
      res.send(metrics);
    } catch (error) {
      res.status(500).send('Error generating metrics');
    }
  }
}