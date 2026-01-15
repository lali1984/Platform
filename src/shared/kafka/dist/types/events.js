"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType["USER_REGISTERED"] = "user.registered";
    EventType["USER_UPDATED"] = "user.updated";
    EventType["USER_DELETED"] = "user.deleted";
    // Auth events
    EventType["USER_LOGGED_IN"] = "user.logged.in";
    EventType["USER_LOGGED_OUT"] = "user.logged.out";
    EventType["TWO_FACTOR_ENABLED"] = "two.factor.enabled";
    EventType["TWO_FACTOR_DISABLED"] = "two.factor.disabled";
    // В будущем добавим больше
    EventType["NEWS_PUBLISHED"] = "news.published";
    EventType["NEWS_UPDATED"] = "news.updated";
    EventType["NEWS_DELETED"] = "news.deleted";
})(EventType || (exports.EventType = EventType = {}));
//# sourceMappingURL=events.js.map