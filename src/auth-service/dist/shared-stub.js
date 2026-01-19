"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCorrelationId = exports.createBaseEvent = exports.EventType = exports.redisEventPublisher = void 0;
exports.redisEventPublisher = {
    connect: async () => console.log('Redis Event Publisher stub'),
    disconnect: async () => console.log('Disconnect stub'),
    publish: async (event) => console.log('Publish stub', event),
    getStatus: async () => ({ connected: true })
};
var EventType;
(function (EventType) {
    EventType["USER_REGISTERED"] = "USER_REGISTERED";
    EventType["USER_LOGGED_IN"] = "USER_LOGGED_IN";
    EventType["USER_UPDATED"] = "USER_UPDATED";
    EventType["USER_DELETED"] = "USER_DELETED";
})(EventType || (exports.EventType = EventType = {}));
;
const createBaseEvent = (type, source, correlationId) => ({
    type, source, correlationId, timestamp: new Date().toISOString(), version: '1.0.0'
});
exports.createBaseEvent = createBaseEvent;
const generateCorrelationId = () => `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
exports.generateCorrelationId = generateCorrelationId;
//# sourceMappingURL=shared-stub.js.map