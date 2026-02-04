/**
 * Дата в формате ISO 8601 (например, '2024-05-21T10:30:00.000Z').
 * Используется как branded type.
 */
export type ISO8601Date = string & { readonly __brand: 'ISO8601Date' };

/**
 * Проверяет, является ли строка корректной ISO-датой.
 */
export function isValidISO8601Date(str: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(str)) {
    return false;
  }
  const d = new Date(str);
  return d instanceof Date && !isNaN(d.getTime()) && d.toISOString() === str;
}

/**
 * Преобразует Date в ISO8601Date.
 */
export function toISO8601Date(date: Date): ISO8601Date {
  return date.toISOString() as ISO8601Date;
}

/**
 * Создаёт ISO8601Date из строки, если она валидна.
 */
export function parseISO8601Date(str: string): ISO8601Date | null {
  return isValidISO8601Date(str) ? (str as ISO8601Date) : null;
}

/**
 * Проверяет, является ли значение ISO8601Date.
 */
export function isISO8601Date(value: unknown): value is ISO8601Date {
  return typeof value === 'string' && isValidISO8601Date(value);
}