"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// /02_bff-gateway/src/main.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
// Infrastructure
const environment_1 = require("./infrastructure/config/environment");
const bff_config_1 = require("./infrastructure/config/bff.config");
const auth_http_client_1 = require("./infrastructure/http-clients/auth-http.client");
const user_http_client_1 = require("./infrastructure/http-clients/user-http.client");
//import { InMemoryCacheAdapter } from './infrastructure/cache/in-memory-cache.adapter';
const redis_cache_adapter_1 = require("./infrastructure/cache/redis-cache.adapter"); // Убедись, что этот файл создан
// Domain & Application
const get_user_profile_use_case_1 = require("./application/use-cases/get-user-profile.use-case");
const auth_user_use_case_1 = require("./application/use-cases/auth-user.use-case");
// Presentation
const user_controller_1 = require("./presentation/controllers/user.controller");
const auth_middleware_1 = require("./presentation/middleware/auth.middleware");
const api_routes_1 = require("./presentation/routes/api.routes");
const error_handler_middleware_1 = require("./presentation/middleware/error-handler.middleware");
const auth_controller_1 = require("./presentation/controllers/auth.controller");
class BFFApplication {
    constructor() {
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupDependencies();
        this.setupRoutes();
        this.setupHealthCheck(); // ✅ Добавлен health check
        this.setupErrorHandling();
    }
    setupMiddleware() {
        // Security
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)({
            origin: environment_1.environment.NODE_ENV === 'production'
                ? process.env.CORS_ORIGIN || 'http://localhost:5173'
                : 'http://localhost:5173', // Для разработки разрешаем фронтенд
            credentials: true,
        }));
        // Performance
        this.app.use((0, compression_1.default)());
        // Logging
        this.app.use((0, morgan_1.default)(environment_1.environment.NODE_ENV === 'production' ? 'combined' : 'dev'));
        // Body parsing
        this.app.use(express_1.default.json({ limit: bff_config_1.bffConfig.server.maxPayloadSize }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // Request timeout
        this.app.use((req, res, next) => {
            req.setTimeout(bff_config_1.bffConfig.server.requestTimeout, () => {
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
    setupDependencies() {
        console.log('🚀 Initializing BFF dependencies...');
        // Infrastructure layer
        const authClient = new auth_http_client_1.AuthHttpClient();
        const userClient = new user_http_client_1.UserHttpClient();
        // Выбор кэша: Redis для продакшена, InMemory для разработки без Redis
        // Проверяем обязательную переменную
        if (!environment_1.environment.REDIS_URL) {
            console.error('❌ REDIS_URL is required for BFF Gateway');
            throw new Error('REDIS_URL environment variable is required');
        }
        console.log('✅ Using Redis cache');
        const cache = new redis_cache_adapter_1.RedisCacheAdapter(environment_1.environment.REDIS_URL);
        // Application layer
        const getUserProfileUseCase = new get_user_profile_use_case_1.GetUserProfileUseCase(authClient, userClient, cache);
        const authUserUseCase = new auth_user_use_case_1.AuthUserUseCase(authClient, userClient, cache);
        // Presentation layer
        const userController = new user_controller_1.UserController(getUserProfileUseCase);
        const authController = new auth_controller_1.AuthController(authUserUseCase);
        const authMiddleware = new auth_middleware_1.AuthMiddleware(authClient);
        const apiRoutes = new api_routes_1.ApiRoutes(userController, authController, authMiddleware);
        // Mount routes
        this.app.use(apiRoutes.getRouter());
        console.log('✅ Dependencies initialized successfully');
    }
    setupRoutes() {
        // Basic info endpoint
        this.app.get('/', (req, res) => {
            res.json({
                service: 'BFF Gateway',
                version: '1.0.0',
                environment: environment_1.environment.NODE_ENV,
                timestamp: new Date().toISOString(),
                features: {
                    authentication: 'JWT + Redis',
                    caching: environment_1.environment.REDIS_URL ? 'Redis' : 'InMemory (dev only)',
                    architecture: 'Clean Architecture + DDD',
                    cacheTtl: `${environment_1.environment.CACHE_TTL} seconds`,
                },
                endpoints: {
                    health: '/health',
                    api: '/api/*',
                    docs: 'Coming soon...',
                },
            });
        });
    }
    setupHealthCheck() {
        this.app.get('/health', async (req, res) => {
            const health = {
                status: 'ok',
                service: 'bff-gateway',
                timestamp: new Date().toISOString(),
                environment: environment_1.environment.NODE_ENV,
                dependencies: {
                    authService: 'unknown',
                    userService: 'unknown',
                    cache: environment_1.environment.REDIS_URL ? 'redis' : 'in-memory',
                    cacheStatus: 'unknown',
                },
                uptime: process.uptime(),
                memory: process.memoryUsage(),
            };
            try {
                // Проверяем доступность auth-service
                const authResponse = await fetch(`${environment_1.environment.AUTH_SERVICE_URL}/health`);
                health.dependencies.authService = authResponse.ok ? 'ok' : 'error';
            }
            catch (error) {
                health.dependencies.authService = 'error';
                health.status = 'degraded';
            }
            try {
                // Проверяем доступность user-service
                const userResponse = await fetch(`${environment_1.environment.USER_SERVICE_URL}/health`);
                health.dependencies.userService = userResponse.ok ? 'ok' : 'error';
            }
            catch (error) {
                health.dependencies.userService = 'error';
                health.status = 'degraded';
            }
            // Проверяем состояние кэша
            if (environment_1.environment.REDIS_URL) {
                try {
                    const cache = new redis_cache_adapter_1.RedisCacheAdapter(environment_1.environment.REDIS_URL);
                    const cacheHealth = await cache.healthCheck();
                    health.dependencies.cacheStatus = cacheHealth ? 'ok' : 'error';
                    if (!cacheHealth)
                        health.status = 'degraded';
                }
                catch (error) {
                    health.dependencies.cacheStatus = 'error';
                    health.status = 'degraded';
                }
            }
            else {
                health.dependencies.cacheStatus = 'in-memory (no health check)';
            }
            // Определяем HTTP статус ответа
            if (health.status === 'degraded') {
                res.status(503).json(health);
            }
            else {
                res.status(200).json(health);
            }
        });
    }
    setupErrorHandling() {
        // Global error handler
        this.app.use(error_handler_middleware_1.ErrorHandlerMiddleware.handleError);
    }
    start() {
        const server = this.app.listen(environment_1.environment.PORT, () => {
            console.log(`
🚀 BFF Gateway started successfully!
`);
            console.log(`   Environment: ${environment_1.environment.NODE_ENV}`);
            console.log(`   Port: ${environment_1.environment.PORT}`);
            console.log(`   Auth Service: ${environment_1.environment.AUTH_SERVICE_URL}`);
            console.log(`   User Service: ${environment_1.environment.USER_SERVICE_URL}`);
            console.log(`   Redis URL: ${environment_1.environment.REDIS_URL ? 'Configured ✅' : 'NOT CONFIGURED ❌'}`);
            console.log(`   Cache TTL: ${environment_1.environment.CACHE_TTL} seconds`);
            console.log(`
    Available endpoints:`);
            console.log(`   • http://localhost:${environment_1.environment.PORT}/`);
            console.log(`   • http://localhost:${environment_1.environment.PORT}/health`);
            console.log(`   • http://localhost:${environment_1.environment.PORT}/api/auth/login`);
            console.log(`   • http://localhost:${environment_1.environment.PORT}/api/auth/register`);
            console.log(`   • http://localhost:${environment_1.environment.PORT}/api/users/profile/me (protected)`);
            console.log(`
📚 Production Status:`);
            console.log(`   • Architecture: Clean Architecture + DDD`);
            console.log(`   • Caching: ${environment_1.environment.REDIS_URL ? '✅ Redis (Production-ready)' : '❌ Redis NOT configured (FATAL)'}`);
            console.log(`   • Health Checks: ✅ Enabled with dependency monitoring`);
            console.log(`   • Security: ✅ Helmet + CORS configured`);
            console.log(`   • Logging: ✅ ${environment_1.environment.NODE_ENV === 'production' ? 'Production mode' : 'Development mode'}`);
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
