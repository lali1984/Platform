// src/tests/unit/token.service.test.ts
import { TokenService } from '../../../src/auth-service/src/services/token.service';

// Mock environment variables
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

describe('TokenService', () => {
  let tokenService: TokenService;

  beforeEach(() => {
    tokenService = new TokenService();
  });

  test('should generate access token', () => {
    const payload = {
      userId: 'user-123',
      email: 'test@example.com',
      isTwoFactorEnabled: false
    };

    const token = tokenService.generateAccessToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT формат
  });

  test('should verify valid access token', () => {
     const payload = {
      userId: 'user-123',
      email: 'test@example.com',
      isTwoFactorEnabled: false
    };
    const token = tokenService.generateAccessToken(payload);
    const decoded = tokenService.verifyAccessToken(token);
    
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
  });

  test('should return null for invalid token', () => {
    const decoded = tokenService.verifyAccessToken('invalid.token.here');
    expect(decoded).toBeNull();
  });
});