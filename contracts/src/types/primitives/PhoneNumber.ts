/**
 * Номер телефона в формате E.164 (например, '+79001234567').
 * Используется как branded type: `phone: PhoneNumber`.
 */
export type PhoneNumber = string & { readonly __brand: 'PhoneNumber' };

/**
 * Регулярное выражение для базовой валидации E.164.
 * Поддерживает: +[1-9][0-9]{1,14}
 */
const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

/**
 * Проверяет, является ли строка валидным номером E.164.
 */
export function isValidPhoneNumber(str: string): boolean {
  return PHONE_REGEX.test(str);
}

/**
 * Нормализует номер в формат E.164:
 * - удаляет пробелы, скобки, дефисы,
 * - добавляет '+' если отсутствует,
 * - оставляет только цифры (кроме первого '+').
 */
export function normalizePhoneNumber(str: string): string {
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
export function createPhoneNumber(str: string): PhoneNumber | null {
  const normalized = normalizePhoneNumber(str);
  return isValidPhoneNumber(normalized) ? (normalized as PhoneNumber) : null;
}

/**
 * Проверяет, является ли значение PhoneNumber.
 */
export function isPhoneNumber(value: unknown): value is PhoneNumber {
  return typeof value === 'string' && isValidPhoneNumber(value);
}