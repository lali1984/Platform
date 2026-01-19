import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { UserEntity } from '../entities/User';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'secret',
  database: process.env.DB_NAME || 'auth_db',
  entities: [UserEntity],
  synchronize: false, // Важно: false для production, используем миграции
  logging: process.env.NODE_ENV === 'development',
  poolSize: 20,
});

// Инициализация подключения
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('TypeORM Data Source has been initialized!');
  } catch (error) {
    console.error('Error during TypeORM Data Source initialization:', error);
    throw error;
  }
};