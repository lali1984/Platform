export enum EventType {
  USER_REGISTERED = 'user.registered',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  
  // Auth events
  USER_LOGGED_IN = 'user.logged.in',
  USER_LOGGED_OUT = 'user.logged.out',
  USER_LOGIN_FAILED = 'user.login.failed',
  TWO_FACTOR_ENABLED = 'two.factor.enabled',
  TWO_FACTOR_DISABLED = 'two.factor.disabled',
  PASSWORD_RESET_REQUESTED = 'password.reset.requested',
  PASSWORD_RESET_COMPLETED = 'password.reset.completed',
  EMAIL_VERIFIED = 'email.verified',
  
  // В будущем добавим больше
  NEWS_PUBLISHED = 'news.published',
  NEWS_UPDATED = 'news.updated',
  NEWS_DELETED = 'news.deleted',
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

export type PlatformEvent = 
  | UserRegisteredEvent 
  | UserUpdatedEvent
  | UserLoggedInEvent
  | UserLoginFailedEvent
  | TwoFactorEnabledEvent
  | PasswordResetRequestedEvent;

// Константы для топиков Kafka
export const KafkaTopics = {
  USER_EVENTS: 'user-events',
  AUTH_EVENTS: 'auth-events',
  SECURITY_EVENTS: 'security-events',
  NOTIFICATION_EVENTS: 'notification-events',
} as const;

// Маппинг типов событий на топики
export const EventTopicMapping: Record<EventType, string> = {
  [EventType.USER_REGISTERED]: KafkaTopics.USER_EVENTS,
  [EventType.USER_UPDATED]: KafkaTopics.USER_EVENTS,
  [EventType.USER_DELETED]: KafkaTopics.USER_EVENTS,
  [EventType.USER_LOGGED_IN]: KafkaTopics.AUTH_EVENTS,
  [EventType.USER_LOGGED_OUT]: KafkaTopics.AUTH_EVENTS,
  [EventType.USER_LOGIN_FAILED]: KafkaTopics.SECURITY_EVENTS,
  [EventType.TWO_FACTOR_ENABLED]: KafkaTopics.AUTH_EVENTS,
  [EventType.TWO_FACTOR_DISABLED]: KafkaTopics.AUTH_EVENTS,
  [EventType.PASSWORD_RESET_REQUESTED]: KafkaTopics.SECURITY_EVENTS,
  [EventType.PASSWORD_RESET_COMPLETED]: KafkaTopics.SECURITY_EVENTS,
  [EventType.EMAIL_VERIFIED]: KafkaTopics.USER_EVENTS,
  [EventType.NEWS_PUBLISHED]: KafkaTopics.NOTIFICATION_EVENTS,
  [EventType.NEWS_UPDATED]: KafkaTopics.NOTIFICATION_EVENTS,
  [EventType.NEWS_DELETED]: KafkaTopics.NOTIFICATION_EVENTS,
};