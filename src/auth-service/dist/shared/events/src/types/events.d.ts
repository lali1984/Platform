export declare enum EventType {
    USER_REGISTERED = "user.registered",
    USER_UPDATED = "user.updated",
    USER_DELETED = "user.deleted",
    USER_LOGGED_IN = "user.logged.in",
    USER_LOGGED_OUT = "user.logged.out",
    USER_EMAIL_VERIFIED = "user.email.verified",
    USER_PASSWORD_CHANGED = "user.password.changed",
    TWO_FACTOR_ENABLED = "two.factor.enabled",
    TWO_FACTOR_DISABLED = "two.factor.disabled",
    NEWS_PUBLISHED = "news.published",
    NEWS_UPDATED = "news.updated",
    NEWS_DELETED = "news.deleted"
}
export interface BaseEvent {
    type: EventType;
    timestamp: string;
    version: string;
    source: string;
    correlationId?: string;
}
export interface UserRegisteredEvent extends BaseEvent {
    type: EventType.USER_REGISTERED;
    data: {
        userId: string;
        email: string;
        registeredAt: string;
        metadata?: {
            userAgent?: string;
            ipAddress?: string;
        };
    };
}
export interface UserLoggedInEvent extends BaseEvent {
    type: EventType.USER_LOGGED_IN;
    data: {
        userId: string;
        email: string;
        loginAt: string;
        metadata?: {
            userAgent?: string;
            ipAddress?: string;
        };
    };
}
export type PlatformEvent = UserRegisteredEvent | UserLoggedInEvent;
export interface EventPublisher {
    publish(event: PlatformEvent): Promise<void>;
}
export interface EventSubscriber {
    subscribe(eventType: EventType, handler: (event: PlatformEvent) => Promise<void>): void;
}
//# sourceMappingURL=events.d.ts.map