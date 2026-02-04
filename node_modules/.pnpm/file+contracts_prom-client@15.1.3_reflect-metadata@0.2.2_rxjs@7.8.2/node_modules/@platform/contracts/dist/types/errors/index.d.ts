/**
 * Общий тип кода ошибки платформы.
 * Используется во всех сервисах для унифицированной обработки.
 */
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
/**
 * Стандартный интерфейс ошибки API (совместим с contracts/api).
 */
export interface ApiError {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
}
/**
 * Ошибка валидации поля (используется в DTO и middleware).
 */
export interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
}
/**
 * Группа стандартных кодов ошибок платформы.
 * Должна быть синхронизирована с contracts/api/src/base/api-response.ts.
 */
export declare const ErrorCodes: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    readonly INVALID_CREDENTIALS: "INVALID_CREDENTIALS";
    readonly TOKEN_EXPIRED: "TOKEN_EXPIRED";
    readonly TOKEN_INVALID: "TOKEN_INVALID";
    readonly USER_EXISTS: "USER_EXISTS";
    readonly USER_NOT_FOUND: "USER_NOT_FOUND";
    readonly USER_LOCKED: "USER_LOCKED";
    readonly INVALID_EMAIL: "INVALID_EMAIL";
    readonly INVALID_PASSWORD: "INVALID_PASSWORD";
    readonly INVALID_PHONE: "INVALID_PHONE";
    readonly INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS";
    readonly RESOURCE_LOCKED: "RESOURCE_LOCKED";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
    readonly CONFLICT: "CONFLICT";
};
/**
 * Типизированный объект сообщений об ошибках.
 * Используется для локализации и централизованного управления текстами.
 */
export declare const ErrorMessages: Record<ErrorCode, string>;
//# sourceMappingURL=index.d.ts.map