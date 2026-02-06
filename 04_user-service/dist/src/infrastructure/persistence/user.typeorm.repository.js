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
var UserTypormRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTypormRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_profile_entity_1 = require("./user-profile.entity");
const user_1 = require("../../application/mappers/user");
let UserTypormRepository = UserTypormRepository_1 = class UserTypormRepository {
    constructor(repository) {
        this.repository = repository;
        this.logger = new common_1.Logger(UserTypormRepository_1.name);
    }
    async findById(id) {
        try {
            const entity = await this.repository.findOne({
                where: { id },
            });
            return entity ? user_1.UserMapper.toDomain(entity) : null;
        }
        catch (error) {
            this.logger.error(`Failed to find user by ID ${id}:`, error);
            throw error;
        }
    }
    async findByEmail(email) {
        try {
            const entity = await this.repository.findOne({
                where: { email },
            });
            return entity ? user_1.UserMapper.toDomain(entity) : null;
        }
        catch (error) {
            this.logger.error(`Failed to find user by email ${email}:`, error);
            throw error;
        }
    }
    async findByPhone(phone) {
        try {
            const entity = await this.repository.findOne({
                where: { phone },
            });
            return entity ? user_1.UserMapper.toDomain(entity) : null;
        }
        catch (error) {
            this.logger.error(`Failed to find user by phone ${phone}:`, error);
            throw error;
        }
    }
    async findByAuthUserId(authUserId) {
        try {
            const entity = await this.repository.findOne({
                where: { userId: authUserId },
            });
            if (!entity) {
                this.logger.debug(`No user found for authUserId: ${authUserId}`);
                return null;
            }
            if (entity.userId !== authUserId) {
                this.logger.warn(`Data integrity issue: entity.userId (${entity.userId}) != authUserId (${authUserId})`);
            }
            return user_1.UserMapper.toDomain(entity);
        }
        catch (error) {
            this.logger.error(`Failed to find user by authUserId ${authUserId}:`, error);
            throw error;
        }
    }
    async save(user) {
        try {
            const entity = user_1.UserMapper.toEntity(user);
            if (!entity.userId) {
                throw new Error('Cannot save user without userId');
            }
            await this.repository.save(entity);
            this.logger.debug(`User saved: ${user.id} (auth: ${entity.userId})`);
        }
        catch (error) {
            this.logger.error(`Failed to save user ${user.id}:`, error);
            throw error;
        }
    }
    async update(user) {
        try {
            const existingEntity = await this.repository.findOne({
                where: { id: user.id },
            });
            if (!existingEntity) {
                throw new Error(`User not found for update: ${user.id}`);
            }
            user_1.UserMapper.updateEntityFromDomain(existingEntity, user);
            await this.repository.save(existingEntity);
            this.logger.debug(`User updated: ${user.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to update user ${user.id}:`, error);
            throw error;
        }
    }
    async delete(id) {
        try {
            await this.repository.softDelete(id);
            this.logger.debug(`User soft deleted: ${id}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete user ${id}:`, error);
            throw error;
        }
    }
    async findAll(limit = 50, offset = 0) {
        try {
            const entities = await this.repository.find({
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
                where: { deletedAt: (0, typeorm_2.IsNull)() },
            });
            return entities.map(entity => user_1.UserMapper.toDomain(entity));
        }
        catch (error) {
            this.logger.error('Failed to find all users:', error);
            throw error;
        }
    }
    async findWithFilters(filters, limit = 50, offset = 0) {
        try {
            const where = { deletedAt: (0, typeorm_2.IsNull)() };
            if (filters.status)
                where.status = filters.status;
            if (filters.isVerified !== undefined)
                where.isVerified = filters.isVerified;
            if (filters.country)
                where.country = filters.country;
            if (filters.city)
                where.city = filters.city;
            if (filters.company)
                where.company = (0, typeorm_2.Like)(`%${filters.company}%`);
            if (filters.createdAtFrom || filters.createdAtTo) {
                where.createdAt = (0, typeorm_2.Between)(filters.createdAtFrom || new Date(0), filters.createdAtTo || new Date());
            }
            if (filters.lastActiveFrom || filters.lastActiveTo) {
                where.lastActiveAt = (0, typeorm_2.Between)(filters.lastActiveFrom || new Date(0), filters.lastActiveTo || new Date());
            }
            const entities = await this.repository.find({
                where,
                skip: offset,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            return entities.map(entity => user_1.UserMapper.toDomain(entity));
        }
        catch (error) {
            this.logger.error('Failed to find users with filters:', { filters, error });
            throw error;
        }
    }
    async exists(email) {
        try {
            const count = await this.repository.count({
                where: { email, deletedAt: (0, typeorm_2.IsNull)() },
            });
            return count > 0;
        }
        catch (error) {
            this.logger.error(`Failed to check if user exists by email ${email}:`, error);
            throw error;
        }
    }
    async existsByAuthUserId(authUserId) {
        try {
            const count = await this.repository.count({
                where: { userId: authUserId, deletedAt: (0, typeorm_2.IsNull)() },
            });
            return count > 0;
        }
        catch (error) {
            this.logger.error(`Failed to check if user exists by authUserId ${authUserId}:`, error);
            throw error;
        }
    }
    async count() {
        try {
            return await this.repository.count({
                where: { deletedAt: (0, typeorm_2.IsNull)() },
            });
        }
        catch (error) {
            this.logger.error('Failed to count users:', error);
            throw error;
        }
    }
    async countByStatus(status) {
        try {
            return await this.repository.count({
                where: { status, deletedAt: (0, typeorm_2.IsNull)() },
            });
        }
        catch (error) {
            this.logger.error(`Failed to count users by status ${status}:`, error);
            throw error;
        }
    }
    async search(query, limit = 50, offset = 0) {
        try {
            const entities = await this.repository
                .createQueryBuilder('user')
                .where('user.deletedAt IS NULL')
                .andWhere('(user.email ILIKE :query OR ' +
                'user.firstName ILIKE :query OR ' +
                'user.lastName ILIKE :query OR ' +
                'user.displayName ILIKE :query OR ' +
                'user.company ILIKE :query)', { query: `%${query}%` })
                .skip(offset)
                .take(limit)
                .orderBy('user.createdAt', 'DESC')
                .getMany();
            return entities.map(entity => user_1.UserMapper.toDomain(entity));
        }
        catch (error) {
            this.logger.error(`Failed to search users with query "${query}":`, error);
            throw error;
        }
    }
    async findDeletedUsers(limit = 50, offset = 0) {
        try {
            const entities = await this.repository.find({
                where: { deletedAt: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
                skip: offset,
                take: limit,
                order: { deletedAt: 'DESC' },
                withDeleted: true,
            });
            return entities.map(entity => user_1.UserMapper.toDomain(entity));
        }
        catch (error) {
            this.logger.error('Failed to find deleted users:', error);
            throw error;
        }
    }
    async restore(id) {
        try {
            await this.repository.restore(id);
            this.logger.debug(`User restored: ${id}`);
        }
        catch (error) {
            this.logger.error(`Failed to restore user ${id}:`, error);
            throw error;
        }
    }
    async permanentlyDelete(id) {
        try {
            await this.repository.delete(id);
            this.logger.debug(`User permanently deleted: ${id}`);
        }
        catch (error) {
            this.logger.error(`Failed to permanently delete user ${id}:`, error);
            throw error;
        }
    }
    async checkDataIntegrity() {
        try {
            const issues = [];
            const usersWithoutUserId = await this.repository.find({
                where: { userId: (0, typeorm_2.IsNull)() },
            });
            if (usersWithoutUserId.length > 0) {
                issues.push(`${usersWithoutUserId.length} users without userId`);
            }
            const duplicateUserIds = await this.repository
                .createQueryBuilder('user')
                .select('user.userId, COUNT(*) as count')
                .where('user.userId IS NOT NULL')
                .groupBy('user.userId')
                .having('COUNT(*) > 1')
                .getRawMany();
            if (duplicateUserIds.length > 0) {
                issues.push(`${duplicateUserIds.length} duplicate userIds found`);
            }
            const invalidEmails = await this.repository
                .createQueryBuilder('user')
                .where('user.email IS NOT NULL')
                .andWhere("user.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'")
                .getMany();
            if (invalidEmails.length > 0) {
                issues.push(`${invalidEmails.length} users with invalid email format`);
            }
            return {
                issues,
                count: issues.length,
            };
        }
        catch (error) {
            this.logger.error('Failed to check data integrity:', error);
            throw error;
        }
    }
    async getStatistics() {
        try {
            const total = await this.count();
            const active = await this.countByStatus('ACTIVE');
            const inactive = await this.countByStatus('INACTIVE');
            const verifiedCount = await this.repository.count({
                where: { isVerified: true, deletedAt: (0, typeorm_2.IsNull)() },
            });
            const countryStats = await this.repository
                .createQueryBuilder('user')
                .select('user.country, COUNT(*) as count')
                .where('user.country IS NOT NULL AND user.deletedAt IS NULL')
                .groupBy('user.country')
                .getRawMany();
            const byCountry = {};
            countryStats.forEach(stat => {
                byCountry[stat.country] = parseInt(stat.count);
            });
            const companyStats = await this.repository
                .createQueryBuilder('user')
                .select('user.company, COUNT(*) as count')
                .where('user.company IS NOT NULL AND user.deletedAt IS NULL')
                .groupBy('user.company')
                .orderBy('count', 'DESC')
                .limit(10)
                .getRawMany();
            const byCompany = {};
            companyStats.forEach(stat => {
                byCompany[stat.company] = parseInt(stat.count);
            });
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const createdLast30Days = await this.repository.count({
                where: {
                    createdAt: (0, typeorm_2.Between)(thirtyDaysAgo, new Date()),
                    deletedAt: (0, typeorm_2.IsNull)(),
                },
            });
            const avgCompletion = await this.repository
                .createQueryBuilder('user')
                .select('AVG(user.profileCompletionPercentage)', 'avg')
                .where('user.deletedAt IS NULL')
                .getRawOne();
            return {
                total,
                active,
                inactive,
                verified: verifiedCount,
                byCountry,
                byCompany,
                createdLast30Days,
                avgProfileCompletion: parseFloat((avgCompletion === null || avgCompletion === void 0 ? void 0 : avgCompletion.avg) || '0'),
            };
        }
        catch (error) {
            this.logger.error('Failed to get statistics:', error);
            throw error;
        }
    }
};
exports.UserTypormRepository = UserTypormRepository;
exports.UserTypormRepository = UserTypormRepository = UserTypormRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_profile_entity_1.UserProfileEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserTypormRepository);
//# sourceMappingURL=user.typeorm.repository.js.map