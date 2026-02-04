import { User } from '../../domain/entities/User';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a new user with valid data', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('testuser');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.isActive).toBe(true);
      expect(user.isEmailVerified).toBe(false);
      expect(user.isTwoFactorEnabled).toBe(false);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should normalize email to lowercase', async () => {
      const user = await User.create({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      });

      expect(user.email).toBe('test@example.com');
    });

    it('should generate domain events on creation', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
      });

      const events = user.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('UserRegistered');
      expect(events[0].data.userId).toBe(user.id);
      expect(events[0].data.email).toBe('test@example.com');
    });
  });

  describe('validatePassword', () => {
    it('should return true for correct password', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
      });

      const isValid = await user.validatePassword('password123');
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
      });

      const isValid = await user.validatePassword('wrongpassword');
      expect(isValid).toBe(false);
    });
  });

  describe('login', () => {
    it('should update lastLoginAt and generate domain event', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
      });

      const initialLastLoginAt = user.lastLoginAt;
      user.login();

      expect(user.lastLoginAt).toBeDefined();
      expect(user.lastLoginAt).not.toBe(initialLastLoginAt);
      
      const events = user.getDomainEvents();
      const loginEvent = events.find(e => e.type === 'UserLoggedIn');
      expect(loginEvent).toBeDefined();
      expect(loginEvent!.data.userId).toBe(user.id);
    });
  });

  describe('twoFactorAuthentication', () => {
    it('should enable 2FA with secret', () => {
      const user = User.fromPersistence({
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: 'hash',
        isActive: true,
        isEmailVerified: false,
        isTwoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(user.isTwoFactorEnabled).toBe(false);
      expect(user.twoFactorSecret).toBeUndefined();

      user.enableTwoFactor('test-secret');

      expect(user.isTwoFactorEnabled).toBe(true);
      expect(user.twoFactorSecret).toBe('test-secret');
      
      const events = user.getDomainEvents();
      const twoFactorEvent = events.find(e => e.type === 'TwoFactorEnabled');
      expect(twoFactorEvent).toBeDefined();
    });

    it('should disable 2FA', () => {
      const user = User.fromPersistence({
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: 'hash',
        isActive: true,
        isEmailVerified: false,
        isTwoFactorEnabled: true,
        twoFactorSecret: 'test-secret',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      user.disableTwoFactor();

      expect(user.isTwoFactorEnabled).toBe(false);
      expect(user.twoFactorSecret).toBeUndefined();
    });
  });

  describe('accountManagement', () => {
    it('should deactivate account', () => {
      const user = User.fromPersistence({
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: 'hash',
        isActive: true,
        isEmailVerified: false,
        isTwoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      user.deactivate();
      expect(user.isActive).toBe(false);
    });

    it('should activate account', () => {
      const user = User.fromPersistence({
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: 'hash',
        isActive: false,
        isEmailVerified: false,
        isTwoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      user.activate();
      expect(user.isActive).toBe(true);
    });

    it('should verify email', () => {
      const user = User.fromPersistence({
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: 'hash',
        isActive: true,
        isEmailVerified: false,
        isTwoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      user.verifyEmail();
      expect(user.isEmailVerified).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should return user data without sensitive information', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      });

      const json = user.toJSON();

      expect(json.id).toBe(user.id);
      expect(json.email).toBe('test@example.com');
      expect(json.username).toBe('testuser');
      expect(json.isActive).toBe(true);
      expect(json.isEmailVerified).toBe(false);
      expect(json.isTwoFactorEnabled).toBe(false);
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
      
      // Проверяем, что sensitive данные не включены
      expect(json).not.toHaveProperty('passwordHash');
      expect(json).not.toHaveProperty('twoFactorSecret');
    });
  });
});
