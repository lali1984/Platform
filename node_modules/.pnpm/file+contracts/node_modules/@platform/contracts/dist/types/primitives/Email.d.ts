/**
 * Валидный email-адрес.
 * Используется как branded type.
 */
export type Email = string & {
    readonly __brand: 'Email';
};
/**
 * Проверяет, является ли строка валидным email.
 */
export declare function isValidEmail(str: string): boolean;
/**
 * Создаёт Email из строки, если она валидна.
 * Возвращает null при невалидном email.
 */
export declare function createEmail(str: string): Email | null;
/**
 * Проверяет, является ли значение Email.
 */
export declare function isEmail(value: unknown): value is Email;
//# sourceMappingURL=Email.d.ts.map