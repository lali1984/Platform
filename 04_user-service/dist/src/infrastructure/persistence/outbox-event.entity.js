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
exports.OutboxEventEntity = void 0;
const typeorm_1 = require("typeorm");
let OutboxEventEntity = class OutboxEventEntity {
};
exports.OutboxEventEntity = OutboxEventEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OutboxEventEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], OutboxEventEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], OutboxEventEntity.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], OutboxEventEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pending' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], OutboxEventEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], OutboxEventEntity.prototype, "attempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], OutboxEventEntity.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'error_message' }),
    __metadata("design:type", String)
], OutboxEventEntity.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'processed_at' }),
    __metadata("design:type", Date)
], OutboxEventEntity.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'last_attempt_at' }),
    __metadata("design:type", Date)
], OutboxEventEntity.prototype, "lastAttemptAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], OutboxEventEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], OutboxEventEntity.prototype, "updatedAt", void 0);
exports.OutboxEventEntity = OutboxEventEntity = __decorate([
    (0, typeorm_1.Entity)('outbox_events')
], OutboxEventEntity);
//# sourceMappingURL=outbox-event.entity.js.map