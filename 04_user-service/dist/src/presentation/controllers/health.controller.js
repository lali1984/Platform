"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HealthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const terminus_1 = require("@nestjs/terminus");
const contracts_1 = require("@platform/contracts");
const typeorm_1 = require("typeorm");
let HealthController = HealthController_1 = class HealthController {
    constructor(health, db, memory, disk, connection, kafkaConsumer, kafkaProducer) {
        this.health = health;
        this.db = db;
        this.memory = memory;
        this.disk = disk;
        this.connection = connection;
        this.kafkaConsumer = kafkaConsumer;
        this.kafkaProducer = kafkaProducer;
        this.logger = new common_1.Logger(HealthController_1.name);
        this.startTime = Date.now();
    }
    async check() {
        var _a, _b;
        try {
            const healthResult = await this.health.check([
                () => this.checkDatabase(),
                () => this.checkKafka(),
                () => this.checkMemory(),
                () => this.checkDisk(),
            ]);
            const metrics = await this.getMetrics();
            const extendedResult = {
                status: 'ok',
                info: this.getServiceInfo(),
                metrics,
                details: {
                    database: this.getHealthIndicatorResult(healthResult, 'database'),
                    kafka: this.getHealthIndicatorResult(healthResult, 'kafka'),
                    memory: this.getHealthIndicatorResult(healthResult, 'memory_heap'),
                    disk: this.getHealthIndicatorResult(healthResult, 'disk'),
                },
                message: 'Service is healthy',
            };
            const dbStatus = this.getIndicatorStatus((_a = extendedResult.details) === null || _a === void 0 ? void 0 : _a.database);
            const kafkaStatus = this.getIndicatorStatus((_b = extendedResult.details) === null || _b === void 0 ? void 0 : _b.kafka);
            if (dbStatus === 'down') {
                this.logger.error('Database is down');
                extendedResult.status = 'error';
                extendedResult.message = 'Database unavailable';
                throw new common_1.ServiceUnavailableException('Database unavailable');
            }
            if (kafkaStatus === 'down') {
                this.logger.warn('Kafka is down - service running in degraded mode');
                extendedResult.message = 'Service running in degraded mode (Kafka down)';
            }
            return extendedResult;
        }
        catch (error) {
            this.logger.error('Health check failed:', error);
            return {
                status: 'error',
                message: 'Service is unhealthy',
                info: this.getServiceInfo(),
            };
        }
    }
    async liveness() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
        };
    }
    async readiness() {
        const checks = [];
        let isReady = true;
        try {
            const dbResult = await this.checkDatabase();
            checks.push({
                service: 'database',
                status: 'healthy',
                details: dbResult.database,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            checks.push({
                service: 'database',
                status: 'unhealthy',
                error: errorMessage
            });
            isReady = false;
        }
        try {
            const kafkaResult = await this.checkKafka();
            const consumerStatus = this.kafkaConsumer.getStatus();
            checks.push({
                service: 'kafka',
                status: consumerStatus.isConnected ? 'healthy' : 'degraded',
                isConnected: consumerStatus.isConnected,
                details: kafkaResult.kafka,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            checks.push({
                service: 'kafka',
                status: 'unhealthy',
                error: errorMessage
            });
        }
        if (!isReady) {
            throw new common_1.ServiceUnavailableException({
                status: 'not_ready',
                checks,
                message: 'Service is not ready to accept traffic',
            });
        }
        return {
            status: 'ready',
            checks,
        };
    }
    async checkDatabaseHealth() {
        try {
            const result = await this.checkDatabase();
            const driver = this.connection.driver;
            const pool = driver.pool;
            const poolInfo = pool ? {
                totalCount: pool.totalCount,
                idleCount: pool.idleCount,
                waitingCount: pool.waitingCount,
            } : null;
            return Object.assign({ status: 'healthy', details: {
                    database: this.connection.options.database,
                    host: this.connection.options.host || 'unknown',
                    port: this.connection.options.port || 'unknown',
                    pool: poolInfo,
                    migrations: await this.checkMigrations(),
                } }, result);
        }
        catch (error) {
            this.logger.error('Database health check failed:', error);
            return {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : String(error),
                details: {
                    database: this.connection.options.database,
                    connected: this.connection.isConnected,
                },
            };
        }
    }
    async checkKafkaHealth() {
        var _a, _b;
        try {
            const result = await this.checkKafka();
            const consumerStatus = this.kafkaConsumer.getStatus();
            const producerStatus = this.kafkaProducer.getStatus();
            return Object.assign({ status: 'healthy', details: {
                    consumer: {
                        isConnected: consumerStatus.isConnected,
                        isRunning: consumerStatus.isRunning,
                        topics: consumerStatus.topics,
                        subscribedTopicsCount: consumerStatus.subscribedTopicsCount,
                    },
                    producer: {
                        isConnected: producerStatus.isConnected,
                        circuitBreakerState: (_a = producerStatus.circuitBreakerState) !== null && _a !== void 0 ? _a : 'not_implemented',
                        failureCount: (_b = producerStatus.failureCount) !== null && _b !== void 0 ? _b : 0,
                    },
                } }, result);
        }
        catch (error) {
            this.logger.error('Kafka health check failed:', error);
            return {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : String(error),
                details: {
                    consumer: this.kafkaConsumer.getStatus(),
                    producer: this.kafkaProducer.getStatus(),
                },
            };
        }
    }
    async checkDatabase() {
        return this.db.pingCheck('database', {
            timeout: 3000,
            connection: this.connection,
        });
    }
    async checkKafka() {
        var _a;
        const consumerStatus = this.kafkaConsumer.getStatus();
        const producerStatus = this.kafkaProducer.getStatus();
        const isHealthy = consumerStatus.isConnected && producerStatus.isConnected;
        return {
            kafka: {
                status: isHealthy ? 'up' : 'down',
                consumerConnected: consumerStatus.isConnected,
                producerConnected: producerStatus.isConnected,
                topics: consumerStatus.topics,
                subscribedTopicsCount: consumerStatus.subscribedTopicsCount,
                circuitBreakerState: (_a = producerStatus.circuitBreakerState) !== null && _a !== void 0 ? _a : 'not_implemented',
            },
        };
    }
    async checkMemory() {
        return this.memory.checkHeap('memory_heap', 150 * 1024 * 1024);
    }
    async checkDisk() {
        return this.disk.checkStorage('disk', {
            thresholdPercent: 0.9,
            path: process.cwd(),
        });
    }
    getServiceInfo() {
        return {
            service: 'user-service',
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
            uptime: Date.now() - this.startTime,
            nodeVersion: process.version,
            pid: process.pid,
        };
    }
    async getMetrics() {
        var _a;
        const memoryUsage = process.memoryUsage();
        const driver = this.connection.driver;
        return {
            database: {
                poolSize: ((_a = driver.pool) === null || _a === void 0 ? void 0 : _a.totalCount) || 0,
                connected: this.connection.isConnected,
            },
            kafka: {
                consumerConnected: this.kafkaConsumer.getStatus().isConnected,
                producerConnected: this.kafkaProducer.getStatus().isConnected,
                topics: this.kafkaConsumer.getStatus().topics,
            },
            memory: {
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                rss: Math.round(memoryUsage.rss / 1024 / 1024),
            },
        };
    }
    async checkMigrations() {
        try {
            const queryRunner = this.connection.createQueryRunner();
            const migrationsTable = this.connection.options.migrationsTableName || 'migrations';
            const appliedMigrations = await queryRunner.query(`SELECT * FROM "${migrationsTable}" ORDER BY "timestamp" DESC`);
            const allMigrations = this.connection.migrations || [];
            return {
                pending: allMigrations.length - appliedMigrations.length,
                applied: appliedMigrations.length,
            };
        }
        catch (error) {
            this.logger.warn('Failed to check migrations:', error);
            return { pending: -1, applied: -1 };
        }
    }
    getHealthIndicatorResult(healthResult, key) {
        var _a;
        const result = (_a = healthResult.info) === null || _a === void 0 ? void 0 : _a[key];
        if (result && typeof result === 'object' && 'status' in result) {
            return result;
        }
        return {
            [key]: {
                status: 'down',
                message: 'Health check not available',
            }
        };
    }
    getIndicatorStatus(indicator) {
        if (!indicator)
            return 'unknown';
        const firstKey = Object.keys(indicator)[0];
        if (firstKey && indicator[firstKey] && typeof indicator[firstKey] === 'object') {
            const healthInfo = indicator[firstKey];
            return healthInfo.status || 'unknown';
        }
        return 'unknown';
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Полная проверка здоровья сервиса' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Сервис здоров' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Сервис нездоров' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('live'),
    (0, swagger_1.ApiOperation)({ summary: 'Liveness probe - проверка что сервис жив' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Сервис жив' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "liveness", null);
__decorate([
    (0, common_1.Get)('ready'),
    (0, swagger_1.ApiOperation)({ summary: 'Readiness probe - готовность принимать трафик' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Сервис готов' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Сервис не готов' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "readiness", null);
__decorate([
    (0, common_1.Get)('database'),
    (0, swagger_1.ApiOperation)({ summary: 'Проверка состояния базы данных' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "checkDatabaseHealth", null);
__decorate([
    (0, common_1.Get)('kafka'),
    (0, swagger_1.ApiOperation)({ summary: 'Проверка состояния Kafka' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "checkKafkaHealth", null);
exports.HealthController = HealthController = HealthController_1 = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [terminus_1.HealthCheckService,
        terminus_1.TypeOrmHealthIndicator,
        terminus_1.MemoryHealthIndicator,
        terminus_1.DiskHealthIndicator,
        typeorm_1.Connection,
        contracts_1.KafkaConsumerService,
        contracts_1.KafkaProducerService])
], HealthController);
//# sourceMappingURL=health.controller.js.map