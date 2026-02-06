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
var KafkaBootstrapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaBootstrapService = void 0;
const common_1 = require("@nestjs/common");
const contracts_1 = require("@platform/contracts");
const handle_user_registered_event_1 = require("../../application/use-cases/handle-user-registered-event");
let KafkaBootstrapService = KafkaBootstrapService_1 = class KafkaBootstrapService {
    constructor(kafkaConsumer, kafkaProducer, handleUserRegisteredEvent) {
        this.kafkaConsumer = kafkaConsumer;
        this.kafkaProducer = kafkaProducer;
        this.handleUserRegisteredEvent = handleUserRegisteredEvent;
        this.logger = new common_1.Logger(KafkaBootstrapService_1.name);
        this.isInitialized = false;
        this.isHealthy = false;
        this.startTime = Date.now();
        this.healthCheckInterval = 30000;
        this.healthCheckTimer = null;
        this.metrics = {
            messagesProcessed: 0,
            errors: 0,
            lastMessageTime: null,
            reconnectAttempts: 0,
            consumerLag: 0,
        };
    }
    async onModuleInit() {
        try {
            await this.initializeKafka();
            this.startHealthChecks();
        }
        catch (error) {
            this.logger.error('Failed to initialize Kafka:', error);
        }
    }
    async initializeKafka() {
        try {
            this.logger.log('🚀 Initializing Kafka infrastructure...');
            await this.kafkaProducer.connect();
            this.logger.log('✅ Kafka producer connected');
            await this.kafkaConsumer.connect();
            this.logger.log('✅ Kafka consumer connected');
            await this.setupSubscriptions();
            await this.kafkaConsumer.start();
            this.isInitialized = true;
            this.isHealthy = true;
            this.startTime = Date.now();
            this.logger.log('🎉 Kafka infrastructure fully initialized and healthy');
        }
        catch (error) {
            this.logger.error('❌ Failed to initialize Kafka infrastructure:', error);
            this.isHealthy = false;
            this.metrics.reconnectAttempts++;
            setTimeout(() => this.attemptReconnect(), 10000);
            throw error;
        }
    }
    async setupSubscriptions() {
        try {
            this.logger.log('📝 Setting up Kafka subscriptions...');
            await this.kafkaConsumer.subscribe('auth-service.user-registered.v1', this.handleUserRegisteredMessage.bind(this));
            this.logger.log('✅ Subscribed to auth-service.user-registered.v1');
        }
        catch (error) {
            this.logger.error('❌ Failed to setup subscriptions:', error);
            throw error;
        }
    }
    async handleUserRegisteredMessage(message) {
        const startTime = Date.now();
        const messageId = message.eventId || 'unknown';
        try {
            this.logger.debug(`📨 Processing message ${messageId}`);
            const validationResult = this.validateMessage(message);
            if (!validationResult.isValid) {
                this.logger.error(`Invalid message ${messageId}:`, validationResult.errors);
                await this.sendToDeadLetterQueue(message, new Error(`Invalid message: ${validationResult.errors.join(', ')}`));
                return;
            }
            await this.handleUserRegisteredEvent.execute(message);
            const processingTime = Date.now() - startTime;
            this.metrics.messagesProcessed++;
            this.metrics.lastMessageTime = new Date();
            this.logger.log(`✅ Processed message ${messageId} in ${processingTime}ms`);
        }
        catch (error) {
            this.metrics.errors++;
            this.logger.error(`❌ Failed to process message ${messageId}:`, error);
            await this.retryMessageProcessing(message, error, 0);
        }
    }
    validateMessage(message) {
        var _a, _b, _c;
        const errors = [];
        if (!(message === null || message === void 0 ? void 0 : message.eventId)) {
            errors.push('Missing eventId');
        }
        if (!((_a = message === null || message === void 0 ? void 0 : message.data) === null || _a === void 0 ? void 0 : _a.userId)) {
            errors.push('Missing userId in data');
        }
        if (!((_b = message === null || message === void 0 ? void 0 : message.data) === null || _b === void 0 ? void 0 : _b.email)) {
            errors.push('Missing email in data');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (((_c = message === null || message === void 0 ? void 0 : message.data) === null || _c === void 0 ? void 0 : _c.userId) && !uuidRegex.test(message.data.userId)) {
            errors.push('Invalid userId format (must be UUID)');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    async retryMessageProcessing(message, error, attempt, maxAttempts = 3) {
        const messageId = message.eventId || 'unknown';
        if (attempt >= maxAttempts) {
            this.logger.error(`❌ Max retries exceeded for message ${messageId}. Sending to DLQ.`);
            await this.sendToDeadLetterQueue(message, error);
            return;
        }
        const delay = Math.min(30000, 1000 * Math.pow(2, attempt));
        this.logger.warn(`⚠️ Retry attempt ${attempt + 1}/${maxAttempts} for message ${messageId} in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        try {
            await this.handleUserRegisteredEvent.execute(message);
            this.logger.log(`✅ Successfully processed message ${messageId} on retry ${attempt + 1}`);
        }
        catch (retryError) {
            await this.retryMessageProcessing(message, retryError, attempt + 1, maxAttempts);
        }
    }
    async sendToDeadLetterQueue(message, error) {
        try {
            const dlqMessage = {
                originalMessage: message,
                error: error.message,
                errorStack: error.stack,
                timestamp: new Date().toISOString(),
                service: 'user-service',
            };
            await this.kafkaProducer.publishEvent('user-service.dlq.v1', {
                eventId: `${message.eventId || 'unknown'}-dlq`,
                eventType: 'DeadLetterQueue',
                eventVersion: '1.0.0',
                timestamp: new Date().toISOString(),
                payload: dlqMessage,
                metadata: {
                    sourceService: 'user-service',
                    originalTopic: 'auth-service.user-registered.v1',
                },
            }, {
                key: message.eventId || 'unknown',
            });
            this.logger.log(`📭 Message sent to DLQ: ${message.eventId || 'unknown'}`);
        }
        catch (dlqError) {
            this.logger.error(`❌ Failed to send message to DLQ:`, dlqError);
            this.logger.error(`💀 CRITICAL: Lost message ${message.eventId}:`, {
                message,
                originalError: error.message,
                dlqError: dlqError.message,
            });
        }
    }
    startHealthChecks() {
        this.healthCheckTimer = setInterval(async () => {
            try {
                await this.performHealthCheck();
            }
            catch (error) {
                this.logger.error('Health check failed:', error);
            }
        }, this.healthCheckInterval);
    }
    async performHealthCheck() {
        try {
            const isAlive = this.isInitialized && await this.checkConnection();
            if (!isAlive) {
                this.isHealthy = false;
                this.logger.warn('⚠️ Kafka health check failed. Attempting to reconnect...');
                await this.attemptReconnect();
            }
            else {
                this.isHealthy = true;
                this.logger.debug('✅ Kafka health check passed');
            }
        }
        catch (error) {
            this.logger.error('Health check error:', error);
            this.isHealthy = false;
        }
    }
    async checkConnection() {
        try {
            const consumerStatus = this.kafkaConsumer.getStatus();
            return consumerStatus.isConnected && consumerStatus.isRunning;
        }
        catch (error) {
            return false;
        }
    }
    async attemptReconnect() {
        if (this.metrics.reconnectAttempts >= 5) {
            this.logger.error('❌ Max reconnect attempts reached. Giving up.');
            return;
        }
        this.metrics.reconnectAttempts++;
        this.logger.log(`Attempting Kafka reconnection (attempt ${this.metrics.reconnectAttempts}/5)...`);
        try {
            await this.safeShutdown();
            await this.initializeKafka();
            this.logger.log('✅ Kafka reconnected successfully');
        }
        catch (error) {
            this.logger.error('❌ Kafka reconnection failed:', error);
            const delay = Math.min(30000, 5000 * Math.pow(2, this.metrics.reconnectAttempts));
            setTimeout(() => this.attemptReconnect(), delay);
        }
    }
    async safeShutdown() {
        try {
            if (this.healthCheckTimer) {
                clearInterval(this.healthCheckTimer);
                this.healthCheckTimer = null;
            }
            await this.kafkaConsumer.stop();
            await this.kafkaConsumer.disconnect();
            await this.kafkaProducer.disconnect();
        }
        catch (error) {
            this.logger.warn('Error during safe shutdown:', error);
        }
    }
    async onModuleDestroy() {
        await this.safeShutdown();
        this.logger.log('✅ Kafka infrastructure shut down');
    }
    async initializeConsumer() {
        return this.onModuleInit();
    }
    async disconnect() {
        return this.onModuleDestroy();
    }
    async getHealthStatus() {
        var _a;
        const uptime = this.isInitialized ? Date.now() - this.startTime : 0;
        return {
            status: this.isHealthy ? 'HEALTHY' : (this.isInitialized ? 'DEGRADED' : 'UNHEALTHY'),
            details: {
                initialized: this.isInitialized,
                healthy: this.isHealthy,
                uptime,
                messagesProcessed: this.metrics.messagesProcessed,
                errors: this.metrics.errors,
                reconnectAttempts: this.metrics.reconnectAttempts,
                lastMessageTime: ((_a = this.metrics.lastMessageTime) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                consumerLag: this.metrics.consumerLag,
            },
            message: this.isHealthy
                ? 'Kafka infrastructure is fully operational'
                : this.isInitialized
                    ? 'Kafka is running in degraded mode'
                    : 'Kafka is not initialized'
        };
    }
    getMetrics() {
        return Object.assign(Object.assign({}, this.metrics), { uptime: this.isInitialized ? Date.now() - this.startTime : 0, initialized: this.isInitialized, healthy: this.isHealthy });
    }
};
exports.KafkaBootstrapService = KafkaBootstrapService;
exports.KafkaBootstrapService = KafkaBootstrapService = KafkaBootstrapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [contracts_1.KafkaConsumerService,
        contracts_1.KafkaProducerService,
        handle_user_registered_event_1.HandleUserRegisteredEventUseCase])
], KafkaBootstrapService);
//# sourceMappingURL=kafka-bootstrap.js.map