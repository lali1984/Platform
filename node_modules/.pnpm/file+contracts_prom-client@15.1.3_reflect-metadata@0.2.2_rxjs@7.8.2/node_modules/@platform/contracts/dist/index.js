"use strict";
// contracts/src/index.ts
// Главный файл экспорта всего пакета @platform/contracts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contracts = exports.ServiceName = exports.UserStatus = exports.PrivacyLevel = exports.NotificationChannel = exports.UserRole = exports.ErrorMessages = exports.ErrorCodes = exports.isPhoneNumber = exports.isValidPhoneNumber = exports.createPhoneNumber = exports.isNonEmptyStringValue = exports.isNonEmptyString = exports.createNonEmptyString = exports.isMoney = exports.isValidMoney = exports.createMoney = exports.isUserId = exports.unsafeCreateUserId = exports.isISO8601Date = exports.isValidISO8601Date = exports.parseISO8601Date = exports.toISO8601Date = exports.isEmail = exports.isValidEmail = exports.createEmail = exports.createPlatformEvent = exports.validateEventOrThrow = exports.getEventHeaders = exports.getEventTopic = exports.getEventVersion = exports.getEventType = exports.isUserCreatedEvent = exports.createUserCreatedEvent = exports.createUserRegisteredEvent = exports.isEventType = exports.validateEvent = exports.createEvent = exports.PlatformEvent = exports.ApiUtils = exports.isErrorResponse = exports.isSuccessResponse = exports.createApiError = exports.createErrorResponse = exports.createSuccessResponse = exports.METRICS_CONSTANTS = exports.BaseMetricsService = void 0;
var BaseMetricsService_1 = require("./metrics/BaseMetricsService");
Object.defineProperty(exports, "BaseMetricsService", { enumerable: true, get: function () { return BaseMetricsService_1.BaseMetricsService; } });
var constants_1 = require("./metrics/constants");
Object.defineProperty(exports, "METRICS_CONSTANTS", { enumerable: true, get: function () { return constants_1.METRICS_CONSTANTS; } });
// ★★★ ЭКСПОРТ ЗНАЧЕНИЙ ★★★
__exportStar(require("./infrastructure/kafka"), exports);
__exportStar(require("./metrics"), exports);
__exportStar(require("./auth/user-auth-data"), exports);
__exportStar(require("./auth/token-validation-result"), exports);
__exportStar(require("./auth/auth-response"), exports);
// API экспорт
var index_1 = require("./api/index");
Object.defineProperty(exports, "createSuccessResponse", { enumerable: true, get: function () { return index_1.createSuccessResponse; } });
Object.defineProperty(exports, "createErrorResponse", { enumerable: true, get: function () { return index_1.createErrorResponse; } });
Object.defineProperty(exports, "createApiError", { enumerable: true, get: function () { return index_1.createApiError; } });
Object.defineProperty(exports, "isSuccessResponse", { enumerable: true, get: function () { return index_1.isSuccessResponse; } });
Object.defineProperty(exports, "isErrorResponse", { enumerable: true, get: function () { return index_1.isErrorResponse; } });
Object.defineProperty(exports, "ApiUtils", { enumerable: true, get: function () { return index_1.ApiUtils; } });
// Events экспорт
var events_1 = require("./events");
Object.defineProperty(exports, "PlatformEvent", { enumerable: true, get: function () { return events_1.PlatformEvent; } });
Object.defineProperty(exports, "createEvent", { enumerable: true, get: function () { return events_1.createEvent; } });
Object.defineProperty(exports, "validateEvent", { enumerable: true, get: function () { return events_1.validateEvent; } });
Object.defineProperty(exports, "isEventType", { enumerable: true, get: function () { return events_1.isEventType; } });
Object.defineProperty(exports, "createUserRegisteredEvent", { enumerable: true, get: function () { return events_1.createUserRegisteredEvent; } });
Object.defineProperty(exports, "createUserCreatedEvent", { enumerable: true, get: function () { return events_1.createUserCreatedEvent; } });
Object.defineProperty(exports, "isUserCreatedEvent", { enumerable: true, get: function () { return events_1.isUserCreatedEvent; } });
Object.defineProperty(exports, "getEventType", { enumerable: true, get: function () { return events_1.getEventType; } });
Object.defineProperty(exports, "getEventVersion", { enumerable: true, get: function () { return events_1.getEventVersion; } });
Object.defineProperty(exports, "getEventTopic", { enumerable: true, get: function () { return events_1.getEventTopic; } });
Object.defineProperty(exports, "getEventHeaders", { enumerable: true, get: function () { return events_1.getEventHeaders; } });
Object.defineProperty(exports, "validateEventOrThrow", { enumerable: true, get: function () { return events_1.validateEventOrThrow; } });
Object.defineProperty(exports, "createPlatformEvent", { enumerable: true, get: function () { return events_1.createPlatformEvent; } });
// Примитивы
var primitives_1 = require("./types/primitives");
Object.defineProperty(exports, "createEmail", { enumerable: true, get: function () { return primitives_1.createEmail; } });
Object.defineProperty(exports, "isValidEmail", { enumerable: true, get: function () { return primitives_1.isValidEmail; } });
Object.defineProperty(exports, "isEmail", { enumerable: true, get: function () { return primitives_1.isEmail; } });
Object.defineProperty(exports, "toISO8601Date", { enumerable: true, get: function () { return primitives_1.toISO8601Date; } });
Object.defineProperty(exports, "parseISO8601Date", { enumerable: true, get: function () { return primitives_1.parseISO8601Date; } });
Object.defineProperty(exports, "isValidISO8601Date", { enumerable: true, get: function () { return primitives_1.isValidISO8601Date; } });
Object.defineProperty(exports, "isISO8601Date", { enumerable: true, get: function () { return primitives_1.isISO8601Date; } });
Object.defineProperty(exports, "unsafeCreateUserId", { enumerable: true, get: function () { return primitives_1.unsafeCreateUserId; } });
Object.defineProperty(exports, "isUserId", { enumerable: true, get: function () { return primitives_1.isUserId; } });
Object.defineProperty(exports, "createMoney", { enumerable: true, get: function () { return primitives_1.createMoney; } });
Object.defineProperty(exports, "isValidMoney", { enumerable: true, get: function () { return primitives_1.isValidMoney; } });
Object.defineProperty(exports, "isMoney", { enumerable: true, get: function () { return primitives_1.isMoney; } });
Object.defineProperty(exports, "createNonEmptyString", { enumerable: true, get: function () { return primitives_1.createNonEmptyString; } });
Object.defineProperty(exports, "isNonEmptyString", { enumerable: true, get: function () { return primitives_1.isNonEmptyString; } });
Object.defineProperty(exports, "isNonEmptyStringValue", { enumerable: true, get: function () { return primitives_1.isNonEmptyStringValue; } });
Object.defineProperty(exports, "createPhoneNumber", { enumerable: true, get: function () { return primitives_1.createPhoneNumber; } });
Object.defineProperty(exports, "isValidPhoneNumber", { enumerable: true, get: function () { return primitives_1.isValidPhoneNumber; } });
Object.defineProperty(exports, "isPhoneNumber", { enumerable: true, get: function () { return primitives_1.isPhoneNumber; } });
// Enums из errors
var errors_1 = require("./types/errors");
Object.defineProperty(exports, "ErrorCodes", { enumerable: true, get: function () { return errors_1.ErrorCodes; } });
Object.defineProperty(exports, "ErrorMessages", { enumerable: true, get: function () { return errors_1.ErrorMessages; } });
// Enums из enums
var enums_1 = require("./types/enums");
Object.defineProperty(exports, "UserRole", { enumerable: true, get: function () { return enums_1.UserRole; } });
Object.defineProperty(exports, "NotificationChannel", { enumerable: true, get: function () { return enums_1.NotificationChannel; } });
Object.defineProperty(exports, "PrivacyLevel", { enumerable: true, get: function () { return enums_1.PrivacyLevel; } });
Object.defineProperty(exports, "UserStatus", { enumerable: true, get: function () { return enums_1.UserStatus; } });
Object.defineProperty(exports, "ServiceName", { enumerable: true, get: function () { return enums_1.ServiceName; } });
// Contracts класс
class Contracts {
    static isValidApiResponse(obj) {
        return (typeof obj === 'object' &&
            obj !== null &&
            typeof obj.success === 'boolean' &&
            (obj.success ? 'data' in obj : 'error' in obj));
    }
    static isValidEvent(obj) {
        return (typeof obj === 'object' &&
            obj !== null &&
            typeof obj.eventId === 'string' &&
            typeof obj.eventType === 'string' &&
            typeof obj.eventVersion === 'string' &&
            typeof obj.timestamp === 'string');
    }
    static createServiceHeaders(options) {
        const headers = {
            'x-service-name': options.serviceName,
            'x-request-id': options.correlationId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            'x-timestamp': new Date().toISOString(),
        };
        if (options.userId) {
            headers['x-user-id'] = options.userId;
        }
        if (options.correlationId) {
            headers['x-correlation-id'] = options.correlationId;
        }
        return headers;
    }
    static parseServiceHeaders(headers) {
        return {
            correlationId: headers['x-correlation-id'] || headers['x-request-id'],
            userId: headers['x-user-id'],
            serviceName: headers['x-service-name'],
        };
    }
}
exports.Contracts = Contracts;
Contracts.VERSION = '1.0.0';
// Экспорт по умолчанию
exports.default = {
    Contracts,
};
//# sourceMappingURL=index.js.map