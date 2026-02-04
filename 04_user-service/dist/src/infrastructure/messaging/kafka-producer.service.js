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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaProducerService = void 0;
const common_1 = require("@nestjs/common");
const kafkajs_1 = require("kafkajs");
let KafkaProducerService = class KafkaProducerService {
    constructor() {
        this.isConnected = false;
        const kafka = new kafkajs_1.Kafka({
            clientId: 'user-service',
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
        });
        this.producer = kafka.producer();
    }
    async onModuleInit() {
        await this.connect();
    }
    async onModuleDestroy() {
        await this.shutdown();
    }
    async connect() {
        if (this.isConnected)
            return;
        try {
            await this.producer.connect();
            this.isConnected = true;
            console.log('✅ Kafka producer connected');
        }
        catch (error) {
            console.error('❌ Failed to connect Kafka producer:', error);
            throw error;
        }
    }
    async shutdown() {
        if (!this.isConnected)
            return;
        try {
            await this.producer.disconnect();
            this.isConnected = false;
            console.log('✅ Kafka producer disconnected');
        }
        catch (error) {
            console.error('❌ Error disconnecting Kafka producer:', error);
            throw error;
        }
    }
};
exports.KafkaProducerService = KafkaProducerService;
exports.KafkaProducerService = KafkaProducerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], KafkaProducerService);
//# sourceMappingURL=kafka-producer.service.js.map