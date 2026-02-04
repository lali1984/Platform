"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EventValidator_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventValidator = void 0;
const common_1 = require("@nestjs/common");
let EventValidator = EventValidator_1 = class EventValidator {
    constructor() {
        this.logger = new common_1.Logger(EventValidator_1.name);
        this.uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    }
    validateUserRegisteredEvent(event, options = {}) {
        const errors = [];
        const warnings = [];
        const defaultOptions = Object.assign({ requireEventId: true, requireTimestamp: true, requireSource: true, requireCorrelationId: false, validateUUIDs: true, validateDates: true }, options);
        if (!event || typeof event !== 'object') {
            errors.push('Event must be an object');
            return { isValid: false, errors, warnings };
        }
        if (defaultOptions.requireEventId && !event.eventId) {
            errors.push('Missing eventId');
        }
        if (defaultOptions.requireTimestamp && !event.timestamp) {
            errors.push('Missing timestamp');
        }
        else if (defaultOptions.validateDates && event.timestamp) {
            if (!this.isValidISODate(event.timestamp)) {
                errors.push(`Invalid timestamp format: ${event.timestamp}. Must be ISO 8601`);
            }
        }
        if (defaultOptions.requireSource && !event.source) {
            warnings.push('Missing source (will use default)');
        }
        if (defaultOptions.requireCorrelationId && !event.correlationId) {
            warnings.push('Missing correlationId (not required but recommended)');
        }
        if (!event.data || typeof event.data !== 'object') {
            errors.push('Missing or invalid data object');
            return { isValid: false, errors, warnings };
        }
        const data = event.data;
        if (!data.userId) {
            errors.push('Missing userId in data');
        }
        else if (defaultOptions.validateUUIDs && !this.isValidUUID(data.userId)) {
            errors.push(`Invalid userId format (must be UUID): ${data.userId}`);
        }
        if (!data.email) {
            errors.push('Missing email in data');
        }
        else if (!this.isValidEmail(data.email)) {
            errors.push(`Invalid email format: ${data.email}`);
        }
        if (!data.registeredAt) {
            errors.push('Missing registeredAt in data');
        }
        else if (defaultOptions.validateDates && !this.isValidISODate(data.registeredAt)) {
            errors.push(`Invalid registeredAt format: ${data.registeredAt}. Must be ISO 8601`);
        }
        if (data.name) {
            if (typeof data.name !== 'string') {
                errors.push('name must be a string');
            }
            else if (data.name.trim().length === 0) {
                warnings.push('name is empty string');
            }
        }
        else {
            warnings.push('Missing name (will use email as fallback)');
        }
        if (event.metadata && typeof event.metadata !== 'object') {
            errors.push('metadata must be an object if provided');
        }
        if (event.eventId && event.eventId.length > 100) {
            warnings.push('eventId is unusually long (>100 chars)');
        }
        if (data.email && data.email.length > 255) {
            warnings.push('email is unusually long (>255 chars)');
        }
        if (event.version) {
            const versionRegex = /^\d+\.\d+\.\d+$/;
            if (!versionRegex.test(event.version)) {
                warnings.push(`Event version format should be semantic (e.g., 1.0.0): ${event.version}`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings: warnings.length > 0 ? warnings : undefined,
        };
    }
    validateUserCreatedEvent(event) {
        const errors = [];
        const warnings = [];
        if (!event || typeof event !== 'object') {
            errors.push('Event must be an object');
            return { isValid: false, errors, warnings };
        }
        if (!event.eventId)
            errors.push('Missing eventId');
        if (!event.type)
            errors.push('Missing type');
        if (!event.version)
            errors.push('Missing version');
        if (!event.timestamp)
            errors.push('Missing timestamp');
        if (!event.data)
            errors.push('Missing data');
        if (event.data && typeof event.data === 'object') {
            if (!event.data.userId)
                errors.push('Missing userId in data');
            if (!event.data.email)
                errors.push('Missing email in data');
            if (event.data.userId && !this.isValidUUID(event.data.userId)) {
                errors.push(`Invalid userId format: ${event.data.userId}`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings: warnings.length > 0 ? warnings : undefined,
        };
    }
    isValidUUID(value) {
        return this.uuidRegex.test(value);
    }
    isValidEmail(value) {
        return this.emailRegex.test(value);
    }
    isValidISODate(value) {
        if (!this.isoDateRegex.test(value))
            return false;
        try {
            const date = new Date(value);
            return !isNaN(date.getTime()) && date.toISOString() === value;
        }
        catch (_a) {
            return false;
        }
    }
    normalizeUserRegisteredEvent(event) {
        var _a, _b, _c;
        if (!event || typeof event !== 'object') {
            return null;
        }
        const normalized = Object.assign({}, event);
        if (normalized.timestamp && typeof normalized.timestamp === 'string') {
            try {
                const date = new Date(normalized.timestamp);
                if (!isNaN(date.getTime())) {
                    normalized.timestamp = date.toISOString();
                }
            }
            catch (_d) {
            }
        }
        if (((_a = normalized.data) === null || _a === void 0 ? void 0 : _a.registeredAt) && typeof normalized.data.registeredAt === 'string') {
            try {
                const date = new Date(normalized.data.registeredAt);
                if (!isNaN(date.getTime())) {
                    normalized.data.registeredAt = date.toISOString();
                }
            }
            catch (_e) {
            }
        }
        if (((_b = normalized.data) === null || _b === void 0 ? void 0 : _b.name) && typeof normalized.data.name === 'string') {
            normalized.data.name = normalized.data.name.trim();
        }
        if (((_c = normalized.data) === null || _c === void 0 ? void 0 : _c.email) && typeof normalized.data.email === 'string') {
            normalized.data.email = normalized.data.email.toLowerCase().trim();
        }
        if (!normalized.source) {
            normalized.source = 'auth-service';
        }
        if (!normalized.version) {
            normalized.version = '1.0.0';
        }
        return normalized;
    }
    createValidationReport(event, validationResult, context) {
        var _a, _b, _c;
        return {
            timestamp: new Date().toISOString(),
            eventType: context.eventType,
            eventId: (event === null || event === void 0 ? void 0 : event.eventId) || 'unknown',
            source: (event === null || event === void 0 ? void 0 : event.source) || context.source || 'unknown',
            validation: {
                isValid: validationResult.isValid,
                errorCount: validationResult.errors.length,
                warningCount: ((_a = validationResult.warnings) === null || _a === void 0 ? void 0 : _a.length) || 0,
                errors: validationResult.errors,
                warnings: validationResult.warnings,
            },
            eventSummary: {
                userId: (_b = event === null || event === void 0 ? void 0 : event.data) === null || _b === void 0 ? void 0 : _b.userId,
                email: ((_c = event === null || event === void 0 ? void 0 : event.data) === null || _c === void 0 ? void 0 : _c.email) ? `${event.data.email.substring(0, 3)}...@...` : 'unknown',
                hasMetadata: !!(event === null || event === void 0 ? void 0 : event.metadata),
            },
        };
    }
};
exports.EventValidator = EventValidator;
exports.EventValidator = EventValidator = EventValidator_1 = __decorate([
    (0, common_1.Injectable)()
], EventValidator);
//# sourceMappingURL=event.validator.js.map