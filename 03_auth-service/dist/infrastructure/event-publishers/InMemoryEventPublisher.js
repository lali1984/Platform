"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryEventPublisher = void 0;
class InMemoryEventPublisher {
    constructor() {
        this.events = [];
    }
    publish(event) {
        this.events.push(event);
        return Promise.resolve(true);
    }
    publishSync(event) {
        this.events.push(event);
        return Promise.resolve();
    }
    isAvailable() {
        return true;
    }
    shutdown() {
        return Promise.resolve();
    }
    getPublishedEvents() {
        return [...this.events];
    }
}
exports.InMemoryEventPublisher = InMemoryEventPublisher;
//# sourceMappingURL=InMemoryEventPublisher.js.map