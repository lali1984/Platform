"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidMoney = isValidMoney;
exports.createMoney = createMoney;
exports.formatMoney = formatMoney;
exports.isMoney = isMoney;
/**
 * Проверяет, является ли число допустимой суммой денег (целое, неотрицательное).
 */
function isValidMoney(amount) {
    return Number.isInteger(amount) && amount >= 0;
}
/**
 * Создаёт Money из числа (в центах), если оно валидно.
 * Возвращает null при невалидном значении.
 */
function createMoney(amount) {
    return isValidMoney(amount) ? amount : null;
}
/**
 * Форматирует Money как доллары (или другую валюту) с двумя знаками после запятой.
 * Например: `formatMoney(1234)` → `'12.34'`
 */
function formatMoney(amount, currency = 'USD') {
    const dollars = amount / 100;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(dollars);
}
/**
 * Проверяет, является ли значение Money.
 */
function isMoney(value) {
    return typeof value === 'number' && isValidMoney(value);
}
//# sourceMappingURL=Money.js.map