"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = exports.ErrorCodes = void 0;
exports.createSuccessResponse = createSuccessResponse;
exports.createErrorResponse = createErrorResponse;
exports.isSuccessResponse = isSuccessResponse;
exports.isErrorResponse = isErrorResponse;
exports.createApiError = createApiError;
/**
 * Утилита для создания успешного ответа
 */
function createSuccessResponse(data, options = {}) {
    return {
        success: true,
        data,
        executionTime: options.executionTime,
        timestamp: new Date().toISOString(),
        metadata: options.metadata,
    };
}
/**
 * Утилита для создания ответа с ошибкой
 */
function createErrorResponse(error, options = {}) {
    return {
        success: false,
        error,
        executionTime: options.executionTime,
        timestamp: new Date().toISOString(),
        metadata: options.metadata,
    };
}
/**
 * Type guard для проверки успешного ответа
 */
function isSuccessResponse(response) {
    return response.success === true && response.data !== undefined;
}
/**
 * Type guard для проверки ответа с ошибкой
 */
function isErrorResponse(response) {
    return response.success === false && response.error !== undefined;
}
/**
 * Создает объект ошибки API
 */
function createApiError(code, message, details) {
    return {
        code,
        message,
        details,
        ...(process.env.NODE_ENV === 'development' && {
            stack: new Error().stack,
        }),
    };
}
/**
 * Стандартные коды ошибок платформы
 */
exports.ErrorCodes = {
    // Общие ошибки
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    // Ошибки аутентификации
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    // Ошибки пользователей
    USER_EXISTS: 'USER_EXISTS',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    // Ошибки валидации
    INVALID_EMAIL: 'INVALID_EMAIL',
    INVALID_PASSWORD: 'INVALID_PASSWORD',
    // Ошибки бизнес-логики
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    RESOURCE_LOCKED: 'RESOURCE_LOCKED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
};
/**
 * Стандартные сообщения об ошибках
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
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PASSWORD: 'Invalid password format',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    RESOURCE_LOCKED: 'Resource is locked',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
};
//# sourceMappingURL=api-response.js.map