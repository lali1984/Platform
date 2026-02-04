"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryUserRepository = void 0;
// /Users/valery/Projects/platform-ecosystem/03_auth-service/src/infrastructure/persistence/repositories/InMemoryUserRepository.ts
const User_1 = require("../../../domain/entities/User");
class InMemoryUserRepository {
    constructor() {
        this.users = new Map();
    }
    async create(data) {
        // User.create возвращает Promise<User>
        const user = await User_1.User.create({
            email: data.email,
            password: data.password,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
        });
        this.users.set(user.id, user);
        return user;
    }
    async exists(criteria) {
        if (criteria.id) {
            return this.users.has(criteria.id);
        }
        if (criteria.email) {
            for (const user of this.users.values()) {
                if (user.email === criteria.email) {
                    return true;
                }
            }
        }
        if (criteria.username) {
            for (const user of this.users.values()) {
                if (user.username === criteria.username) {
                    return true;
                }
            }
        }
        return false;
    }
    async findOne(criteria) {
        if (criteria.id) {
            return this.users.get(criteria.id) || null;
        }
        if (criteria.email) {
            for (const user of this.users.values()) {
                if (user.email === criteria.email) {
                    return user;
                }
            }
        }
        if (criteria.username) {
            for (const user of this.users.values()) {
                if (user.username === criteria.username) {
                    return user;
                }
            }
        }
        return null;
    }
    async findById(id) {
        return this.users.get(id) || null;
    }
    async save(user) {
        this.users.set(user.id, user);
        return user;
    }
    async delete(id) {
        this.users.delete(id);
    }
    async findUserRole(_userId) {
        return 'user';
    }
    async findUserPermissions(_userId) {
        return ['read:profile', 'write:settings'];
    }
}
exports.InMemoryUserRepository = InMemoryUserRepository;
//# sourceMappingURL=InMemoryUserRepository.js.map