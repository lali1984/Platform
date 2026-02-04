/**
 * Доменные примитивы платформы.
 * Все типы — branded, обеспечивают типобезопасность и валидацию.
 */
export type { UserId } from './UserId';
export { isUserId, unsafeCreateUserId } from './UserId';
export type { Email } from './Email';
export { createEmail, isEmail, isValidEmail } from './Email';
export type { PhoneNumber } from './PhoneNumber';
export { createPhoneNumber, isPhoneNumber, isValidPhoneNumber, normalizePhoneNumber } from './PhoneNumber';
export type { ISO8601Date } from './ISO8601Date';
export { toISO8601Date, parseISO8601Date, isISO8601Date, isValidISO8601Date, } from './ISO8601Date';
export type { NonEmptyString } from './NonEmptyString';
export { createNonEmptyString, isNonEmptyStringValue, isNonEmptyString } from './NonEmptyString';
export type { Money } from './Money';
export { createMoney, isMoney, formatMoney, isValidMoney } from './Money';
//# sourceMappingURL=index.d.ts.map