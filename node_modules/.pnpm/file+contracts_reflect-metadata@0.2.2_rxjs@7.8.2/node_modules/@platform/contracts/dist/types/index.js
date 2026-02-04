"use strict";
// Главный файл экспорта общих типов
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
exports.ErrorMessages = exports.ErrorCodes = exports.TypeUtils = void 0;
/**
 * Утилиты для работы с типами
 */
class TypeUtils {
    /**
     * Создает параметры пагинации
     */
    static createPagination(page = 1, pageSize = 20, sortBy, sortOrder = 'desc') {
        return {
            page: Math.max(1, page),
            pageSize: Math.max(1, Math.min(100, pageSize)),
            sortBy,
            sortOrder,
        };
    }
    /**
     * Создает пагинированный ответ
     */
    static createPaginatedResponse(data, total, pagination) {
        const page = pagination.page || 1;
        const pageSize = pagination.pageSize || 20;
        const totalPages = Math.ceil(total / pageSize);
        return {
            data,
            pagination: {
                total,
                page,
                pageSize,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
            },
        };
    }
    /**
     * Type guard для проверки типа
     */
    static isType(value, check) {
        return check(value);
    }
    /**
     * Проверяет, является ли значение объектом
     */
    static isObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }
    /**
     * Проверяет, является ли значение массивом
     */
    static isArray(value) {
        return Array.isArray(value);
    }
    /**
     * Проверяет, является ли значение строкой
     */
    static isString(value) {
        return typeof value === 'string';
    }
    /**
     * Проверяет, является ли значение числом
     */
    static isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    }
    /**
     * Проверяет, является ли значение булевым
     */
    static isBoolean(value) {
        return typeof value === 'boolean';
    }
    /**
     * Проверяет, является ли значение датой
     */
    static isDate(value) {
        return value instanceof Date && !isNaN(value.getTime());
    }
    /**
     * Преобразует значение в строку
     */
    static toString(value) {
        if (this.isString(value))
            return value;
        if (this.isNumber(value) || this.isBoolean(value))
            return String(value);
        if (this.isDate(value))
            return value.toISOString();
        if (this.isObject(value) || this.isArray(value))
            return JSON.stringify(value);
        return '';
    }
    /**
     * Преобразует значение в число
     */
    static toNumber(value) {
        if (this.isNumber(value))
            return value;
        if (this.isString(value)) {
            const num = Number(value);
            return !isNaN(num) ? num : null;
        }
        return null;
    }
    /**
     * Преобразует значение в булево
     */
    static toBoolean(value) {
        if (this.isBoolean(value))
            return value;
        if (this.isString(value)) {
            const lower = value.toLowerCase();
            return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on';
        }
        if (this.isNumber(value))
            return value !== 0;
        return Boolean(value);
    }
    /**
     * Преобразует значение в дату
     */
    static toDate(value) {
        if (this.isDate(value))
            return value;
        if (this.isString(value)) {
            const date = new Date(value);
            return !isNaN(date.getTime()) ? date : null;
        }
        if (this.isNumber(value)) {
            const date = new Date(value);
            return !isNaN(date.getTime()) ? date : null;
        }
        return null;
    }
    /**
     * Клонирует объект
     */
    static clone(obj) {
        if (obj === null || typeof obj !== 'object')
            return obj;
        if (this.isArray(obj))
            return obj.map(item => this.clone(item));
        if (this.isObject(obj)) {
            const cloned = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    cloned[key] = this.clone(obj[key]);
                }
            }
            return cloned;
        }
        return obj;
    }
    /**
     * Сравнивает два значения
     */
    static equals(a, b) {
        if (a === b)
            return true;
        if (this.isDate(a) && this.isDate(b))
            return a.getTime() === b.getTime();
        if (this.isArray(a) && this.isArray(b)) {
            if (a.length !== b.length)
                return false;
            return a.every((item, index) => this.equals(item, b[index]));
        }
        if (this.isObject(a) && this.isObject(b)) {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            if (keysA.length !== keysB.length)
                return false;
            return keysA.every(key => this.equals(a[key], b[key]));
        }
        return false;
    }
}
exports.TypeUtils = TypeUtils;
// types/src/index.ts
// Основные типы
__exportStar(require("./primitives"), exports);
__exportStar(require("./errors"), exports);
__exportStar(require("./enums"), exports);
var errors_1 = require("./errors");
Object.defineProperty(exports, "ErrorCodes", { enumerable: true, get: function () { return errors_1.ErrorCodes; } });
Object.defineProperty(exports, "ErrorMessages", { enumerable: true, get: function () { return errors_1.ErrorMessages; } });
//# sourceMappingURL=index.js.map