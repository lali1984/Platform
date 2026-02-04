"use strict";
// Главный файл экспорта событий
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserCreatedEvent = exports.createUserCreatedEvent = exports.createUserRegisteredEvent = exports.UserRegisteredPlatformEvent = exports.isEventType = exports.validateEvent = exports.createEvent = exports.PlatformEvent = void 0;
exports.getEventType = getEventType;
exports.getEventVersion = getEventVersion;
exports.getEventTopic = getEventTopic;
exports.getEventHeaders = getEventHeaders;
exports.validateEventOrThrow = validateEventOrThrow;
exports.createPlatformEvent = createPlatformEvent;
const base_event_1 = require("./base/base-event");
Object.defineProperty(exports, "PlatformEvent", { enumerable: true, get: function () { return base_event_1.PlatformEvent; } });
Object.defineProperty(exports, "createEvent", { enumerable: true, get: function () { return base_event_1.createEvent; } });
Object.defineProperty(exports, "validateEvent", { enumerable: true, get: function () { return base_event_1.validateEvent; } });
Object.defineProperty(exports, "isEventType", { enumerable: true, get: function () { return base_event_1.isEventType; } });
const user_registered_event_1 = require("./auth/user-registered.event");
Object.defineProperty(exports, "UserRegisteredPlatformEvent", { enumerable: true, get: function () { return user_registered_event_1.UserRegisteredPlatformEvent; } });
Object.defineProperty(exports, "createUserRegisteredEvent", { enumerable: true, get: function () { return user_registered_event_1.createUserRegisteredEvent; } });
const user_created_event_1 = require("./user/user-created.event");
Object.defineProperty(exports, "createUserCreatedEvent", { enumerable: true, get: function () { return user_created_event_1.createUserCreatedEvent; } });
Object.defineProperty(exports, "isUserCreatedEvent", { enumerable: true, get: function () { return user_created_event_1.isUserCreatedEvent; } });
// Утилиты
function getEventType(event) {
    return event.eventType;
}
function getEventVersion(event) {
    return event.eventVersion;
}
function getEventTopic(event) {
    const service = event.metadata?.sourceService || 'unknown';
    const eventType = event.eventType.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${service}.${eventType}.v${event.eventVersion.split('.')[0]}`;
}
function getEventHeaders(event) {
    return {
        'event-id': event.eventId,
        'event-type': event.eventType,
        'event-version': event.eventVersion,
        'timestamp': event.timestamp,
        'aggregate-id': event.aggregateId || '',
        'source-service': event.metadata?.sourceService || 'unknown',
        'correlation-id': event.metadata?.correlationId || '',
    };
}
function validateEventOrThrow(event) {
    if (!(0, base_event_1.validateEvent)(event)) {
        throw new Error(`Invalid event: ${JSON.stringify(event)}`);
    }
}
function createPlatformEvent(eventType, payload, options) {
    return (0, base_event_1.createEvent)(eventType, options.eventVersion || '1.0.0', payload, {
        aggregateId: options.aggregateId,
        metadata: {
            sourceService: options.sourceService,
            correlationId: options.correlationId,
            userId: options.userId,
            ...options.metadata,
        },
    });
}
//# sourceMappingURL=index.js.map