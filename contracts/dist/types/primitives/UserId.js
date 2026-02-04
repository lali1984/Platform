"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserId = isUserId;
exports.unsafeCreateUserId = unsafeCreateUserId;
/**
 * Проверяет, является ли значение валидным UserId.
 * На практике — это просто non-empty string, но может быть расширено (UUID-валидация).
 */
function isUserId(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
/**
 * Создаёт UserId из строки (без валидации — для внутреннего использования).
 * Используйте только если вы уверены в источнике данных.
 */
function unsafeCreateUserId(id) {
    return id;
}
//# sourceMappingURL=UserId.js.map