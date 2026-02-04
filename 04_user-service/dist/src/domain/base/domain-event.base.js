"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventUtils = exports.UserDomainEvent = exports.DomainEvent = void 0;
class DomainEvent {
    constructor(eventName, aggregateId, occurredAt, metadata) {
        this.eventId = this.generateEventId();
        this.eventName = eventName;
        this.aggregateId = aggregateId;
        this.occurredAt = occurredAt || new Date();
        this.metadata = metadata;
    }
    generateEventId() {
        return require('uuid').v4();
    }
    toJSON() {
        return JSON.stringify(this.toPrimitives());
    }
    getEventType() {
        return this.eventName;
    }
    getEventVersion() {
        return '1.0.0';
    }
    withMetadata(metadata) {
        const Constructor = this.constructor;
        return new Constructor(this.eventName, this.aggregateId, this.occurredAt, Object.assign(Object.assign({}, this.metadata), metadata));
    }
    isEventType(eventType) {
        return this.eventName === eventType;
    }
    equals(event) {
        if (!event) {
            return false;
        }
        return this.eventId === event.eventId;
    }
    getAge() {
        return Date.now() - this.occurredAt.getTime();
    }
    isFresh(minutes = 5) {
        return this.getAge() < minutes * 60 * 1000;
    }
}
exports.DomainEvent = DomainEvent;
class UserDomainEvent extends DomainEvent {
    constructor(eventName, aggregateId, userId, occurredAt, metadata) {
        super(eventName, aggregateId, occurredAt, metadata);
        this.userId = userId;
    }
    toPrimitives() {
        return {
            eventId: this.eventId,
            eventName: this.eventName,
            aggregateId: this.aggregateId,
            userId: this.userId,
            occurredAt: this.occurredAt.toISOString(),
            metadata: this.metadata,
        };
    }
}
exports.UserDomainEvent = UserDomainEvent;
class EventUtils {
    static isValidEvent(event) {
        return (event &&
            typeof event === 'object' &&
            typeof event.eventId === 'string' &&
            typeof event.eventName === 'string' &&
            typeof event.aggregateId === 'string' &&
            event.occurredAt instanceof Date &&
            typeof event.toPrimitives === 'function');
    }
    static fromPrimitives(primitives, EventClass) {
        const event = new EventClass(primitives.eventName, primitives.aggregateId, new Date(primitives.occurredAt), primitives.metadata);
        Object.assign(event, Object.assign({ eventId: primitives.eventId }, primitives));
        return event;
    }
    static groupByType(events) {
        return events.reduce((groups, event) => {
            const type = event.eventName;
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(event);
            return groups;
        }, {});
    }
    static filterByType(events, eventType) {
        return events.filter(event => event.eventName === eventType);
    }
    static sortByOccurredAt(events, ascending = true) {
        return [...events].sort((a, b) => {
            const timeA = a.occurredAt.getTime();
            const timeB = b.occurredAt.getTime();
            return ascending ? timeA - timeB : timeB - timeA;
        });
    }
}
exports.EventUtils = EventUtils;
//# sourceMappingURL=domain-event.base.js.map