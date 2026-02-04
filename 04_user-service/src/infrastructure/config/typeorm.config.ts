import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { OutboxEventEntity } from '../persistence/outbox-event.entity';
import { UserProfileEntity } from '../persistence/user-profile.entity';

// Загружаем переменные окружения
dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });

// Явно указываем тип для конфигурации PostgreSQL
export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  username: process.env.DB_USERNAME || 'user_service',
  password: process.env.DB_PASSWORD || 'UserServiceSecurePass2026!',
  database: process.env.DB_DATABASE || 'user_db',
  entities: [UserProfileEntity, OutboxEventEntity],
  // 🔴 КРИТИЧЕСКИ ВАЖНО: никогда не использовать synchronize в продакшене
  synchronize: false,
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error', 'schema'] : ['error'],
  migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
  migrationsRun: true,
  migrationsTableName: 'typeorm_migrations',
  // Connection pool settings
  extra: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 30000,
    query_timeout: 30000,
    application_name: 'user-service',
  },
  // SSL for production
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: true }
    : false,
};

export const AppDataSource = new DataSource(typeormConfig);