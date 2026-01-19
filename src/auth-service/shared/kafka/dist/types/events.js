"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventTopicMapping = exports.KafkaTopics = exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType["USER_REGISTERED"] = "user.registered";
    EventType["USER_UPDATED"] = "user.updated";
    EventType["USER_DELETED"] = "user.deleted";
    // Auth events
    EventType["USER_LOGGED_IN"] = "user.logged.in";
    EventType["USER_LOGGED_OUT"] = "user.logged.out";
    EventType["USER_LOGIN_FAILED"] = "user.login.failed";
    EventType["TWO_FACTOR_ENABLED"] = "two.factor.enabled";
    EventType["TWO_FACTOR_DISABLED"] = "two.factor.disabled";
    EventType["PASSWORD_RESET_REQUESTED"] = "password.reset.requested";
    EventType["PASSWORD_RESET_COMPLETED"] = "password.reset.completed";
    EventType["EMAIL_VERIFIED"] = "email.verified";
    // В будущем добавим больше
    EventType["NEWS_PUBLISHED"] = "news.published";
    EventType["NEWS_UPDATED"] = "news.updated";
    EventType["NEWS_DELETED"] = "news.deleted";
})(EventType || (exports.EventType = EventType = {}));
// Константы для топиков Kafka
exports.KafkaTopics = {
    USER_EVENTS: 'user-events',
    AUTH_EVENTS: 'auth-events',
    SECURITY_EVENTS: 'security-events',
    NOTIFICATION_EVENTS: 'notification-events',
};
// Маппинг типов событий на топики
exports.EventTopicMapping = {
    [EventType.USER_REGISTERED]: exports.KafkaTopics.USER_EVENTS,
    [EventType.USER_UPDATED]: exports.KafkaTopics.USER_EVENTS,
    [EventType.USER_DELETED]: exports.KafkaTopics.USER_EVENTS,
    [EventType.USER_LOGGED_IN]: exports.KafkaTopics.AUTH_EVENTS,
    [EventType.USER_LOGGED_OUT]: exports.KafkaTopics.AUTH_EVENTS,
    [EventType.USER_LOGIN_FAILED]: exports.KafkaTopics.SECURITY_EVENTS,
    [EventType.TWO_FACTOR_ENABLED]: exports.KafkaTopics.AUTH_EVENTS,
    [EventType.TWO_FACTOR_DISABLED]: exports.KafkaTopics.AUTH_EVENTS,
    [EventType.PASSWORD_RESET_REQUESTED]: exports.KafkaTopics.SECURITY_EVENTS,
    [EventType.PASSWORD_RESET_COMPLETED]: exports.KafkaTopics.SECURITY_EVENTS,
    [EventType.EMAIL_VERIFIED]: exports.KafkaTopics.USER_EVENTS,
    [EventType.NEWS_PUBLISHED]: exports.KafkaTopics.NOTIFICATION_EVENTS,
    [EventType.NEWS_UPDATED]: exports.KafkaTopics.NOTIFICATION_EVENTS,
    [EventType.NEWS_DELETED]: exports.KafkaTopics.NOTIFICATION_EVENTS,
};
//# sourceMappingURL=events.js.map