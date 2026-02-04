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
const kafka_consumer_service_1 = require("./kafka-consumer.service");
const handle_user_registered_event_use_case_1 = require("../../application/use-cases/handle-user-registered-event.use-case");
let KafkaBootstrapService = KafkaBootstrapService_1 = class KafkaBootstrapService {
    constructor(kafkaConsumer, handleUserRegisteredEvent) {
        this.kafkaConsumer = kafkaConsumer;
        this.handleUserRegisteredEvent = handleUserRegisteredEvent;
        this.logger = new common_1.Logger(KafkaBootstrapService_1.name);
    }
    async onModuleInit() {
        try {
            this.logger.log('Initializing Kafka subscriptions...');
            await this.kafkaConsumer.subscribe('auth-service.user-registered.v1', async (message) => {
                this.logger.log(`📨 Received user-registered event: ${JSON.stringify(message)}`);
                await this.handleUserRegisteredEvent.execute(message);
            });
            this.logger.log('✅ Subscribed to auth-service.user-registered.v1 topic');
            await this.kafkaConsumer.subscribe('auth-service.user-logged-in.v1', async (message) => {
                this.logger.log(`📨 Received user-logged-in event: ${message.userId || 'unknown'}`);
            });
            this.logger.log('✅ Subscribed to auth-service.user-logged-in.v1 topic');
            this.logger.log('✅ All Kafka subscriptions initialized');
        }
        catch (error) {
            this.logger.error(`❌ Failed to initialize Kafka subscriptions: ${error}`);
            throw error;
        }
    }
};
exports.KafkaBootstrapService = KafkaBootstrapService;
exports.KafkaBootstrapService = KafkaBootstrapService = KafkaBootstrapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kafka_consumer_service_1.KafkaConsumerService,
        handle_user_registered_event_use_case_1.HandleUserRegisteredEventUseCase])
], KafkaBootstrapService);
//# sourceMappingURL=kafka-bootstrap.service.js.map