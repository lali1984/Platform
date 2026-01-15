// src/tests/unit/validators.test.ts
import { Validators } from '../../../src/auth-service/src/utils/validators';

describe('Validators', () => {
  describe('isValidEmail', () => {
    test('should validate correct email', () => {
      expect(Validators.isValidEmail('test@example.com')).toBe(true);
    });

    test('should reject invalid email', () => {
      expect(Validators.isValidEmail('invalid-email')).toBe(false);
      expect(Validators.isValidEmail('test@')).toBe(false);
      expect(Validators.isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    test('should validate strong password', () => {
      const result = Validators.isValidPassword('SecurePass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject weak password', () => {
      const result = Validators.isValidPassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters long');
    });
  });
});