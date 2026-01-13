"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class UserRepository {
    constructor() {
        this.tableName = 'users';
    }
    async create(userData) {
        const query = `
      INSERT INTO ${this.tableName} (email, password_hash)
      VALUES ($1, $2)
      RETURNING *
    `;
        const result = await database_1.default.query(query, [userData.email, userData.password]);
        return result.rows[0];
    }
    async findByEmail(email) {
        const query = `SELECT * FROM ${this.tableName} WHERE email = $1`;
        const result = await database_1.default.query(query, [email]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    async findById(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
        const result = await database_1.default.query(query, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    async updateTwoFactorSecret(userId, secret) {
        const query = `
      UPDATE ${this.tableName} 
      SET two_factor_secret = $1, two_factor_enabled = true, updated_at = NOW()
      WHERE id = $2
    `;
        await database_1.default.query(query, [secret, userId]);
    }
    async disableTwoFactor(userId) {
        const query = `
      UPDATE ${this.tableName} 
      SET two_factor_secret = NULL, two_factor_enabled = false, updated_at = NOW()
      WHERE id = $1
    `;
        await database_1.default.query(query, [userId]);
    }
}
exports.UserRepository = UserRepository;
exports.default = new UserRepository();
//# sourceMappingURL=user.repository.js.map