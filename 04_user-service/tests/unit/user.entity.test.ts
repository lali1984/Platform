// services/user-service/tests/unit/user.entity.test.ts
import { User } from '../../src/domain/entities/user.entity';

describe('User Entity', () => {
  describe('creation', () => {
    it('should create a user with valid data', () => {
      const user = User.create({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+79001234567',
        avatarUrl: 'https://example.com/avatar.jpg',
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.phone).toBe('+79001234567');
      expect(user.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(user.status).toBe('ACTIVE');
      expect(user.isVerified).toBe(false);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.deletedAt).toBeUndefined();
    });

    it('should throw an error for invalid email', () => {
      expect(() =>
        User.create({
          email: 'invalid-email',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).toThrow('Invalid email provided');
    });

    it('should throw an error for invalid phone', () => {
      expect(() =>
        User.create({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '123',
        }),
      ).toThrow('Invalid phone number provided');
    });
  });

  describe('business logic', () => {
    let user: User;

    beforeEach(() => {
      user = User.create({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should return full name', () => {
      expect(user.fullName).toBe('John Doe');
    });

    it('should be active by default', () => {
      expect(user.isActive()).toBe(true);
      expect(user.status).toBe('ACTIVE');
    });

    it('should verify user', () => {
      const oldUpdatedAt = user.updatedAt;
      user.verify();

      expect(user.isVerified).toBe(true);
      expect(new Date(user.updatedAt).getTime()).toBeGreaterThan(
        new Date(oldUpdatedAt).getTime(),
      );
    });

    it('should deactivate user', () => {
      const oldUpdatedAt = user.updatedAt;
      const oldDeletedAt = user.deletedAt;

      user.deactivate();

      expect(user.status).toBe('INACTIVE');
      expect(user.deletedAt).toBeDefined();
      expect(new Date(user.updatedAt).getTime()).toBeGreaterThan(
        new Date(oldUpdatedAt).getTime(),
      );
      if (user.deletedAt && oldDeletedAt) {
  expect(new Date(user.deletedAt).getTime()).toBeGreaterThan(
    new Date(oldDeletedAt).getTime(),
  );
  }}
)
  

    it('should update profile', () => {
      const oldUpdatedAt = user.updatedAt;

      user.updateProfile({
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+79007654321',
      });

      expect(user.firstName).toBe('Jane');
      expect(user.lastName).toBe('Smith');
      expect(user.phone).toBe('+79007654321');
      expect(new Date(user.updatedAt).getTime()).toBeGreaterThan(
        new Date(oldUpdatedAt).getTime(),
      );
    });
  });
});
