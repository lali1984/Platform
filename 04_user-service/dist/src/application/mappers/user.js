"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const user_profile_1 = require("../../domain/entities/user-profile");
const user_profile_2 = require("../../infrastructure/persistence/entities/user-profile");
class UserMapper {
    static toResponse(user) {
        var _a, _b, _c;
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: (_a = user.phone) !== null && _a !== void 0 ? _a : undefined,
            avatarUrl: (_b = user.avatarUrl) !== null && _b !== void 0 ? _b : undefined,
            status: user.status,
            isVerified: user.isVerified,
            metadata: (_c = user.metadata) !== null && _c !== void 0 ? _c : undefined,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
            deletedAt: user.deletedAt ? new Date(user.deletedAt) : undefined,
        };
    }
    static toResponseFromEntity(entity) {
        var _a, _b, _c, _d, _e, _f, _g;
        return {
            id: entity.id,
            email: (_a = entity.email) !== null && _a !== void 0 ? _a : undefined,
            firstName: (_b = entity.firstName) !== null && _b !== void 0 ? _b : undefined,
            lastName: (_c = entity.lastName) !== null && _c !== void 0 ? _c : undefined,
            phone: (_d = entity.phone) !== null && _d !== void 0 ? _d : undefined,
            avatarUrl: (_e = entity.avatarUrl) !== null && _e !== void 0 ? _e : undefined,
            status: entity.status,
            isVerified: entity.isVerified,
            metadata: (_f = entity.metadata) !== null && _f !== void 0 ? _f : undefined,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            deletedAt: (_g = entity.deletedAt) !== null && _g !== void 0 ? _g : undefined,
        };
    }
    static toEntity(user) {
        var _a, _b, _c, _d;
        const entity = new user_profile_2.UserProfileEntity();
        entity.id = user.id;
        entity.userId = user.getAuthUserId() || user.id;
        entity.email = user.email;
        entity.firstName = (_a = user.firstName) !== null && _a !== void 0 ? _a : null;
        entity.lastName = (_b = user.lastName) !== null && _b !== void 0 ? _b : null;
        if (!user.firstName && !user.lastName) {
            entity.displayName = null;
        }
        else {
            entity.displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || null;
        }
        entity.phone = (_c = user.phone) !== null && _c !== void 0 ? _c : null;
        entity.avatarUrl = (_d = user.avatarUrl) !== null && _d !== void 0 ? _d : null;
        entity.status = user.status;
        entity.isVerified = user.isVerified;
        entity.createdAt = new Date(user.createdAt);
        entity.updatedAt = new Date(user.updatedAt);
        entity.deletedAt = user.deletedAt ? new Date(user.deletedAt) : null;
        entity.metadata = user.metadata || {};
        entity.profileCompletionPercentage = this.calculateProfileCompletion(user);
        return entity;
    }
    static toDomain(entity) {
        var _a, _b, _c, _d;
        const isFromAuthService = ((_a = entity.metadata) === null || _a === void 0 ? void 0 : _a.source) === 'auth-service' ||
            ((_b = entity.metadata) === null || _b === void 0 ? void 0 : _b.source) === 'auth-service-registration';
        if (isFromAuthService && ((_c = entity.metadata) === null || _c === void 0 ? void 0 : _c.authUserId)) {
            return user_profile_1.User.createFromAuthEvent({
                authUserId: entity.metadata.authUserId,
                email: entity.email || '',
                firstName: entity.firstName || '',
                lastName: entity.lastName || '',
                phone: entity.phone || undefined,
                avatarUrl: entity.avatarUrl || undefined,
                isVerified: entity.isVerified,
                metadata: entity.metadata,
            });
        }
        else {
            return user_profile_1.User.create({
                id: entity.id,
                email: entity.email || '',
                firstName: entity.firstName || '',
                lastName: entity.lastName || '',
                phone: entity.phone || undefined,
                avatarUrl: entity.avatarUrl || undefined,
                authUserId: (_d = entity.metadata) === null || _d === void 0 ? void 0 : _d.authUserId,
                isActive: entity.status !== 'INACTIVE',
                isVerified: entity.isVerified,
            });
        }
    }
    static calculateProfileCompletion(user) {
        let completion = 0;
        if (user.email)
            completion += 10;
        if (user.firstName)
            completion += 15;
        if (user.lastName)
            completion += 15;
        if (user.avatarUrl)
            completion += 10;
        if (user.phone)
            completion += 10;
        return Math.min(completion, 100);
    }
    static updateEntityFromDomain(entity, user) {
        var _a, _b, _c, _d;
        entity.firstName = (_a = user.firstName) !== null && _a !== void 0 ? _a : null;
        entity.lastName = (_b = user.lastName) !== null && _b !== void 0 ? _b : null;
        entity.phone = (_c = user.phone) !== null && _c !== void 0 ? _c : null;
        entity.avatarUrl = (_d = user.avatarUrl) !== null && _d !== void 0 ? _d : null;
        entity.status = user.status;
        entity.isVerified = user.isVerified;
        entity.updatedAt = new Date();
        if (user.firstName || user.lastName) {
            entity.displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || null;
        }
        if (user.metadata) {
            entity.metadata = Object.assign(Object.assign({}, entity.metadata), user.metadata);
        }
        entity.profileCompletionPercentage = this.calculateProfileCompletion(user);
    }
    static validateIntegrity(entity, user) {
        const errors = [];
        if (entity.id !== user.id) {
            errors.push(`ID mismatch: entity=${entity.id}, domain=${user.id}`);
        }
        if (entity.email !== user.email) {
            errors.push(`Email mismatch: entity=${entity.email}, domain=${user.email}`);
        }
        if (entity.status !== user.status) {
            errors.push(`Status mismatch: entity=${entity.status}, domain=${user.status}`);
        }
        if (entity.isVerified !== user.isVerified) {
            errors.push(`isVerified mismatch: entity=${entity.isVerified}, domain=${user.isVerified}`);
        }
        return errors;
    }
}
exports.UserMapper = UserMapper;
//# sourceMappingURL=user.js.map