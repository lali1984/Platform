"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxEventPublisher = void 0;
const OutboxEvent_entity_1 = require("../../infrastructure/persistence/entities/OutboxEvent.entity");
const crypto_1 = __importDefault(require("crypto"));
class OutboxEventPublisher {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.outboxRepository = dataSource.getRepository(OutboxEvent_entity_1.OutboxEvent);
    }
    async publish(event) {
        try {
            await this.outboxRepository.save({
                id: crypto_1.default.randomUUID(),
                type: event.eventType,
                version: event.eventVersion,
                aggregateId: event.aggregateId || null,
                payload: event.payload,
                metadata: event.metadata,
                status: 'pending',
                attempts: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            return true;
        }
        catch (error) {
            console.error('Failed to save event to outbox:', error);
            return false;
        }
    }
    async publishSync(event) {
        const result = await this.publish(event);
        if (!result) {
            throw new Error('Failed to publish event synchronously');
        }
    }
    isAvailable() {
        return true;
    }
    shutdown() {
        return Promise.resolve();
    }
}
exports.OutboxEventPublisher = OutboxEventPublisher;
//# sourceMappingURL=OutboxEventPublisher.js.map