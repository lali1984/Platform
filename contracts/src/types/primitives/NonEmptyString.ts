/**
 * Непустая строка.
 * Используется как branded type: `name: NonEmptyString`.
 */
export type NonEmptyString = string & { readonly __brand: 'NonEmptyString' };

/**
 * Проверяет, является ли строка непустой (после trim).
 */
export function isNonEmptyString(str: string): boolean {
  return typeof str === 'string' && str.trim().length > 0;
}

/**
 * Создаёт NonEmptyString из строки, если она не пуста.
 * Возвращает null при пустой или только пробельной строке.
 */
export function createNonEmptyString(str: string): NonEmptyString | null {
  return isNonEmptyString(str) ? (str as NonEmptyString) : null;
}

/**
 * Проверяет, является ли значение NonEmptyString.
 */
export function isNonEmptyStringValue(value: unknown): value is NonEmptyString {
  return typeof value === 'string' && isNonEmptyString(value);
}