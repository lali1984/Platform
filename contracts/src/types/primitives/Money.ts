/**
 * Сумма денег в центах (целое число) для точных расчётов.
 * Используется как branded type: `amount: Money`.
 * Хранится в минимальных единицах (например, 100 = $1.00), чтобы избежать ошибок с float.
 */
export type Money = number & { readonly __brand: 'Money' };

/**
 * Проверяет, является ли число допустимой суммой денег (целое, неотрицательное).
 */
export function isValidMoney(amount: number): boolean {
  return Number.isInteger(amount) && amount >= 0;
}

/**
 * Создаёт Money из числа (в центах), если оно валидно.
 * Возвращает null при невалидном значении.
 */
export function createMoney(amount: number): Money | null {
  return isValidMoney(amount) ? (amount as Money) : null;
}

/**
 * Форматирует Money как доллары (или другую валюту) с двумя знаками после запятой.
 * Например: `formatMoney(1234)` → `'12.34'`
 */
export function formatMoney(amount: Money, currency = 'USD'): string {
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
export function isMoney(value: unknown): value is Money {
  return typeof value === 'number' && isValidMoney(value);
}