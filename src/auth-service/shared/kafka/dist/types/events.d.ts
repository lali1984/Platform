export declare enum EventType {
    USER_REGISTERED = "user.registered",
    USER_UPDATED = "user.updated",
    USER_DELETED = "user.deleted",
    USER_LOGGED_IN = "user.logged.in",
    USER_LOGGED_OUT = "user.logged.out",
    USER_LOGIN_FAILED = "user.login.failed",
    TWO_FACTOR_ENABLED = "two.factor.enabled",
    TWO_FACTOR_DISABLED = "two.factor.disabled",
    PASSWORD_RESET_REQUESTED = "password.reset.requested",
    PASSWORD_RESET_COMPLETED = "password.reset.completed",
    EMAIL_VERIFIED = "email.verified",
    NEWS_PUBLISHED = "news.published",
    NEWS_UPDATED = "news.updated",
    NEWS_DELETED = "news.deleted"
}
export interface BaseEvent {
    type: EventType;
    timestamp: string;
    version: string;
    source: string;
    eventId: string;
    correlationId?: string;
}
export interface UserRegisteredEvent extends BaseEvent {
    type: EventType.USER_REGISTERED;
    data: {
        userId: string;
        email: string;
        username?: string;
        registeredAt: string;
        metadata: {
            isEmailVerified: boolean;
            isActive: boolean;
            isTwoFactorEnabled: boolean;
        };
    };
}
export interface UserUpdatedEvent extends BaseEvent {
    type: EventType.USER_UPDATED;
    data: {
        userId: string;
        email?: string;
        username?: string;
        updatedFields: string[];
        updatedAt: string;
    };
}
export interface UserLoggedInEvent extends BaseEvent {
    type: EventType.USER_LOGGED_IN;
    data: {
        userId: string;
        email: string;
        loginAt: string;
        metadata: {
            ipAddress?: string;
            userAgent?: string;
            deviceInfo?: string;
            isTwoFactorEnabled: boolean;
            loginMethod: 'password' | 'oauth' | 'token';
        };
    };
}
export interface UserLoginFailedEvent extends BaseEvent {
    type: EventType.USER_LOGIN_FAILED;
    data: {
        email: string;
        reason: 'user_not_found' | 'invalid_password' | 'account_inactive' | 'account_locked' | 'two_factor_required' | 'two_factor_invalid';
        failedAt: string;
        metadata: {
            ipAddress?: string;
            userAgent?: string;
            attemptCount?: number;
        };
    };
}
export interface TwoFactorEnabledEvent extends BaseEvent {
    type: EventType.TWO_FACTOR_ENABLED;
    data: {
        userId: string;
        email: string;
        enabledAt: string;
        method: 'app' | 'sms' | 'email';
    };
}
export interface PasswordResetRequestedEvent extends BaseEvent {
    type: EventType.PASSWORD_RESET_REQUESTED;
    data: {
        userId: string;
        email: string;
        requestedAt: string;
        resetToken?: string;
        expiresAt: string;
    };
}
export type PlatformEvent = UserRegisteredEvent | UserUpdatedEvent | UserLoggedInEvent | UserLoginFailedEvent | TwoFactorEnabledEvent | PasswordResetRequestedEvent;
export declare const KafkaTopics: {
    readonly USER_EVENTS: "user-events";
    readonly AUTH_EVENTS: "auth-events";
    readonly SECURITY_EVENTS: "security-events";
    readonly NOTIFICATION_EVENTS: "notification-events";
};
export declare const EventTopicMapping: Record<EventType, string>;
//# sourceMappingURL=events.d.ts.map