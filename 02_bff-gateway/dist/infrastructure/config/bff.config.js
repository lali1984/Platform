"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bffConfig = void 0;
// /02_bff-gateway/src/infrastructure/config/bff.config.ts
const environment_1 = require("./environment");
exports.bffConfig = {
    services: {
        auth: {
            name: 'auth-service',
            url: environment_1.environment.AUTH_SERVICE_URL,
            timeout: 5000, // 5 seconds
            retries: 3,
        },
        user: {
            name: 'user-service',
            url: environment_1.environment.USER_SERVICE_URL,
            timeout: 5000,
            retries: 3,
        },
    },
    cache: {
        enabled: !!environment_1.environment.REDIS_URL,
        ttl: environment_1.environment.CACHE_TTL || 300, // дефолтное значение 5 минут
        prefix: 'bff:',
        debug: environment_1.environment.NODE_ENV === 'development', // ← ДОБАВЛЕНО
        maxEntries: 10000, // ← ДОБАВЛЕНО
    },
    security: {
        jwtSecret: environment_1.environment.JWT_SECRET || 'fallback-secret-change-in-production',
        tokenExpiry: '1h',
    },
    server: {
        port: environment_1.environment.PORT || 3000,
        requestTimeout: 10000, // 10 seconds
        maxPayloadSize: '10mb',
    },
};
exports.default = exports.bffConfig;
