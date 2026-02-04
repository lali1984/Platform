export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  AUTH_SERVICE_URL: string;
  USER_SERVICE_URL: string;
  REDIS_URL?: string;
  JWT_SECRET: string;
  CACHE_TTL: number;
}

export const environment: Environment = {
  NODE_ENV: (process.env.NODE_ENV as Environment['NODE_ENV']) || 'development',
  PORT: parseInt(process.env.PORT || '3003'),
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  USER_SERVICE_URL: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  REDIS_URL: process.env.REDIS_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '300'), // 5 minutes default
};