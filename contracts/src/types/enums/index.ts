/**
 * Роли пользователя в системе.
 * Используется в auth-, profile-, permission-сервисах.
 */
export const UserRole = {
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
  SYSTEM: 'system',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

/**
 * Каналы уведомлений.
 * Используется в notification-service и интеграциях.
 */
export const NotificationChannel = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
  WEBHOOK: 'webhook',
} as const;

export type NotificationChannel = typeof NotificationChannel[keyof typeof NotificationChannel];

/**
 * Уровни приватности профиля.
 * Используется в profile-, search-, analytics-сервисах.
 */
export const PrivacyLevel = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  HIDDEN: 'hidden',
} as const;

export type PrivacyLevel = typeof PrivacyLevel[keyof typeof PrivacyLevel];

/**
 * Статусы пользовательского аккаунта.
 */
export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  LOCKED: 'locked',
  DELETED: 'deleted',
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

/**
 * Типы событий (для унификации в Kafka metadata.sourceService или event routing).
 */
export const ServiceName = {
  AUTH_SERVICE: 'auth-service',
  PROFILE_SERVICE: 'profile-service',
  NOTIFICATION_SERVICE: 'notification-service',
  ANALYTICS_SERVICE: 'analytics-service',
  PAYMENT_SERVICE: 'payment-service',
} as const;

export type ServiceName = typeof ServiceName[keyof typeof ServiceName];