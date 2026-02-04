/**
 * Непустая строка.
 * Используется как branded type: `name: NonEmptyString`.
 */
export type NonEmptyString = string & {
    readonly __brand: 'NonEmptyString';
};
/**
 * Проверяет, является ли строка непустой (после trim).
 */
export declare function isNonEmptyString(str: string): boolean;
/**
 * Создаёт NonEmptyString из строки, если она не пуста.
 * Возвращает null при пустой или только пробельной строке.
 */
export declare function createNonEmptyString(str: string): NonEmptyString | null;
/**
 * Проверяет, является ли значение NonEmptyString.
 */
export declare function isNonEmptyStringValue(value: unknown): value is NonEmptyString;
//# sourceMappingURL=NonEmptyString.d.ts.map