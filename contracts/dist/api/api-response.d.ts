/**
 * Базовый интерфейс для всех API ответов платформы
 */
export interface ApiResponse<T = any> {
    /** Успешно ли выполнен запрос */
    success: boolean;
    /** Данные ответа (при успехе) */
    data?: T;
    /** Ошибка (при неудаче) */
    error?: ApiError;
    /** Время выполнения запроса в мс */
    executionTime?: number;
    /** Время ответа в ISO формате */
    timestamp: string;
    /** Метаданные ответа */
    metadata?: {
        /** Количество элементов (для пагинации) */
        total?: number;
        /** Номер страницы (для пагинации) */
        page?: number;
        /** Размер страницы (для пагинации) */
        pageSize?: number;
        /** Дополнительные метаданные */
        [key: string]: any;
    };
}
/**
 * Интерфейс ошибки API
 */
export interface ApiError {
    /** Код ошибки */
    code: string;
    /** Сообщение ошибки */
    message: string;
    /** Детали ошибки */
    details?: any;
    /** Стек вызовов (только в development) */
    stack?: string;
}
/**
 * Утилита для создания успешного ответа
 */
export declare function createSuccessResponse<T>(data: T, options?: {
    executionTime?: number;
    metadata?: ApiResponse['metadata'];
}): ApiResponse<T>;
/**
 * Утилита для создания ответа с ошибкой
 */
export declare function createErrorResponse(error: ApiError, options?: {
    executionTime?: number;
    metadata?: ApiResponse['metadata'];
}): ApiResponse;
/**
 * Type guard для проверки успешного ответа
 */
export declare function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & {
    success: true;
    data: T;
};
/**
 * Type guard для проверки ответа с ошибкой
 */
export declare function isErrorResponse(response: ApiResponse): response is ApiResponse & {
    success: false;
    error: ApiError;
};
/**
 * Создает объект ошибки API
 */
export declare function createApiError(code: string, message: string, details?: any): ApiError;
/**
 * Стандартные коды ошибок платформы
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
    readonly INVALID_EMAIL: "INVALID_EMAIL";
    readonly INVALID_PASSWORD: "INVALID_PASSWORD";
    readonly INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS";
    readonly RESOURCE_LOCKED: "RESOURCE_LOCKED";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
};
type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
/**
 * Стандартные сообщения об ошибках
 */
export declare const ErrorMessages: Record<ErrorCode, string>;
export {};
//# sourceMappingURL=api-response.d.ts.map