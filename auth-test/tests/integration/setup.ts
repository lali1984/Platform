// src/tests/integration/setup.ts
import AppDataSource from '../../../src/auth-service/src/config/database';
import userRepository from '../../../src/auth-service/src/repositories/user.repository';
import { CreateUserDTO } from '../../../src/auth-service/src/types/user'; // Импортируем тип

// Глобальные настройки для тестов
beforeAll(async () => {
  // Для pg Pool используем connect() вместо initialize()
  await AppDataSource.connect();
  
  // Очистка тестовых данных
  await AppDataSource.query('TRUNCATE TABLE users CASCADE');
});

afterAll(async () => {
  // Очистка после всех тестов
  await AppDataSource.query('TRUNCATE TABLE users CASCADE');
  // Для pg Pool используем disconnect() вместо destroy()
  await AppDataSource.disconnect();
});

beforeEach(async () => {
  // Очистка перед каждым тестом
  await AppDataSource.query('DELETE FROM users');
});

// Test utilities
export const testUtils = {
  async createTestUser(email: string, password: string = 'TestPass123!') {
    // Проверьте, какие поля ожидает userRepository.create()
    const userData: CreateUserDTO = {
      email,
      password: await hashPassword(password),
      // Проверьте точное имя поля - возможно is_email_verified или isEmailVerified
      isEmailVerified: true,
      // Или isEmailVerified: true, в зависимости от определения DTO
    };
    
    return userRepository.create(userData);
  }
};

async function hashPassword(password: string): Promise<string> {
  // Реализация хеширования
  return password; // В тестах можно упростить
}