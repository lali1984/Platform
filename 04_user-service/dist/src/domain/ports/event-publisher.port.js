"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventUtils = exports.BasePlatformEvent = void 0;
class BasePlatformEvent {
    constructor(type, data, options = {}) {
        this.eventId = options.eventId || this.generateEventId();
        this.type = type;
        this.version = options.version || '1.0.0';
        this.timestamp = options.timestamp || new Date();
        this.data = data;
        this.correlationId = options.correlationId;
        this.source = options.source || 'user-service';
        this.metadata = options.metadata;
    }
    generateEventId() {
        return require('uuid').v4();
    }
    toJSON() {
        return JSON.stringify({
            eventId: this.eventId,
            type: this.type,
            version: this.version,
            timestamp: this.timestamp.toISOString(),
            data: this.data,
            correlationId: this.correlationId,
            source: this.source,
            metadata: this.metadata,
        });
    }
    getPartitionKey() {
        return this.eventId;
    }
    withData(newData) {
        const Constructor = this.constructor;
        return new Constructor(this.type, newData, {
            eventId: this.eventId,
            version: this.version,
            timestamp: this.timestamp,
            correlationId: this.correlationId,
            source: this.source,
            metadata: this.metadata,
        });
    }
    withMetadata(newMetadata) {
        const Constructor = this.constructor;
        return new Constructor(this.type, this.data, {
            eventId: this.eventId,
            version: this.version,
            timestamp: this.timestamp,
            correlationId: this.correlationId,
            source: this.source,
            metadata: Object.assign(Object.assign({}, this.metadata), newMetadata),
        });
    }
}
exports.BasePlatformEvent = BasePlatformEvent;
class EventUtils {
    static isPlatformEvent(event) {
        return (event &&
            typeof event === 'object' &&
            typeof event.eventId === 'string' &&
            typeof event.type === 'string' &&
            typeof event.version === 'string' &&
            event.timestamp instanceof Date &&
            typeof event.data === 'object' &&
            typeof event.source === 'string' &&
            typeof event.toJSON === 'function' &&
            typeof event.getPartitionKey === 'function');
    }
    static fromJSON(json) {
        const data = JSON.parse(json);
        const event = new (class extends BasePlatformEvent {
            constructor() {
                super(data.type, data.data, {
                    eventId: data.eventId,
                    version: data.version,
                    timestamp: new Date(data.timestamp),
                    correlationId: data.correlationId,
                    source: data.source,
                    metadata: data.metadata,
                });
            }
        })();
        return event;
    }
    static validate(event) {
        const errors = [];
        if (!event.eventId) {
            errors.push('eventId is required');
        }
        if (!event.type) {
            errors.push('type is required');
        }
        if (!event.version) {
            errors.push('version is required');
        }
        if (!event.timestamp) {
            errors.push('timestamp is required');
        }
        if (!event.data) {
            errors.push('data is required');
        }
        if (!event.source) {
            errors.push('source is required');
        }
        return errors;
    }
    static createUserEvent(type, userData, options = {}) {
        return new (class extends BasePlatformEvent {
            constructor() {
                super(type, userData, {
                    eventId: options.eventId,
                    version: '1.0.0',
                    timestamp: new Date(),
                    correlationId: options.correlationId,
                    source: 'user-service',
                    metadata: options.metadata,
                });
            }
            getPartitionKey() {
                return userData.userId || this.eventId;
            }
        })();
    }
}
exports.EventUtils = EventUtils;
//# sourceMappingURL=event-publisher.port.js.map