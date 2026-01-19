"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_typeorm_1 = require("../config/database-typeorm"); // Нужно создать
const User_1 = require("../entities/User");
class UserRepository {
    constructor() {
        this.repository = database_typeorm_1.AppDataSource.getRepository(User_1.UserEntity);
    }
    async create(userData) {
        const user = this.repository.create({
            email: userData.email,
            passwordHash: userData.password, // @BeforeInsert автоматически хеширует
            isEmailVerified: false,
            isActive: true,
            isTwoFactorEnabled: false
        });
        return await this.repository.save(user);
    }
    async createWithPassword(userData) {
        const user = new User_1.UserEntity();
        user.email = userData.email;
        await user.setPassword(userData.password); // Используем метод setPassword
        user.isEmailVerified = false;
        user.isActive = true;
        user.isTwoFactorEnabled = false;
        return await this.repository.save(user);
    }
    async findByEmail(email) {
        return await this.repository.findOne({
            where: { email }
        });
    }
    async findById(id) {
        return await this.repository.findOne({
            where: { id }
        });
    }
    async update(id, updateData) {
        await this.repository.update(id, {
            ...updateData,
            updatedAt: new Date()
        });
        return this.findById(id);
    }
    async updatePassword(id, newPasswordHash) {
        await this.repository.update(id, {
            passwordHash: newPasswordHash,
            updatedAt: new Date()
        });
    }
    async updateTwoFactorSecret(userId, secret) {
        await this.repository.update(userId, {
            twoFactorSecret: secret,
            isTwoFactorEnabled: true,
            updatedAt: new Date()
        });
    }
    async disableTwoFactor(userId) {
        await this.repository.update(userId, {
            twoFactorSecret: () => 'NULL',
            isTwoFactorEnabled: false,
            updatedAt: new Date()
        });
    }
    async markEmailAsVerified(userId) {
        await this.repository.update(userId, {
            isEmailVerified: true,
            updatedAt: new Date()
        });
    }
    async setResetPasswordToken(userId, token, expiresAt) {
        await this.repository.update(userId, {
            resetPasswordToken: token,
            resetPasswordExpires: expiresAt,
            updatedAt: new Date()
        });
    }
    async clearResetPasswordToken(userId) {
        await this.repository.update(userId, {
            resetPasswordToken: () => 'NULL',
            resetPasswordExpires: () => 'NULL',
            updatedAt: new Date()
        });
    }
    async deactivateUser(userId) {
        await this.repository.update(userId, {
            isActive: false,
            updatedAt: new Date()
        });
    }
}
exports.UserRepository = UserRepository;
// Экспортируем синглтон
exports.default = new UserRepository();
//# sourceMappingURL=user.repository.js.map