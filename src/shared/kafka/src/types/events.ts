export enum EventType {
  USER_REGISTERED = 'user.registered',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  
  // Auth events
  USER_LOGGED_IN = 'user.logged.in',
  USER_LOGGED_OUT = 'user.logged.out',
  TWO_FACTOR_ENABLED = 'two.factor.enabled',
  TWO_FACTOR_DISABLED = 'two.factor.disabled',
  
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
}

export interface UserRegisteredEvent extends BaseEvent {
  type: EventType.USER_REGISTERED;
  data: {
    userId: string;
    email: string;
    username?: string;
    registeredAt: string;
  };
}

export interface UserUpdatedEvent extends BaseEvent {
  type: EventType.USER_UPDATED;
  data: {
    userId: string;
    email?: string;
    username?: string;
    updatedFields: string[];
  };
}

export type PlatformEvent = UserRegisteredEvent | UserUpdatedEvent;
