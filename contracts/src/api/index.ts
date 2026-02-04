// Главный файл экспорта API контрактов

// Импортируем напрямую из base/api-response.ts
import {
  ApiResponse,
  ApiError,
  createSuccessResponse,
  createErrorResponse,
  createApiError,
  isSuccessResponse,
  isErrorResponse,
  ErrorCodes,
  ErrorMessages,
} from './api-response';

// Экспортируем типы и функции напрямую
export type { ApiResponse, ApiError };
export {
  createSuccessResponse,
  createErrorResponse,
  createApiError,
  isSuccessResponse,
  isErrorResponse,
  ErrorCodes,
  ErrorMessages,
};

// Утилиты для работы с API
export class ApiUtils {
  /**
   * Создает стандартный успешный ответ
   */
  static createSuccess<T>(data: T, message?: string): ApiResponse<T> {
    return createSuccessResponse(data, {
      metadata: message ? { message } : undefined,
    });
  }

  /**
   * Создает стандартный ответ с ошибкой
   */
  static createError(code: string, message: string, details?: any): ApiResponse {
    return createErrorResponse(createApiError(code, message, details));
  }

  /**
   * Создает ответ "Не найдено"
   */
  static createNotFound(resource: string, id?: string): ApiResponse {
    return this.createError(
      ErrorCodes.NOT_FOUND,
      `${resource}${id ? ` with ID ${id}` : ''} not found`
    );
  }

  /**
   * Создает ответ "Неавторизован"
   */
  static createUnauthorized(message?: string): ApiResponse {
    return this.createError(
      ErrorCodes.UNAUTHORIZED,
      message || ErrorMessages.UNAUTHORIZED
    );
  }

  /**
   * Создает ответ "Запрещено"
   */
  static createForbidden(message?: string): ApiResponse {
    return this.createError(
      ErrorCodes.FORBIDDEN,
      message || ErrorMessages.FORBIDDEN
    );
  }

  /**
   * Создает ответ с ошибкой валидации
   */
  static createValidationError(errors: any[]): ApiResponse {
    return this.createError(
      ErrorCodes.VALIDATION_ERROR,
      ErrorMessages.VALIDATION_ERROR,
      errors
    );
  }

  /**
   * Проверяет, является ли ответ успешным
   */
  static isSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } {
    return isSuccessResponse(response);
  }

  /**
   * Проверяет, является ли ответ ошибочным
   */
  static isError(response: ApiResponse): response is ApiResponse & { success: false; error: ApiError } {
    return isErrorResponse(response);
  }

  /**
   * Извлекает данные из успешного ответа
   */
  static extractData<T>(response: ApiResponse<T>): T | null {
    return this.isSuccess(response) ? response.data : null;
  }

  /**
   * Извлекает ошибку из ответа
   */
  static extractError(response: ApiResponse): ApiError | null {
    return this.isError(response) ? response.error : null;
  }
}