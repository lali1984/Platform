/**
 * Номер телефона в формате E.164 (например, '+79001234567').
 * Используется как branded type: `phone: PhoneNumber`.
 */
export type PhoneNumber = string & {
    readonly __brand: 'PhoneNumber';
};
/**
 * Проверяет, является ли строка валидным номером E.164.
 */
export declare function isValidPhoneNumber(str: string): boolean;
/**
 * Нормализует номер в формат E.164:
 * - удаляет пробелы, скобки, дефисы,
 * - добавляет '+' если отсутствует,
 * - оставляет только цифры (кроме первого '+').
 */
export declare function normalizePhoneNumber(str: string): string;
/**
 * Создаёт PhoneNumber из строки, если она валидна или может быть нормализована.
 * Возвращает null при невозможности нормализовать или невалидном результате.
 */
export declare function createPhoneNumber(str: string): PhoneNumber | null;
/**
 * Проверяет, является ли значение PhoneNumber.
 */
export declare function isPhoneNumber(value: unknown): value is PhoneNumber;
//# sourceMappingURL=PhoneNumber.d.ts.map