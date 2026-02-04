"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPhoneNumber = isValidPhoneNumber;
exports.normalizePhoneNumber = normalizePhoneNumber;
exports.createPhoneNumber = createPhoneNumber;
exports.isPhoneNumber = isPhoneNumber;
/**
 * Регулярное выражение для базовой валидации E.164.
 * Поддерживает: +[1-9][0-9]{1,14}
 */
const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;
/**
 * Проверяет, является ли строка валидным номером E.164.
 */
function isValidPhoneNumber(str) {
    return PHONE_REGEX.test(str);
}
/**
 * Нормализует номер в формат E.164:
 * - удаляет пробелы, скобки, дефисы,
 * - добавляет '+' если отсутствует,
 * - оставляет только цифры (кроме первого '+').
 */
function normalizePhoneNumber(str) {
    // Удаляем всё, кроме цифр и '+'
    let cleaned = str.replace(/[^+\d]/g, '');
    // Если нет '+', добавляем по умолчанию для РФ (можно адаптировать под регион)
    if (!cleaned.startsWith('+')) {
        cleaned = '+7' + cleaned.replace(/^\+/, '');
    }
    // Оставляем только первый '+'
    const plusIndex = cleaned.indexOf('+');
    if (plusIndex !== 0) {
        cleaned = '+' + cleaned.slice(plusIndex + 1);
    }
    return cleaned;
}
/**
 * Создаёт PhoneNumber из строки, если она валидна или может быть нормализована.
 * Возвращает null при невозможности нормализовать или невалидном результате.
 */
function createPhoneNumber(str) {
    const normalized = normalizePhoneNumber(str);
    return isValidPhoneNumber(normalized) ? normalized : null;
}
/**
 * Проверяет, является ли значение PhoneNumber.
 */
function isPhoneNumber(value) {
    return typeof value === 'string' && isValidPhoneNumber(value);
}
//# sourceMappingURL=PhoneNumber.js.map