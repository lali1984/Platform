"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateRoot = void 0;
const entity_1 = require("./entity");
class AggregateRoot extends entity_1.Entity {
    constructor() {
        super(...arguments);
        this.domainEvents = [];
    }
    getDomainEvents() {
        return [...this.domainEvents];
    }
    addDomainEvent(event) {
        this.domainEvents.push(event);
    }
    clearDomainEvents() {
        this.domainEvents = [];
    }
    get events() {
        return this.getDomainEvents();
    }
    addEvent(event) {
        this.addDomainEvent(event);
    }
    clearEvents() {
        this.clearDomainEvents();
    }
    applyEvent(event) {
        this.addDomainEvent(event);
    }
    validateInvariants() {
    }
    canPerformOperation(operation) {
        return true;
    }
    snapshot() {
    }
}
exports.AggregateRoot = AggregateRoot;
//# sourceMappingURL=aggregate-root1.js.map