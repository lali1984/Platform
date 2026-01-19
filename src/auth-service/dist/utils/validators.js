"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validators = void 0;
// src/utils/validators.ts
const validator_1 = __importDefault(require("validator"));
class Validators {
    static isValidEmail(email) {
        return validator_1.default.isEmail(email) && email.length <= 255;
    }
    static isValidPassword(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    // Добавляем недостающий метод
    static sanitizeEmail(email) {
        return validator_1.default.normalizeEmail(email, {
            gmail_remove_dots: false,
            gmail_remove_subaddress: false,
            outlookdotcom_remove_subaddress: false,
            yahoo_remove_subaddress: false,
            icloud_remove_subaddress: false
        }) || email.toLowerCase().trim();
    }
    static sanitizeInput(input) {
        return validator_1.default.escape(input.trim());
    }
}
exports.Validators = Validators;
//# sourceMappingURL=validators.js.map