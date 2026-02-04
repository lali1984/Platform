/**
 * Валидный email-адрес.
 * Используется как branded type.
 */
export type Email = string & { readonly __brand: 'Email' };

/**
 * Регулярное выражение для базовой валидации email (RFC 5322 упрощённо).
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Проверяет, является ли строка валидным email.
 */
export function isValidEmail(str: string): boolean {
  return EMAIL_REGEX.test(str);
}

/**
 * Создаёт Email из строки, если она валидна.
 * Возвращает null при невалидном email.
 */
export function createEmail(str: string): Email | null {
  return isValidEmail(str) ? (str as Email) : null;
}

/**
 * Проверяет, является ли значение Email.
 */
export function isEmail(value: unknown): value is Email {
  return typeof value === 'string' && isValidEmail(value);
}