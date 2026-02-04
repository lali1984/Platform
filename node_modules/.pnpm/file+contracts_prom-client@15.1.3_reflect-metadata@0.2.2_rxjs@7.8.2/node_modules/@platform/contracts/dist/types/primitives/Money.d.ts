/**
 * Сумма денег в центах (целое число) для точных расчётов.
 * Используется как branded type: `amount: Money`.
 * Хранится в минимальных единицах (например, 100 = $1.00), чтобы избежать ошибок с float.
 */
export type Money = number & {
    readonly __brand: 'Money';
};
/**
 * Проверяет, является ли число допустимой суммой денег (целое, неотрицательное).
 */
export declare function isValidMoney(amount: number): boolean;
/**
 * Создаёт Money из числа (в центах), если оно валидно.
 * Возвращает null при невалидном значении.
 */
export declare function createMoney(amount: number): Money | null;
/**
 * Форматирует Money как доллары (или другую валюту) с двумя знаками после запятой.
 * Например: `formatMoney(1234)` → `'12.34'`
 */
export declare function formatMoney(amount: Money, currency?: string): string;
/**
 * Проверяет, является ли значение Money.
 */
export declare function isMoney(value: unknown): value is Money;
//# sourceMappingURL=Money.d.ts.map