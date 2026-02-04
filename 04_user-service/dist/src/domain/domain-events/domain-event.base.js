"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvent = void 0;
class DomainEvent {
    constructor(eventName, aggregateId, occurredAt = new Date(), eventId = require('uuid').v4()) {
        this.eventName = eventName;
        this.aggregateId = aggregateId;
        this.occurredAt = occurredAt;
        this.eventId = eventId;
    }
}
exports.DomainEvent = DomainEvent;
//# sourceMappingURL=domain-event.base.js.map