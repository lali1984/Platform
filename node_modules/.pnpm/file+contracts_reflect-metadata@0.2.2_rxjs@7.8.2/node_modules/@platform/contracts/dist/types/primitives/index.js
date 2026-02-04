"use strict";
/**
 * Доменные примитивы платформы.
 * Все типы — branded, обеспечивают типобезопасность и валидацию.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidMoney = exports.formatMoney = exports.isMoney = exports.createMoney = exports.isNonEmptyString = exports.isNonEmptyStringValue = exports.createNonEmptyString = exports.isValidISO8601Date = exports.isISO8601Date = exports.parseISO8601Date = exports.toISO8601Date = exports.normalizePhoneNumber = exports.isValidPhoneNumber = exports.isPhoneNumber = exports.createPhoneNumber = exports.isValidEmail = exports.isEmail = exports.createEmail = exports.unsafeCreateUserId = exports.isUserId = void 0;
// Значения (функции)
var UserId_1 = require("./UserId");
Object.defineProperty(exports, "isUserId", { enumerable: true, get: function () { return UserId_1.isUserId; } });
Object.defineProperty(exports, "unsafeCreateUserId", { enumerable: true, get: function () { return UserId_1.unsafeCreateUserId; } });
// Значения
var Email_1 = require("./Email");
Object.defineProperty(exports, "createEmail", { enumerable: true, get: function () { return Email_1.createEmail; } });
Object.defineProperty(exports, "isEmail", { enumerable: true, get: function () { return Email_1.isEmail; } });
Object.defineProperty(exports, "isValidEmail", { enumerable: true, get: function () { return Email_1.isValidEmail; } });
// Значения
var PhoneNumber_1 = require("./PhoneNumber");
Object.defineProperty(exports, "createPhoneNumber", { enumerable: true, get: function () { return PhoneNumber_1.createPhoneNumber; } });
Object.defineProperty(exports, "isPhoneNumber", { enumerable: true, get: function () { return PhoneNumber_1.isPhoneNumber; } });
Object.defineProperty(exports, "isValidPhoneNumber", { enumerable: true, get: function () { return PhoneNumber_1.isValidPhoneNumber; } });
Object.defineProperty(exports, "normalizePhoneNumber", { enumerable: true, get: function () { return PhoneNumber_1.normalizePhoneNumber; } });
// Значения
var ISO8601Date_1 = require("./ISO8601Date");
Object.defineProperty(exports, "toISO8601Date", { enumerable: true, get: function () { return ISO8601Date_1.toISO8601Date; } });
Object.defineProperty(exports, "parseISO8601Date", { enumerable: true, get: function () { return ISO8601Date_1.parseISO8601Date; } });
Object.defineProperty(exports, "isISO8601Date", { enumerable: true, get: function () { return ISO8601Date_1.isISO8601Date; } });
Object.defineProperty(exports, "isValidISO8601Date", { enumerable: true, get: function () { return ISO8601Date_1.isValidISO8601Date; } });
// Значения
var NonEmptyString_1 = require("./NonEmptyString");
Object.defineProperty(exports, "createNonEmptyString", { enumerable: true, get: function () { return NonEmptyString_1.createNonEmptyString; } });
Object.defineProperty(exports, "isNonEmptyStringValue", { enumerable: true, get: function () { return NonEmptyString_1.isNonEmptyStringValue; } });
Object.defineProperty(exports, "isNonEmptyString", { enumerable: true, get: function () { return NonEmptyString_1.isNonEmptyString; } });
// Значения
var Money_1 = require("./Money");
Object.defineProperty(exports, "createMoney", { enumerable: true, get: function () { return Money_1.createMoney; } });
Object.defineProperty(exports, "isMoney", { enumerable: true, get: function () { return Money_1.isMoney; } });
Object.defineProperty(exports, "formatMoney", { enumerable: true, get: function () { return Money_1.formatMoney; } });
Object.defineProperty(exports, "isValidMoney", { enumerable: true, get: function () { return Money_1.isValidMoney; } });
//# sourceMappingURL=index.js.map