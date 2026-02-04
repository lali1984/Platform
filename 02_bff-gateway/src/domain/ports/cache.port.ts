// /02_bff-gateway/src/domain/ports/cache.port.ts
export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deleteByPattern(pattern: string): Promise<void>;
  
  // ✅ ДОБАВЛЕНЫ опциональные методы
  healthCheck?(): Promise<boolean>;
  disconnect?(): Promise<void>;
  
  // ✅ Сохраняем существующие методы (если используются)
  exists?(key: string): Promise<boolean>;
  clear?(): Promise<void>;
  getStats?(): Promise<any>;
}