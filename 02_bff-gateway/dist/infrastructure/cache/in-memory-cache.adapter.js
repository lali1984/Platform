"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCacheAdapter = void 0;
const bff_config_1 = require("../config/bff.config");
class InMemoryCacheAdapter {
    constructor() {
        this.store = new Map();
        this.cleanupInterval = null;
        this.defaultTTL = bff_config_1.bffConfig.cache.ttl * 1000; // Convert to milliseconds
        this.startCleanupInterval();
    }
    async get(key) {
        const entry = this.store.get(key);
        if (!entry) {
            return null;
        }
        // Check if entry has expired
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key, value, ttl) {
        const expiresAt = Date.now() + (ttl || this.defaultTTL);
        this.store.set(key, { value, expiresAt });
    }
    async delete(key) {
        this.store.delete(key);
    }
    async deleteByPattern(pattern) {
        const keysToDelete = [];
        for (const key of this.store.keys()) {
            if (key.includes(pattern)) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this.store.delete(key);
        }
    }
    // ✅ ДОБАВЛЕН: Health check метод (требуется интерфейсом)
    async healthCheck() {
        try {
            // In-memory кэш всегда "работает", пока приложение живо
            return true;
        }
        catch (error) {
            console.error('InMemoryCacheAdapter health check failed:', error);
            return false;
        }
    }
    // ✅ ДОБАВЛЕН: Disconnect метод для graceful shutdown
    async disconnect() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.store.clear();
        console.log('InMemoryCacheAdapter disconnected gracefully');
    }
    // ✅ ДОБАВЛЕН: Существующие методы (если используются где-то в коде)
    async exists(key) {
        const entry = this.store.get(key);
        if (!entry)
            return false;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return false;
        }
        return true;
    }
    async clear() {
        this.store.clear();
    }
    // ✅ ОБНОВЛЕН: Автоматическая очистка устаревших записей
    startCleanupInterval() {
        // Запускаем очистку каждые 5 минут
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpired();
        }, 5 * 60 * 1000); // 5 минут
    }
    cleanupExpired() {
        const now = Date.now();
        let expiredCount = 0;
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.expiresAt) {
                this.store.delete(key);
                expiredCount++;
            }
        }
        // Логируем только если есть что очищать
        if (expiredCount > 0 && bff_config_1.bffConfig.cache.debug) {
            console.log(`[InMemoryCache] Cleaned up ${expiredCount} expired entries`);
        }
    }
    // ✅ ДОБАВЛЕН: Получение статистики (для мониторинга)
    async getStats() {
        const stats = {
            totalEntries: this.store.size,
            memoryUsage: this.calculateMemoryUsage(),
        };
        if (bff_config_1.bffConfig.cache.debug) {
            console.log('[InMemoryCache Stats]', stats);
        }
        return stats;
    }
    calculateMemoryUsage() {
        // Упрощенная оценка использования памяти
        // ~200 байт на запись (ключ + значение + метаданные)
        const approxSize = this.store.size * 200;
        if (approxSize < 1024)
            return `${approxSize} B`;
        if (approxSize < 1024 * 1024)
            return `${(approxSize / 1024).toFixed(2)} KB`;
        return `${(approxSize / (1024 * 1024)).toFixed(2)} MB`;
    }
    // ✅ ДОБАВЛЕН: Проверка конфигурации для production
    validateForProduction() {
        const maxEntries = bff_config_1.bffConfig.cache.maxEntries || 10000;
        if (this.store.size > maxEntries * 0.8) { // 80% от максимума
            console.warn(`⚠️ InMemoryCache approaching limit: ${this.store.size}/${maxEntries} entries`);
        }
        if (process.env.NODE_ENV === 'production') {
            console.warn('🚨 WARNING: Using InMemoryCacheAdapter in production!', 'This is not recommended for production use.', 'Please configure REDIS_URL environment variable.');
        }
    }
}
exports.InMemoryCacheAdapter = InMemoryCacheAdapter;
