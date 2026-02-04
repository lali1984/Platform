/**
 * Роли пользователя в системе.
 * Используется в auth-, profile-, permission-сервисах.
 */
export declare const UserRole: {
    readonly ADMIN: "admin";
    readonly MEMBER: "member";
    readonly GUEST: "guest";
    readonly SYSTEM: "system";
};
export type UserRole = typeof UserRole[keyof typeof UserRole];
/**
 * Каналы уведомлений.
 * Используется в notification-service и интеграциях.
 */
export declare const NotificationChannel: {
    readonly EMAIL: "email";
    readonly SMS: "sms";
    readonly PUSH: "push";
    readonly IN_APP: "in_app";
    readonly WEBHOOK: "webhook";
};
export type NotificationChannel = typeof NotificationChannel[keyof typeof NotificationChannel];
/**
 * Уровни приватности профиля.
 * Используется в profile-, search-, analytics-сервисах.
 */
export declare const PrivacyLevel: {
    readonly PUBLIC: "public";
    readonly PRIVATE: "private";
    readonly HIDDEN: "hidden";
};
export type PrivacyLevel = typeof PrivacyLevel[keyof typeof PrivacyLevel];
/**
 * Статусы пользовательского аккаунта.
 */
export declare const UserStatus: {
    readonly ACTIVE: "active";
    readonly INACTIVE: "inactive";
    readonly PENDING: "pending";
    readonly LOCKED: "locked";
    readonly DELETED: "deleted";
};
export type UserStatus = typeof UserStatus[keyof typeof UserStatus];
/**
 * Типы событий (для унификации в Kafka metadata.sourceService или event routing).
 */
export declare const ServiceName: {
    readonly AUTH_SERVICE: "auth-service";
    readonly PROFILE_SERVICE: "profile-service";
    readonly NOTIFICATION_SERVICE: "notification-service";
    readonly ANALYTICS_SERVICE: "analytics-service";
    readonly PAYMENT_SERVICE: "payment-service";
};
export type ServiceName = typeof ServiceName[keyof typeof ServiceName];
//# sourceMappingURL=index.d.ts.map