// src/tests/e2e/auth-flow.test.ts
import request from 'supertest';
import { app } from '../../../src/auth-service/src/index';

describe('Full Authentication Flow', () => {
  let accessToken: string;
  let refreshToken: string;
  const testUser = {
    email: 'e2e-test@example.com',
    password: 'E2ETestPass123!'
  };

  test('1. Register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: testUser.email,
        password: testUser.password,
        confirmPassword: testUser.password
      })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });

  test('2. Login with credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);

    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  test('3. Access protected route with token', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.email).toBe(testUser.email);
  });

  test('4. Refresh access token', async () => {
    const response = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    
    // Обновляем токен
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  test('5. Logout', async () => {
    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Проверяем что токен больше не работает
    await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });
});