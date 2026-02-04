"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceName = exports.UserStatus = exports.PrivacyLevel = exports.NotificationChannel = exports.UserRole = void 0;
/**
 * Роли пользователя в системе.
 * Используется в auth-, profile-, permission-сервисах.
 */
exports.UserRole = {
    ADMIN: 'admin',
    MEMBER: 'member',
    GUEST: 'guest',
    SYSTEM: 'system',
};
/**
 * Каналы уведомлений.
 * Используется в notification-service и интеграциях.
 */
exports.NotificationChannel = {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    IN_APP: 'in_app',
    WEBHOOK: 'webhook',
};
/**
 * Уровни приватности профиля.
 * Используется в profile-, search-, analytics-сервисах.
 */
exports.PrivacyLevel = {
    PUBLIC: 'public',
    PRIVATE: 'private',
    HIDDEN: 'hidden',
};
/**
 * Статусы пользовательского аккаунта.
 */
exports.UserStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    LOCKED: 'locked',
    DELETED: 'deleted',
};
/**
 * Типы событий (для унификации в Kafka metadata.sourceService или event routing).
 */
exports.ServiceName = {
    AUTH_SERVICE: 'auth-service',
    PROFILE_SERVICE: 'profile-service',
    NOTIFICATION_SERVICE: 'notification-service',
    ANALYTICS_SERVICE: 'analytics-service',
    PAYMENT_SERVICE: 'payment-service',
};
//# sourceMappingURL=index.js.map