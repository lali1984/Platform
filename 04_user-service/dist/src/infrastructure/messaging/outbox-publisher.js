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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OutboxEventPublisher_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxEventPublisher = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const outbox_event_1 = require("../persistence/entities/outbox-event");
const common_2 = require("@nestjs/common");
let OutboxEventPublisher = OutboxEventPublisher_1 = class OutboxEventPublisher {
    constructor(outboxRepository) {
        this.outboxRepository = outboxRepository;
        this.logger = new common_2.Logger(OutboxEventPublisher_1.name);
    }
    async publish(event) {
        await this._saveEvent(event, this.outboxRepository);
    }
    async publishAll(events) {
        await this._saveEvents(events, this.outboxRepository);
    }
    async publishInTransaction(event, queryRunner) {
        const repository = this._getRepository(queryRunner);
        await this._saveEvent(event, repository);
    }
    async publishAllInTransaction(events, queryRunner) {
        const repository = this._getRepository(queryRunner);
        await this._saveEvents(events, repository);
    }
    _getRepository(queryRunner) {
        if (!queryRunner) {
            return this.outboxRepository;
        }
        return 'getRepository' in queryRunner
            ? queryRunner.getRepository(outbox_event_1.OutboxEventEntity)
            : queryRunner.manager.getRepository(outbox_event_1.OutboxEventEntity);
    }
    async _saveEvent(event, repository) {
        try {
            if (!event.type || !event.data) {
                throw new Error('PlatformEvent must have "type" and "data" fields');
            }
            const outboxEvent = repository.create({
                type: event.type,
                payload: event.data,
                metadata: Object.assign({ eventId: event.eventId, version: event.version, timestamp: event.timestamp instanceof Date
                        ? event.timestamp.toISOString()
                        : event.timestamp, correlationId: event.correlationId, source: event.source }, event.metadata),
                status: 'pending',
                attempts: 0,
                createdAt: new Date(),
            });
            await repository.save(outboxEvent);
            this.logger.debug(`📝 Event saved to outbox: ${event.type} (ID: ${outboxEvent.id}, Event ID: ${event.eventId})`);
        }
        catch (error) {
            this.logger.error(`❌ Failed to save event to outbox: ${event.type}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
    async _saveEvents(events, repository) {
        try {
            for (const event of events) {
                if (!event.type || !event.data) {
                    throw new Error(`PlatformEvent must have "type" and "data" fields. Event ID: ${event.eventId}`);
                }
            }
            const outboxEvents = events.map(event => repository.create({
                type: event.type,
                payload: event.data,
                metadata: Object.assign({ eventId: event.eventId, version: event.version, timestamp: event.timestamp instanceof Date
                        ? event.timestamp.toISOString()
                        : event.timestamp, correlationId: event.correlationId, source: event.source }, event.metadata),
                status: 'pending',
                attempts: 0,
                createdAt: new Date(),
            }));
            await repository.save(outboxEvents);
            this.logger.debug(`📝 ${outboxEvents.length} events saved to outbox`);
        }
        catch (error) {
            this.logger.error(`❌ Failed to save events to outbox`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
    isAvailable() {
        return true;
    }
    async shutdown() {
        this.logger.log('✅ OutboxEventPublisher shutdown complete');
    }
};
exports.OutboxEventPublisher = OutboxEventPublisher;
exports.OutboxEventPublisher = OutboxEventPublisher = OutboxEventPublisher_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(outbox_event_1.OutboxEventEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OutboxEventPublisher);
//# sourceMappingURL=outbox-publisher.js.map