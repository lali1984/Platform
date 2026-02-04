import { ApiResponse, ApiError, createSuccessResponse, createErrorResponse, createApiError, isSuccessResponse, isErrorResponse, ErrorCodes, ErrorMessages } from './api-response';
export type { ApiResponse, ApiError };
export { createSuccessResponse, createErrorResponse, createApiError, isSuccessResponse, isErrorResponse, ErrorCodes, ErrorMessages, };
export declare class ApiUtils {
    /**
     * Создает стандартный успешный ответ
     */
    static createSuccess<T>(data: T, message?: string): ApiResponse<T>;
    /**
     * Создает стандартный ответ с ошибкой
     */
    static createError(code: string, message: string, details?: any): ApiResponse;
    /**
     * Создает ответ "Не найдено"
     */
    static createNotFound(resource: string, id?: string): ApiResponse;
    /**
     * Создает ответ "Неавторизован"
     */
    static createUnauthorized(message?: string): ApiResponse;
    /**
     * Создает ответ "Запрещено"
     */
    static createForbidden(message?: string): ApiResponse;
    /**
     * Создает ответ с ошибкой валидации
     */
    static createValidationError(errors: any[]): ApiResponse;
    /**
     * Проверяет, является ли ответ успешным
     */
    static isSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & {
        success: true;
        data: T;
    };
    /**
     * Проверяет, является ли ответ ошибочным
     */
    static isError(response: ApiResponse): response is ApiResponse & {
        success: false;
        error: ApiError;
    };
    /**
     * Извлекает данные из успешного ответа
     */
    static extractData<T>(response: ApiResponse<T>): T | null;
    /**
     * Извлекает ошибку из ответа
     */
    static extractError(response: ApiResponse): ApiError | null;
}
//# sourceMappingURL=index.d.ts.map