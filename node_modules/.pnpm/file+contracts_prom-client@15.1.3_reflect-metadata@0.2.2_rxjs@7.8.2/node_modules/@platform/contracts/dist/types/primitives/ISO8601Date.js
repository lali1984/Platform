"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidISO8601Date = isValidISO8601Date;
exports.toISO8601Date = toISO8601Date;
exports.parseISO8601Date = parseISO8601Date;
exports.isISO8601Date = isISO8601Date;
/**
 * Проверяет, является ли строка корректной ISO-датой.
 */
function isValidISO8601Date(str) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(str)) {
        return false;
    }
    const d = new Date(str);
    return d instanceof Date && !isNaN(d.getTime()) && d.toISOString() === str;
}
/**
 * Преобразует Date в ISO8601Date.
 */
function toISO8601Date(date) {
    return date.toISOString();
}
/**
 * Создаёт ISO8601Date из строки, если она валидна.
 */
function parseISO8601Date(str) {
    return isValidISO8601Date(str) ? str : null;
}
/**
 * Проверяет, является ли значение ISO8601Date.
 */
function isISO8601Date(value) {
    return typeof value === 'string' && isValidISO8601Date(value);
}
//# sourceMappingURL=ISO8601Date.js.map