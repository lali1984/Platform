// src/tests/integration/auth.register.test.ts
import request from 'supertest';
import { app } from '../../../src/auth-service/src/index'; // Экспортируйте app из index.ts

describe('POST /api/auth/register', () => {
  test('should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      })
      .expect(201);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('newuser@example.com');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  test('should reject duplicate email', async () => {
    // Сначала создаем пользователя
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      });

    // Пытаемся создать еще раз
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'AnotherPass123!',
        confirmPassword: 'AnotherPass123!'
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('already exists');
  });

  test('should validate password strength', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak'
      })
      .expect(400);

    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toContain('Password must be at least 12 characters');
  });
});