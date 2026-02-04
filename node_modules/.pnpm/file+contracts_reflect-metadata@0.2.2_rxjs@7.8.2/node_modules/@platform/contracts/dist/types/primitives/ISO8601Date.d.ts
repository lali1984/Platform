/**
 * Дата в формате ISO 8601 (например, '2024-05-21T10:30:00.000Z').
 * Используется как branded type.
 */
export type ISO8601Date = string & {
    readonly __brand: 'ISO8601Date';
};
/**
 * Проверяет, является ли строка корректной ISO-датой.
 */
export declare function isValidISO8601Date(str: string): boolean;
/**
 * Преобразует Date в ISO8601Date.
 */
export declare function toISO8601Date(date: Date): ISO8601Date;
/**
 * Создаёт ISO8601Date из строки, если она валидна.
 */
export declare function parseISO8601Date(str: string): ISO8601Date | null;
/**
 * Проверяет, является ли значение ISO8601Date.
 */
export declare function isISO8601Date(value: unknown): value is ISO8601Date;
//# sourceMappingURL=ISO8601Date.d.ts.map