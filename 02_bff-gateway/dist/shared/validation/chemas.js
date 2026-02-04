"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchUsersSchema = exports.UpdateProfileSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
// 02_bff-gateway/src/shared/validation/schemas.ts
const zod_1 = require("zod");
// Схема для регистрации
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must be less than 100 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    username: zod_1.z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be less than 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores')
        .optional(),
    firstName: zod_1.z.string()
        .min(1, 'First name is required')
        .max(100, 'First name must be less than 100 characters')
        .optional(),
    lastName: zod_1.z.string()
        .min(1, 'Last name is required')
        .max(100, 'Last name must be less than 100 characters')
        .optional(),
});
// Схема для логина
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
// Схема для обновления профиля
exports.UpdateProfileSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be less than 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores')
        .optional(),
    firstName: zod_1.z.string()
        .min(1, 'First name is required')
        .max(100, 'First name must be less than 100 characters')
        .optional(),
    lastName: zod_1.z.string()
        .min(1, 'Last name is required')
        .max(100, 'Last name must be less than 100 characters')
        .optional(),
    avatarUrl: zod_1.z.string().url('Invalid URL format').optional(),
    bio: zod_1.z.string().max(500, 'Bio must be less than 500 characters').optional(),
});
// Схема для поиска пользователей
exports.SearchUsersSchema = zod_1.z.object({
    query: zod_1.z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
    limit: zod_1.z.number().min(1).max(100).default(10),
    page: zod_1.z.number().min(1).default(1),
});
