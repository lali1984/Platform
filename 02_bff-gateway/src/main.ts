// /02_bff-gateway/src/main.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Infrastructure
import { environment } from './infrastructure/config/environment';
import { bffConfig } from './infrastructure/config/bff.config';
import { AuthHttpClient } from './infrastructure/http-clients/auth-http.client';
import { UserHttpClient } from './infrastructure/http-clients/user-http.client';
//import { InMemoryCacheAdapter } from './infrastructure/cache/in-memory-cache.adapter';
import { RedisCacheAdapter } from './infrastructure/cache/redis-cache.adapter'; // Убедись, что этот файл создан

// Domain & Application
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { AuthUserUseCase } from './application/use-cases/auth-user.use-case';

// Presentation
import { UserController } from './presentation/controllers/user.controller';
import { AuthMiddleware } from './presentation/middleware/auth.middleware';
import { ApiRoutes } from './presentation/routes/api.routes';
import { ErrorHandlerMiddleware } from './presentation/middleware/error-handler.middleware';
import { AuthController } from "./presentation/controllers/auth.controller";

class BFFApplication {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupDependencies();
    this.setupRoutes();
    this.setupHealthCheck(); // ✅ Добавлен health check
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security
    this.app.use(helmet());
    this.app.use(cors({
      origin: environment.NODE_ENV === 'production' 
        ? process.env.CORS_ORIGIN || 'http://localhost:5173'
        : 'http://localhost:5173', // Для разработки разрешаем фронтенд
      credentials: true,
    }));

    // Performance
    this.app.use(compression());
    
    // Logging
    this.app.use(morgan(environment.NODE_ENV === 'production' ? 'combined' : 'dev'));

    // Body parsing
    this.app.use(express.json({ limit: bffConfig.server.maxPayloadSize }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request timeout
    this.app.use((req, res, next) => {
      req.setTimeout(bffConfig.server.requestTimeout, () => {
        res.status(408).json({
          success: false,
          error: 'Request timeout',
          timestamp: new Date().toISOString(),
        });
      });
      next();
    });
  }

  // Исправляем setupDependencies():
private setupDependencies(): void {
  console.log('🚀 Initializing BFF dependencies...');

  // Infrastructure layer
  const authClient = new AuthHttpClient();
  const userClient = new UserHttpClient();
    
    // Выбор кэша: Redis для продакшена, InMemory для разработки без Redis
    // Проверяем обязательную переменную
  if (!environment.REDIS_URL) {
    console.error('❌ REDIS_URL is required for BFF Gateway');
    throw new Error('REDIS_URL environment variable is required');
  }
  
  console.log('✅ Using Redis cache');
  const cache = new RedisCacheAdapter(environment.REDIS_URL);

  // Application layer
  const getUserProfileUseCase = new GetUserProfileUseCase(authClient, userClient, cache);
  const authUserUseCase = new AuthUserUseCase(authClient, userClient, cache);

  // Presentation layer
  const userController = new UserController(getUserProfileUseCase);
  const authController = new AuthController(authUserUseCase);
  const authMiddleware = new AuthMiddleware(authClient);
  
  const apiRoutes = new ApiRoutes(userController, authController, authMiddleware);

  // Mount routes
  this.app.use(apiRoutes.getRouter());

  console.log('✅ Dependencies initialized successfully');
}

  private setupRoutes(): void {
    // Basic info endpoint
    this.app.get('/', (req, res) => {
      res.json({
        service: 'BFF Gateway',
        version: '1.0.0',
        environment: environment.NODE_ENV,
        timestamp: new Date().toISOString(),
        features: {
          authentication: 'JWT + Redis',
          caching: environment.REDIS_URL ? 'Redis' : 'InMemory (dev only)',
          architecture: 'Clean Architecture + DDD',
          cacheTtl: `${environment.CACHE_TTL} seconds`,
        },
        endpoints: {
          health: '/health',
          api: '/api/*',
          docs: 'Coming soon...',
        },
      });
    });
  }

  private setupHealthCheck(): void {
    this.app.get('/health', async (req, res) => {
      const health = {
        status: 'ok',
        service: 'bff-gateway',
        timestamp: new Date().toISOString(),
        environment: environment.NODE_ENV,
        dependencies: {
          authService: 'unknown',
          userService: 'unknown',
          cache: environment.REDIS_URL ? 'redis' : 'in-memory',
          cacheStatus: 'unknown',
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };

      try {
        // Проверяем доступность auth-service
        const authResponse = await fetch(`${environment.AUTH_SERVICE_URL}/health`);
        health.dependencies.authService = authResponse.ok ? 'ok' : 'error';
      } catch (error) {
        health.dependencies.authService = 'error';
        health.status = 'degraded';
      }

      try {
        // Проверяем доступность user-service
        const userResponse = await fetch(`${environment.USER_SERVICE_URL}/health`);
        health.dependencies.userService = userResponse.ok ? 'ok' : 'error';
      } catch (error) {
        health.dependencies.userService = 'error';
        health.status = 'degraded';
      }

      // Проверяем состояние кэша
      if (environment.REDIS_URL) {
        try {
          const cache = new RedisCacheAdapter(environment.REDIS_URL);
          const cacheHealth = await cache.healthCheck();
          health.dependencies.cacheStatus = cacheHealth ? 'ok' : 'error';
          if (!cacheHealth) health.status = 'degraded';
        } catch (error) {
          health.dependencies.cacheStatus = 'error';
          health.status = 'degraded';
        }
      } else {
        health.dependencies.cacheStatus = 'in-memory (no health check)';
      }

      // Определяем HTTP статус ответа
      if (health.status === 'degraded') {
        res.status(503).json(health);
      } else {
        res.status(200).json(health);
      }
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use(ErrorHandlerMiddleware.handleError);
  }

  public start(): void {
    const server = this.app.listen(environment.PORT, () => {
      console.log(`
🚀 BFF Gateway started successfully!
`);
      console.log(`   Environment: ${environment.NODE_ENV}`);
      console.log(`   Port: ${environment.PORT}`);
      console.log(`   Auth Service: ${environment.AUTH_SERVICE_URL}`);
      console.log(`   User Service: ${environment.USER_SERVICE_URL}`);
      console.log(`   Redis URL: ${environment.REDIS_URL ? 'Configured ✅' : 'NOT CONFIGURED ❌'}`);
      console.log(`   Cache TTL: ${environment.CACHE_TTL} seconds`);
      console.log(`
    Available endpoints:`);
      console.log(`   • http://localhost:${environment.PORT}/`);
      console.log(`   • http://localhost:${environment.PORT}/health`);
      console.log(`   • http://localhost:${environment.PORT}/api/auth/login`);
      console.log(`   • http://localhost:${environment.PORT}/api/auth/register`);
      console.log(`   • http://localhost:${environment.PORT}/api/users/profile/me (protected)`);
      console.log(`
📚 Production Status:`);
      console.log(`   • Architecture: Clean Architecture + DDD`);
      console.log(`   • Caching: ${environment.REDIS_URL ? '✅ Redis (Production-ready)' : '❌ Redis NOT configured (FATAL)'}`);
      console.log(`   • Health Checks: ✅ Enabled with dependency monitoring`);
      console.log(`   • Security: ✅ Helmet + CORS configured`);
      console.log(`   • Logging: ✅ ${environment.NODE_ENV === 'production' ? 'Production mode' : 'Development mode'}`);
      console.log(`
`);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('🔻 Received shutdown signal. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ BFF Gateway shut down gracefully.');
        process.exit(0);
      });

      // Принудительное завершение через 10 секунд
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcing shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  }
}

// Start the application
const bffApp = new BFFApplication();
bffApp.start();