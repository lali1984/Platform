"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = exports.ErrorCodes = void 0;
/**
 * Группа стандартных кодов ошибок платформы.
 * Должна быть синхронизирована с contracts/api/src/base/api-response.ts.
 */
exports.ErrorCodes = {
    // Общие
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    // Аутентификация
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    // Пользователи
    USER_EXISTS: 'USER_EXISTS',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    USER_LOCKED: 'USER_LOCKED',
    // Валидация
    INVALID_EMAIL: 'INVALID_EMAIL',
    INVALID_PASSWORD: 'INVALID_PASSWORD',
    INVALID_PHONE: 'INVALID_PHONE',
    // Бизнес-логика
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    RESOURCE_LOCKED: 'RESOURCE_LOCKED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    CONFLICT: 'CONFLICT',
};
/**
 * Типизированный объект сообщений об ошибках.
 * Используется для локализации и централизованного управления текстами.
 */
exports.ErrorMessages = {
    VALIDATION_ERROR: 'Validation failed',
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    INTERNAL_ERROR: 'Internal server error',
    INVALID_CREDENTIALS: 'Invalid credentials',
    TOKEN_EXPIRED: 'Token expired',
    TOKEN_INVALID: 'Invalid token',
    USER_EXISTS: 'User already exists',
    USER_NOT_FOUND: 'User not found',
    USER_LOCKED: 'User account is locked',
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PASSWORD: 'Invalid password format',
    INVALID_PHONE: 'Invalid phone number',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    RESOURCE_LOCKED: 'Resource is locked',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    CONFLICT: 'Conflict occurred',
};
//# sourceMappingURL=index.js.map