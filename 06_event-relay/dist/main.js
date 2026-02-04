"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const EventRelayApplication_1 = require("./application/EventRelayApplication");
const HealthController_1 = require("./presentation/HealthController");
const metrics_service_1 = require("./infrastructure/metrics/metrics.service");
dotenv_1.default.config();
class EventRelayService {
    constructor() {
        this.metricsService = (0, metrics_service_1.getEventRelayMetricsService)();
        this.app = new EventRelayApplication_1.EventRelayApplication();
        this.expressApp = (0, express_1.default)();
        this.setupExpress();
    }
    setupExpress() {
        this.expressApp.use(express_1.default.json());
        this.expressApp.use(express_1.default.urlencoded({ extended: true }));
        const router = express_1.default.Router();
        router.get('/metrics', async (req, res) => {
            try {
                const metrics = await this.metricsService.getMetrics();
                res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
                res.send(metrics);
            }
            catch (error) {
                console.error('Error getting metrics:', error);
                // ✅ Всегда возвращаем text/plain для совместимости с Prometheus
                res.set('Content-Type', 'text/plain; charset=utf-8');
                res.status(500).send(`# HELP metrics_collection_failed Metrics collection failed\n` +
                    `# TYPE metrics_collection_failed gauge\n` +
                    `metrics_collection_failed{reason="${(error instanceof Error ? error.message : 'unknown').replace(/"/g, '\\"')}"} 1\n`);
            }
        });
        this.healthController = (0, HealthController_1.createHealthController)(this.app);
        this.healthController.setupRoutes(router);
        this.expressApp.use('/', router);
        this.expressApp.use((err, req, res, next) => {
            console.error('Unhandled error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            const shouldShowDetails = process.env.NODE_ENV === 'development';
            if (this.metricsService) {
                this.metricsService.recordEventRelayError('processing', 'global_error_handler', err instanceof Error ? err : new Error(String(err)), false, { path: req.path, method: req.method });
            }
            res.status(500).json({
                error: 'Internal server error',
                message: shouldShowDetails ? errorMessage : undefined,
            });
        });
    }
    async start() {
        const PORT = process.env.PORT || 3006;
        try {
            await this.app.initialize();
            this.expressApp.listen(PORT, () => {
                console.log('🚀 Event Relay Service started successfully!');
                console.log(`   Port: ${PORT}`);
                console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log('\n📚 Service capabilities:');
                console.log('   • Reading from multiple outbox tables');
                console.log('   • Publishing events to Kafka');
                console.log('   • Retry with exponential backoff');
                console.log('   • Circuit breaker pattern');
                console.log('   • Dead Letter Queue support');
                console.log('\n🌐 Health endpoints:');
                console.log(`   • http://localhost:${PORT}/health`);
                console.log(`   • http://localhost:${PORT}/status`);
                console.log(`   • http://localhost:${PORT}/metrics`);
            });
            await this.app.startPolling();
            this.setupGracefulShutdown();
        }
        catch (error) {
            console.error('❌ Failed to start event relay service:', error);
            process.exit(1);
        }
    }
    setupGracefulShutdown() {
        const shutdown = async () => {
            console.log('\n🔻 Shutting down event relay service...');
            try {
                await this.app.shutdown();
                console.log('👋 Event relay service shutdown complete');
                process.exit(0);
            }
            catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
}
const service = new EventRelayService();
service.start().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
