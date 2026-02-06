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
exports.UserProfileEntity = void 0;
const typeorm_1 = require("typeorm");
let UserProfileEntity = class UserProfileEntity {
};
exports.UserProfileEntity = UserProfileEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserProfileEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { name: 'user_id', unique: true }),
    __metadata("design:type", String)
], UserProfileEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "displayName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        default: 'ACTIVE',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserProfileEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, name: 'is_verified' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], UserProfileEntity.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'char', length: 2, nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "timezone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: 'en-US' }),
    __metadata("design:type", String)
], UserProfileEntity.prototype, "locale", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "jobTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '{}' }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "socialLinks", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0, name: 'profile_completion_percentage' }),
    __metadata("design:type", Number)
], UserProfileEntity.prototype, "profileCompletionPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true, name: 'last_active_at' }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "lastActiveAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0, name: 'profile_views' }),
    __metadata("design:type", Number)
], UserProfileEntity.prototype, "profileViews", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UserProfileEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], UserProfileEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { name: 'created_by', nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { name: 'updated_by', nullable: true }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '{}', name: 'metadata' }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, name: 'display_name' }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "displayNameForIndex", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'char', length: 2, nullable: true, name: 'country' }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "countryForIndex", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, name: 'city' }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "cityForIndex", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true, name: 'last_active_at' }),
    __metadata("design:type", Object)
], UserProfileEntity.prototype, "lastActiveAtForIndex", void 0);
exports.UserProfileEntity = UserProfileEntity = __decorate([
    (0, typeorm_1.Entity)('user_profiles')
], UserProfileEntity);
//# sourceMappingURL=user-profile.js.map