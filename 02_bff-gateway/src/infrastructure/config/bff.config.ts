// /02_bff-gateway/src/infrastructure/config/bff.config.ts
import { environment } from './environment';

export interface ServiceConfig {
  name: string;
  url: string;
  timeout: number;
  retries: number;
}

export interface BFFConfig {
  services: {
    auth: ServiceConfig;
    user: ServiceConfig;
  };
  cache: {
    enabled: boolean;
    ttl: number;
    prefix: string;
    debug: boolean;        // ← ДОБАВЛЕНО
    maxEntries: number;    // ← ДОБАВЛЕНО
  };
  security: {
    jwtSecret: string;
    tokenExpiry: string;
  };
  server: {
    port: number;
    requestTimeout: number;
    maxPayloadSize: string;
  };
}

export const bffConfig: BFFConfig = {
  services: {
    auth: {
      name: 'auth-service',
      url: environment.AUTH_SERVICE_URL,
      timeout: 5000, // 5 seconds
      retries: 3,
    },
    user: {
      name: 'user-service',
      url: environment.USER_SERVICE_URL,
      timeout: 5000,
      retries: 3,
    },
  },
  cache: {
    enabled: !!environment.REDIS_URL,
    ttl: environment.CACHE_TTL || 300, // дефолтное значение 5 минут
    prefix: 'bff:',
    debug: environment.NODE_ENV === 'development', // ← ДОБАВЛЕНО
    maxEntries: 10000, // ← ДОБАВЛЕНО
  },
  security: {
    jwtSecret: environment.JWT_SECRET || 'fallback-secret-change-in-production',
    tokenExpiry: '1h',
  },
  server: {
    port: environment.PORT || 3000,
    requestTimeout: 10000, // 10 seconds
    maxPayloadSize: '10mb',
  },
};

export default bffConfig;