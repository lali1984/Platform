/**
 * Уникальный идентификатор пользователя.
 * Используется как branded type для типобезопасности.
 */
export type UserId = string & { readonly __brand: 'UserId' };

/**
 * Проверяет, является ли значение валидным UserId.
 * На практике — это просто non-empty string, но может быть расширено (UUID-валидация).
 */
export function isUserId(value: unknown): value is UserId {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Создаёт UserId из строки (без валидации — для внутреннего использования).
 * Используйте только если вы уверены в источнике данных.
 */
export function unsafeCreateUserId(id: string): UserId {
  return id as UserId;
}