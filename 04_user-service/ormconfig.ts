import { DataSource } from 'typeorm';
import * as path from 'path';

// Отдельный конфиг только для TypeORM CLI (миграций)
export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5433'),
  username: process.env.DATABASE_USERNAME || 'admin',
  password: process.env.DATABASE_PASSWORD || 'secret',
  database: process.env.DATABASE_NAME || 'user_db',
  
  // Используем абсолютные пути от корня проекта
  entities: [path.join(process.cwd(), 'src', 'infrastructure', 'persistence', '*.entity.{ts,js}')],
  migrations: [path.join(process.cwd(), 'src', 'infrastructure', 'migrations', '*.{ts,js}')],
  migrationsTableName: 'typeorm_migrations',
  
  // Настройки для миграций
  synchronize: false,
  logging: true,
  migrationsRun: false,
});