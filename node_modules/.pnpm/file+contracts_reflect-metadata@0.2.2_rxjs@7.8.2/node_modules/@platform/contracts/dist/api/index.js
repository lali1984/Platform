"use strict";
// Главный файл экспорта API контрактов
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiUtils = exports.ErrorMessages = exports.ErrorCodes = exports.isErrorResponse = exports.isSuccessResponse = exports.createApiError = exports.createErrorResponse = exports.createSuccessResponse = void 0;
// Импортируем напрямую из base/api-response.ts
const api_response_1 = require("./api-response");
Object.defineProperty(exports, "createSuccessResponse", { enumerable: true, get: function () { return api_response_1.createSuccessResponse; } });
Object.defineProperty(exports, "createErrorResponse", { enumerable: true, get: function () { return api_response_1.createErrorResponse; } });
Object.defineProperty(exports, "createApiError", { enumerable: true, get: function () { return api_response_1.createApiError; } });
Object.defineProperty(exports, "isSuccessResponse", { enumerable: true, get: function () { return api_response_1.isSuccessResponse; } });
Object.defineProperty(exports, "isErrorResponse", { enumerable: true, get: function () { return api_response_1.isErrorResponse; } });
Object.defineProperty(exports, "ErrorCodes", { enumerable: true, get: function () { return api_response_1.ErrorCodes; } });
Object.defineProperty(exports, "ErrorMessages", { enumerable: true, get: function () { return api_response_1.ErrorMessages; } });
// Утилиты для работы с API
class ApiUtils {
    /**
     * Создает стандартный успешный ответ
     */
    static createSuccess(data, message) {
        return (0, api_response_1.createSuccessResponse)(data, {
            metadata: message ? { message } : undefined,
        });
    }
    /**
     * Создает стандартный ответ с ошибкой
     */
    static createError(code, message, details) {
        return (0, api_response_1.createErrorResponse)((0, api_response_1.createApiError)(code, message, details));
    }
    /**
     * Создает ответ "Не найдено"
     */
    static createNotFound(resource, id) {
        return this.createError(api_response_1.ErrorCodes.NOT_FOUND, `${resource}${id ? ` with ID ${id}` : ''} not found`);
    }
    /**
     * Создает ответ "Неавторизован"
     */
    static createUnauthorized(message) {
        return this.createError(api_response_1.ErrorCodes.UNAUTHORIZED, message || api_response_1.ErrorMessages.UNAUTHORIZED);
    }
    /**
     * Создает ответ "Запрещено"
     */
    static createForbidden(message) {
        return this.createError(api_response_1.ErrorCodes.FORBIDDEN, message || api_response_1.ErrorMessages.FORBIDDEN);
    }
    /**
     * Создает ответ с ошибкой валидации
     */
    static createValidationError(errors) {
        return this.createError(api_response_1.ErrorCodes.VALIDATION_ERROR, api_response_1.ErrorMessages.VALIDATION_ERROR, errors);
    }
    /**
     * Проверяет, является ли ответ успешным
     */
    static isSuccess(response) {
        return (0, api_response_1.isSuccessResponse)(response);
    }
    /**
     * Проверяет, является ли ответ ошибочным
     */
    static isError(response) {
        return (0, api_response_1.isErrorResponse)(response);
    }
    /**
     * Извлекает данные из успешного ответа
     */
    static extractData(response) {
        return this.isSuccess(response) ? response.data : null;
    }
    /**
     * Извлекает ошибку из ответа
     */
    static extractError(response) {
        return this.isError(response) ? response.error : null;
    }
}
exports.ApiUtils = ApiUtils;
//# sourceMappingURL=index.js.map