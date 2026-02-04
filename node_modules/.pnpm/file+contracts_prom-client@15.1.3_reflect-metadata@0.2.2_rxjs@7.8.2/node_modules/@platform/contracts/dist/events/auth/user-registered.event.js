"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRegisteredPlatformEvent = void 0;
exports.createUserRegisteredEvent = createUserRegisteredEvent;
const base_event_1 = require("../base/base-event");
/**
 * Класс события регистрации пользователя
 */
class UserRegisteredPlatformEvent extends base_event_1.PlatformEvent {
    constructor(payload, options = {}) {
        super('UserRegistered', '1.0.0', payload, {
            aggregateId: payload.userId,
            ...options,
        });
    }
    /**
     * Создает событие регистрации пользователя
     */
    static create(userId, email, name, metadata) {
        return new UserRegisteredPlatformEvent({
            userId,
            email,
            name,
            registeredAt: new Date().toISOString(),
            metadata,
        });
    }
    /**
     * Type guard для события регистрации пользователя
     */
    static isUserRegisteredEvent(event) {
        return event.eventType === 'UserRegistered';
    }
}
exports.UserRegisteredPlatformEvent = UserRegisteredPlatformEvent;
/**
 * Утилита для создания события регистрации пользователя
 */
function createUserRegisteredEvent(userId, email, name, options = {}) {
    return {
        eventId: options.eventId || crypto.randomUUID(),
        eventType: 'UserRegistered',
        eventVersion: '1.0.0',
        timestamp: options.timestamp || new Date().toISOString(),
        aggregateId: userId,
        payload: {
            userId,
            email,
            name,
            registeredAt: new Date().toISOString(),
        },
        metadata: options.metadata,
    };
}
//# sourceMappingURL=user-registered.event.js.map