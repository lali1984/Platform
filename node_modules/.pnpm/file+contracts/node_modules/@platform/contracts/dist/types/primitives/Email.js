"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = isValidEmail;
exports.createEmail = createEmail;
exports.isEmail = isEmail;
/**
 * Регулярное выражение для базовой валидации email (RFC 5322 упрощённо).
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
/**
 * Проверяет, является ли строка валидным email.
 */
function isValidEmail(str) {
    return EMAIL_REGEX.test(str);
}
/**
 * Создаёт Email из строки, если она валидна.
 * Возвращает null при невалидном email.
 */
function createEmail(str) {
    return isValidEmail(str) ? str : null;
}
/**
 * Проверяет, является ли значение Email.
 */
function isEmail(value) {
    return typeof value === 'string' && isValidEmail(value);
}
//# sourceMappingURL=Email.js.map