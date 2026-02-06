import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import 'reflect-metadata';

import { createDataSource, initializeDatabase } from './infrastructure/config/database';
import { TypeORMUserRepository } from './infrastructure/persistence/repositories/type-orm-user.repository';
import { OutboxEventPublisher } from './infrastructure/event-publishers/outbox-event-publisher';
import { JwtTokenService } from './infrastructure/services/jwt-token';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { UserResponseMapper } from './application/dto/user-response.dto';
import { AuthController } from './presentation/controllers/auth-controller';
import { AuthMiddleware } from './presentation/middleware/auth-middleware';
import { setupRoutes } from './presentation/routes';

dotenv.config();

class AuthServiceApplication {
  private app: express.Application;
  private dataSource = createDataSource();

  constructor() {
    this.app = express();
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:3001',
          'http://localhost:3000',
          'http://localhost:8080',
          'null',
          undefined
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    this.app.use(express.json());
  }

  private async initializeDependencies(): Promise<void> {
    try {
      // 1. Инициализируем базу данных
      await initializeDatabase(this.dataSource);
      
      // 2. Создаем репозиторий
      const userRepository = new TypeORMUserRepository(this.dataSource);
      
      // 3. Создаем event publisher
      const eventPublisher = new OutboxEventPublisher(this.dataSource);
      
      // 4. Создаем token service (использует domain порт, не contracts)
      const tokenService = new JwtTokenService();
      
      // 5. Создаем auth middleware
      const authMiddleware = new AuthMiddleware(tokenService);
      
      // 6. Создаем UserResponseMapper (передаем userRepository)
      const userResponseMapper = new UserResponseMapper(userRepository);
      
      // 7. Создаем use cases
      const registerUserUseCase = new RegisterUserUseCase(userRepository, eventPublisher);
      const loginUserUseCase = new LoginUserUseCase(userRepository, tokenService, eventPublisher);
      
      // 8. Создаем контроллер со ВСЕМИ зависимостями (5 аргументов)
      const authController = new AuthController(
        registerUserUseCase,
        loginUserUseCase,
        userResponseMapper,
        tokenService,
        userRepository
      );
      
      // 9. Настраиваем маршруты
      setupRoutes(this.app, authController, authMiddleware);
      
      console.log('✅ Dependencies initialized successfully');
      console.log('📦 Using Outbox pattern for event publishing');
      console.log('🔒 Minimal external dependencies');
      console.log('📚 Contracts: @platform/contracts');
      
    } catch (error) {
      console.error('❌ Failed to initialize dependencies:', error);
      throw error;
    }
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ 
        success: false, 
        error: 'Route not found',
        path: req.path,
      });
    });

    // Global error handler
    this.app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
      });
    });
  }

  public async start(): Promise<void> {
    const PORT = process.env.PORT || 3001;

    try {
      // Инициализируем зависимости
      await this.initializeDependencies();
      
      // Настраиваем обработку ошибок
      this.setupErrorHandling();
      
      // Запускаем сервер
      this.app.listen(PORT, () => {
        console.log('🚀 Auth Service (Clean Architecture) started successfully!');
        console.log(`   Port: ${PORT}`);
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('   Available endpoints:');
        console.log(`   • http://localhost:${PORT}/health`);
        console.log(`   • http://localhost:${PORT}/api/auth/register (POST)`);
        console.log(`   • http://localhost:${PORT}/api/auth/login (POST)`);
        console.log(`   • http://localhost:${PORT}/api/auth/validate-token (POST)`);
        console.log(`   • http://localhost:${PORT}/api/auth/refresh-token (POST)`);
        console.log(`   • http://localhost:${PORT}/api/auth/logout (POST)`);
        console.log('\n📚 Architecture:');
        console.log('   • Clean Architecture with 4 layers');
        console.log('   • Domain-Driven Design');
        console.log('   • Ports & Adapters pattern');
        console.log('   • Outbox pattern for events');
        console.log('   • Contracts: @platform/contracts');
      });

      // Graceful shutdown
      this.setupGracefulShutdown();
      
    } catch (error) {
      console.error('❌ Failed to start auth service:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async () => {
      console.log('\n🔻 Shutting down auth service...');
      
      try {
        // Закрываем соединение с базой данных
        if (this.dataSource.isInitialized) {
          await this.dataSource.destroy();
          console.log('✅ Database connection closed');
        }
        
        console.log('👋 Auth service shutdown complete');
        process.exit(0);
        
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }
}

// Запуск приложения
const app = new AuthServiceApplication();
app.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});