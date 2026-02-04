"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const contracts_1 = require("@platform/contracts");
const contracts_2 = require("@platform/contracts");
const contracts_3 = require("@platform/contracts");
class User {
    constructor(props) {
        this.domainEvents = [];
        this.props = props;
    }
    static async create(data) {
        const passwordHash = await User.hashPassword(data.password);
        const emailObj = (0, contracts_2.createEmail)(data.email.toLowerCase().trim());
        if (!emailObj) {
            throw new Error('Invalid email format');
        }
        const user = new User({
            id: (0, contracts_1.unsafeCreateUserId)(crypto_1.default.randomUUID()),
            email: emailObj,
            passwordHash,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            isActive: true,
            isEmailVerified: false,
            isTwoFactorEnabled: false,
            createdAt: (0, contracts_3.toISO8601Date)(new Date()),
            updatedAt: (0, contracts_3.toISO8601Date)(new Date()),
        });
        user.addDomainEvent('UserRegistered', {
            userId: user.id,
            email: user.email,
            username: user.username,
        });
        return user;
    }
    static fromPersistence(props) {
        const emailObj = (0, contracts_2.createEmail)(props.email);
        if (!emailObj) {
            throw new Error(`Invalid email in persistence: ${props.email}`);
        }
        return new User({
            ...props,
            id: (0, contracts_1.unsafeCreateUserId)(props.id),
            email: emailObj,
            createdAt: (0, contracts_3.toISO8601Date)(new Date(props.createdAt)),
            updatedAt: (0, contracts_3.toISO8601Date)(new Date(props.updatedAt)),
            lastLoginAt: props.lastLoginAt ? (0, contracts_3.toISO8601Date)(new Date(props.lastLoginAt)) : undefined,
        });
    }
    static async hashPassword(password) {
        const salt = await bcryptjs_1.default.genSalt(12); // 🔴 Увеличено до 12 для продакшена
        return bcryptjs_1.default.hash(password, salt);
    }
    async validatePassword(password) {
        return bcryptjs_1.default.compare(password, this.props.passwordHash);
    }
    login() {
        const now = (0, contracts_3.toISO8601Date)(new Date());
        this.props.lastLoginAt = now;
        this.props.updatedAt = now;
        this.addDomainEvent('UserLoggedIn', {
            userId: this.id,
            timestamp: now,
        });
    }
    enableTwoFactor(secret) {
        this.props.isTwoFactorEnabled = true;
        this.props.twoFactorSecret = secret;
        this.props.updatedAt = (0, contracts_3.toISO8601Date)(new Date());
        this.addDomainEvent('TwoFactorEnabled', {
            userId: this.id,
            timestamp: (0, contracts_3.toISO8601Date)(new Date()),
        });
    }
    disableTwoFactor() {
        this.props.isTwoFactorEnabled = false;
        this.props.twoFactorSecret = undefined;
        this.props.updatedAt = (0, contracts_3.toISO8601Date)(new Date());
    }
    verifyEmail() {
        this.props.isEmailVerified = true;
        this.props.updatedAt = (0, contracts_3.toISO8601Date)(new Date());
    }
    deactivate() {
        this.props.isActive = false;
        this.props.updatedAt = (0, contracts_3.toISO8601Date)(new Date());
    }
    activate() {
        this.props.isActive = true;
        this.props.updatedAt = (0, contracts_3.toISO8601Date)(new Date());
    }
    addDomainEvent(type, data) {
        this.domainEvents.push({ type, data });
    }
    getDomainEvents() {
        return [...this.domainEvents];
    }
    clearDomainEvents() {
        this.domainEvents = [];
    }
    // Getters
    get id() {
        return this.props.id;
    }
    get email() {
        return this.props.email;
    }
    get username() {
        return this.props.username;
    }
    get firstName() {
        return this.props.firstName;
    }
    get lastName() {
        return this.props.lastName;
    }
    get isActive() {
        return this.props.isActive;
    }
    get isEmailVerified() {
        return this.props.isEmailVerified;
    }
    get isTwoFactorEnabled() {
        return this.props.isTwoFactorEnabled;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }
    get lastLoginAt() {
        return this.props.lastLoginAt;
    }
    // Для persistence
    get passwordHash() {
        return this.props.passwordHash;
    }
    get twoFactorSecret() {
        return this.props.twoFactorSecret;
    }
    toJSON() {
        return {
            id: this.id,
            email: this.email,
            username: this.username,
            firstName: this.firstName,
            lastName: this.lastName,
            isActive: this.isActive,
            isEmailVerified: this.isEmailVerified,
            isTwoFactorEnabled: this.isTwoFactorEnabled,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            lastLoginAt: this.lastLoginAt,
        };
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map