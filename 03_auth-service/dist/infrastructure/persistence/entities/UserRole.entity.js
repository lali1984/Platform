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
exports.UserRoleEntity = void 0;
// ./03_auth-service/src/infrastructure/persistence/entities/UserRole.entity.ts
const typeorm_1 = require("typeorm");
let UserRoleEntity = class UserRoleEntity {
};
exports.UserRoleEntity = UserRoleEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserRoleEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], UserRoleEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'role_id', type: 'uuid' }),
    __metadata("design:type", String)
], UserRoleEntity.prototype, "roleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], UserRoleEntity.prototype, "assignedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'assigned_at' }),
    __metadata("design:type", Date)
], UserRoleEntity.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', nullable: true }),
    __metadata("design:type", Date)
], UserRoleEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], UserRoleEntity.prototype, "isActive", void 0);
exports.UserRoleEntity = UserRoleEntity = __decorate([
    (0, typeorm_1.Entity)('user_roles')
], UserRoleEntity);
//# sourceMappingURL=UserRole.entity.js.map