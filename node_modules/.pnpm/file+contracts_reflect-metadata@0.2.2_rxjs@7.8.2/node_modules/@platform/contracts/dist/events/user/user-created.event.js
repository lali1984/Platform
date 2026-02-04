"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCreatedPlatformEvent = void 0;
exports.createUserCreatedEvent = createUserCreatedEvent;
exports.isUserCreatedEvent = isUserCreatedEvent;
const base_event_1 = require("../base/base-event");
/**
 * Класс события создания пользователя
 */
class UserCreatedPlatformEvent extends base_event_1.PlatformEvent {
    constructor(payload, options = {}) {
        super('UserCreated', '1.0.0', payload, {
            aggregateId: payload.userId,
            ...options,
        });
    }
    /**
     * Создает событие создания пользователя
     */
    static create(userId, email, firstName, lastName, options = {}) {
        return new UserCreatedPlatformEvent({
            userId,
            email,
            firstName,
            lastName,
            phone: options.phone,
            avatarUrl: options.avatarUrl,
            status: options.status ?? 'ACTIVE',
            isVerified: options.isVerified ?? false,
            createdAt: new Date().toISOString(),
        });
    }
}
exports.UserCreatedPlatformEvent = UserCreatedPlatformEvent;
/**
 * Type guard для события создания пользователя
 */
function createUserCreatedEvent(userId, email, firstName, lastName, options = {}) {
    return {
        eventId: options.eventId || crypto.randomUUID(),
        eventType: 'UserCreated',
        eventVersion: '1.0.0',
        timestamp: options.timestamp || new Date().toISOString(),
        aggregateId: userId,
        payload: {
            userId,
            email,
            firstName,
            lastName,
            phone: options.phone,
            avatarUrl: options.avatarUrl,
            status: options.status ?? 'ACTIVE',
            isVerified: options.isVerified ?? false,
            createdAt: new Date().toISOString(),
        },
        metadata: options.metadata,
    };
}
/**
 * Type guard для события создания пользователя
 */
function isUserCreatedEvent(event) {
    return event.eventType === 'UserCreated';
}
//# sourceMappingURL=user-created.event.js.map