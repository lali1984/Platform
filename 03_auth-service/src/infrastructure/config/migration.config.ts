import { DataSource } from 'typeorm';
import { UserEntity } from '../persistence/entities/User.entity';
import { OutboxEvent } from '../persistence/entities/outbox-event.entity';

export const migrationDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'postgres-auth',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'admin',
  password: process.env.DATABASE_PASSWORD || 'secret',
  database: process.env.DATABASE_NAME || 'auth_db',
  synchronize: false,
  logging: true,
  entities: [UserEntity, OutboxEvent],
  migrations: ['src/infrastructure/migrations/*.ts'],
  subscribers: [],
  extra: {
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
    statement_timeout: 5000,
    family: 4, // Принудительно используем IPv4
  },
});
