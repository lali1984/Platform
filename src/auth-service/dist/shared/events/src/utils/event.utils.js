"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBaseEvent = createBaseEvent;
exports.validateEvent = validateEvent;
exports.generateCorrelationId = generateCorrelationId;
const events_1 = require("../types/events");
function createBaseEvent(type, source, correlationId) {
    return {
        type,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        source,
        correlationId,
    };
}
function validateEvent(event) {
    if (!event || typeof event !== 'object')
        return false;
    if (!event.type || !event.timestamp || !event.version || !event.source)
        return false;
    if (!Object.values(events_1.EventType).includes(event.type))
        return false;
    // Проверяем timestamp
    const date = new Date(event.timestamp);
    if (isNaN(date.getTime()))
        return false;
    // Проверяем version формат (semver)
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(event.version))
        return false;
    return true;
}
function generateCorrelationId() {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
//# sourceMappingURL=event.utils.js.map