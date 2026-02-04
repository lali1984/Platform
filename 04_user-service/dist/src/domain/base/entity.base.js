"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvent = exports.ValueObject = exports.Entity = void 0;
class Entity {
    constructor(props) {
        this.props = Object.freeze(props);
    }
    equals(object) {
        if (object === null || object === undefined) {
            return false;
        }
        if (this === object) {
            return true;
        }
        if (!(object instanceof Entity)) {
            return false;
        }
        return this.getId() === object.getId();
    }
    getProps() {
        return Object.assign({}, this.props);
    }
    clone(newProps) {
        const Constructor = this.constructor;
        return new Constructor(Object.assign(Object.assign({}, this.props), newProps));
    }
}
exports.Entity = Entity;
class ValueObject {
    equals(vo) {
        if (vo === null || vo === undefined) {
            return false;
        }
        if (vo.constructor.name !== this.constructor.name) {
            return false;
        }
        return JSON.stringify(vo) === JSON.stringify(this);
    }
    toString() {
        return JSON.stringify(this);
    }
}
exports.ValueObject = ValueObject;
class DomainEvent {
    constructor(metadata = {}) {
        this.timestamp = new Date();
        this.metadata = metadata;
    }
    toJSON() {
        return JSON.stringify({
            eventType: this.getEventType(),
            eventVersion: this.getEventVersion(),
            timestamp: this.timestamp.toISOString(),
            metadata: this.metadata,
        });
    }
}
exports.DomainEvent = DomainEvent;
//# sourceMappingURL=entity.base.js.map