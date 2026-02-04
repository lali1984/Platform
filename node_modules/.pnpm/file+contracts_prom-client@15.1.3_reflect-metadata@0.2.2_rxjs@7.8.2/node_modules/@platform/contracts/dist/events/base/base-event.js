"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformEvent = void 0;
exports.createEvent = createEvent;
exports.isEventType = isEventType;
exports.validateEvent = validateEvent;
const uuid_1 = require("uuid");
/**
 * Базовый класс для создания событий
 */
class PlatformEvent {
    constructor(eventType, eventVersion, payload, options = {}) {
        this.eventId = options.eventId || (0, uuid_1.v4)();
        this.eventType = eventType;
        this.eventVersion = eventVersion;
        this.timestamp = options.timestamp || new Date().toISOString();
        this.aggregateId = options.aggregateId;
        this.payload = payload;
        this.metadata = options.metadata;
    }
    /**
     * Проверяет, является ли объект валидным событием
     */
    static isValidEvent(event) {
        return (event &&
            typeof event === 'object' &&
            typeof event.eventId === 'string' &&
            typeof event.eventType === 'string' &&
            typeof event.eventVersion === 'string' &&
            typeof event.timestamp === 'string' &&
            typeof event.payload === 'object' &&
            event.payload !== null);
    }
    /**
     * Создает копию события с обновленными метаданными
     */
    withMetadata(metadata) {
        const Constructor = this.constructor;
        return new Constructor(this.eventType, this.eventVersion, this.payload, {
            eventId: this.eventId,
            timestamp: this.timestamp,
            aggregateId: this.aggregateId,
            metadata: { ...this.metadata, ...metadata },
        });
    }
    /**
     * Сериализует событие в JSON строку
     */
    toJSON() {
        return JSON.stringify({
            eventId: this.eventId,
            eventType: this.eventType,
            eventVersion: this.eventVersion,
            timestamp: this.timestamp,
            aggregateId: this.aggregateId,
            payload: this.payload,
            metadata: this.metadata,
        });
    }
    /**
     * Десериализует JSON строку в событие
     */
    static fromJSON(json) {
        const data = JSON.parse(json);
        if (!PlatformEvent.isValidEvent(data)) {
            throw new Error('Invalid event JSON');
        }
        return data;
    }
}
exports.PlatformEvent = PlatformEvent;
/**
 * Утилита для создания событий
 */
function createEvent(eventType, eventVersion, payload, options = {}) {
    return {
        eventId: options.eventId || (0, uuid_1.v4)(),
        eventType,
        eventVersion,
        timestamp: options.timestamp || new Date().toISOString(),
        aggregateId: options.aggregateId,
        payload,
        metadata: options.metadata,
    };
}
/**
 * Type guard для проверки типа события
 */
function isEventType(event, eventType) {
    return event.eventType === eventType;
}
/**
 * Валидатор событий
 */
function validateEvent(event) {
    return PlatformEvent.isValidEvent(event);
}
//# sourceMappingURL=base-event.js.map