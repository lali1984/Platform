/**
 * Уникальный идентификатор пользователя.
 * Используется как branded type для типобезопасности.
 */
export type UserId = string & {
    readonly __brand: 'UserId';
};
/**
 * Проверяет, является ли значение валидным UserId.
 * На практике — это просто non-empty string, но может быть расширено (UUID-валидация).
 */
export declare function isUserId(value: unknown): value is UserId;
/**
 * Создаёт UserId из строки (без валидации — для внутреннего использования).
 * Используйте только если вы уверены в источнике данных.
 */
export declare function unsafeCreateUserId(id: string): UserId;
//# sourceMappingURL=UserId.d.ts.map