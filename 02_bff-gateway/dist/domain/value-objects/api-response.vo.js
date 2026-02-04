"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedResponse = exports.ApiResponse = void 0;
class ApiResponse {
    constructor(success, data, message, // Изменил с error на message для универсальности
    error, timestamp = new Date()) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.error = error;
        this.timestamp = timestamp;
    }
    static success(data, message) {
        return new ApiResponse(true, data, message, undefined);
    }
    static error(error, data) {
        return new ApiResponse(false, data, undefined, error);
    }
    toJSON() {
        return {
            success: this.success,
            data: this.data,
            message: this.message,
            error: this.error,
            timestamp: this.timestamp.toISOString(),
        };
    }
}
exports.ApiResponse = ApiResponse;
class PaginatedResponse {
    constructor(items, total, page, limit, hasMore) {
        this.items = items;
        this.total = total;
        this.page = page;
        this.limit = limit;
        this.hasMore = hasMore;
    }
    static create(items, total, page, limit) {
        return new PaginatedResponse(items, total, page, limit, page * limit < total);
    }
}
exports.PaginatedResponse = PaginatedResponse;
