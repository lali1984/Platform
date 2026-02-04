"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNonEmptyString = isNonEmptyString;
exports.createNonEmptyString = createNonEmptyString;
exports.isNonEmptyStringValue = isNonEmptyStringValue;
/**
 * Проверяет, является ли строка непустой (после trim).
 */
function isNonEmptyString(str) {
    return typeof str === 'string' && str.trim().length > 0;
}
/**
 * Создаёт NonEmptyString из строки, если она не пуста.
 * Возвращает null при пустой или только пробельной строке.
 */
function createNonEmptyString(str) {
    return isNonEmptyString(str) ? str : null;
}
/**
 * Проверяет, является ли значение NonEmptyString.
 */
function isNonEmptyStringValue(value) {
    return typeof value === 'string' && isNonEmptyString(value);
}
//# sourceMappingURL=NonEmptyString.js.map