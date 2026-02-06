import express from 'express';
import { EventRelayApplication } from '../application/event-relay';

export class HealthController {
  constructor(private readonly app: EventRelayApplication) {}

  public setupRoutes(router: express.Router): void {
    router.get('/health', this.getHealth.bind(this));
    router.get('/status', this.getStatus.bind(this));
    router.get('/metrics', this.getHealthMetrics.bind(this));
  }

  private getHealth(req: express.Request, res: express.Response): void {
    try {
      const status = this.app.getStatus();
      
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          'auth-service': status.monitoredServices >= 1 ? 'connected' : 'disconnected',
          'user-service': status.monitoredServices >= 2 ? 'connected' : 'disconnected',
        },
        kafka: status.kafkaStatus,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };

      res.status(200).json(healthStatus);
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private getStatus(req: express.Request, res: express.Response): void {
    try {
      const status = this.app.getStatus();
      
      const detailedStatus = {
        isRunning: status.isRunning,
        monitoredServices: status.monitoredServices,
        kafkaStatus: status.kafkaStatus,
        pollingInterval: status.pollingInterval,
        uptime: process.uptime(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        memory: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB',
        },
      };

      res.status(200).json(detailedStatus);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get status',
       message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private getHealthMetrics(req: express.Request, res: express.Response): void {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      process: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      eventRelay: this.app.getStatus(),
      system: {
        arch: process.arch,
        platform: process.platform,
        version: process.version,
      },
    };
    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
  // private getMetrics(req: express.Request, res: express.Response): void {
  //   try {
  //     const metrics = {
  //       timestamp: new Date().toISOString(),
  //       process: {
  //         uptime: process.uptime(),
  //         memory: process.memoryUsage(),
  //         cpu: process.cpuUsage(),
  //       },
  //       eventRelay: this.app.getStatus(),
  //       system: {
  //         arch: process.arch,
  //         platform: process.platform,
  //         version: process.version,
  //       },
  //     };

  //     res.status(200).json(metrics);
  //   } catch (error) {
  //     res.status(500).json({
  //       error: error instanceof Error ? error.message : String(error),
  //     });
  //   }
  // }
}

export const createHealthController = (app: EventRelayApplication): HealthController => {
  return new HealthController(app);
};