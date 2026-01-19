"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const event_service_1 = __importDefault(require("./services/event.service"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 3001;
// Инициализируем EventService ПРИ СТАРТЕ приложения
async function initializeServices() {
    try {
        await event_service_1.default.initialize();
        console.log('✅ EventService инициализирован (Kafka + Redis)');
    }
    catch (error) {
        console.warn('⚠️ EventService initialization warning:', error);
        // Продолжаем работу даже если EventService не инициализировался
    }
}
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Разрешаем все origins для локального тестирования
        const allowedOrigins = [
            'http://localhost:5173', // фронтенд
            'http://localhost:3001', // сам сервис
            'http://localhost:3000', // возможный другой порт
            'http://localhost:8080',
            'null', // file://
            undefined // прямой запрос без origin
        ];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_routes_1.default);
// Enhanced health check with event service status
app.get('/health', async (req, res) => {
    try {
        const eventStatus = await event_service_1.default.getStatus();
        const health = {
            status: 'ok',
            service: 'auth-service',
            timestamp: new Date().toISOString(),
            eventService: eventStatus
        };
        res.json(health);
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            service: 'auth-service',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});
// Error handling
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
// Запуск сервера с инициализацией сервисов
const startServer = async () => {
    await initializeServices();
    const server = app.listen(PORT, () => {
        console.log('🚀 Auth Service running on port', PORT);
        console.log('✅ Health check: http://localhost:' + PORT + '/health');
        console.log('✅ Register: POST http://localhost:' + PORT + '/api/auth/register');
        console.log('✅ Login: POST http://localhost:' + PORT + '/api/auth/login');
        console.log('✅ 2FA Generate: POST http://localhost:' + PORT + '/api/auth/2fa/generate');
        console.log('✅ 2FA Verify: POST http://localhost:' + PORT + '/api/auth/2fa/verify');
        console.log('✅ Refresh Token: POST http://localhost:' + PORT + '/api/auth/refresh-token');
        console.log('✅ Kafka events initialized for: user.registration, user.login, user.login_error, user.two_factor, user.password_reset');
    });
    // Graceful shutdown
    const shutdown = async () => {
        console.log('\n🔻 Shutting down auth service...');
        try {
            // Close event service connections
            await event_service_1.default.shutdown();
            console.log('✅ Event service connections closed (Redis + Kafka)');
            // Close HTTP server
            server.close(() => {
                console.log('✅ HTTP server closed');
                console.log('👋 Auth service shutdown complete');
                process.exit(0);
            });
            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('⚠️ Could not close connections in time, forcing shutdown');
                process.exit(1);
            }, 10000);
        }
        catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
};
startServer().catch((error) => {
    console.error('❌ Failed to start auth service:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map