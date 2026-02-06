"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRegisteredEventDto = void 0;
class UserRegisteredEventDto {
    constructor(eventId, type, version, timestamp, data, source, correlationId, metadata) {
        this.eventId = eventId;
        this.type = type;
        this.version = version;
        this.timestamp = timestamp;
        this.data = data;
        this.source = source;
        this.correlationId = correlationId;
        this.metadata = metadata;
    }
    static fromContract(event) {
        var _a, _b;
        return new UserRegisteredEventDto(event.eventId, event.eventType, event.eventVersion, new Date(event.timestamp), event.payload, ((_a = event.metadata) === null || _a === void 0 ? void 0 : _a.sourceService) || 'auth-service', (_b = event.metadata) === null || _b === void 0 ? void 0 : _b.correlationId, event.metadata);
    }
}
exports.UserRegisteredEventDto = UserRegisteredEventDto;
//# sourceMappingURL=user-registered-event.js.map