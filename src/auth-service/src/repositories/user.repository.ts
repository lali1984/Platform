import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database-typeorm';
import { UserEntity } from '../entities/User';
import { CreateUserDTO } from '../types/user';

export class UserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    // Создаем репозиторий, но не используем до инициализации
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  // Метод для безопасного получения репозитория с ленивой инициализацией
  private async getRepository(): Promise<Repository<UserEntity>> {
    if (!AppDataSource.isInitialized) {
      console.log('🔄 Инициализация TypeORM DataSource...');
      try {
        await AppDataSource.initialize();
        console.log('✅ TypeORM DataSource инициализирована');
      } catch (error) {
        console.error('❌ Ошибка инициализации TypeORM:', error);
        throw error;
      }
    }
    return this.repository;
  }

  async create(userData: CreateUserDTO): Promise<UserEntity> {
    const repo = await this.getRepository();
    const user = repo.create({
      email: userData.email,
      passwordHash: userData.password,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isEmailVerified: false,
      isActive: true,
      isTwoFactorEnabled: false
    });
    return await repo.save(user);
  }

  async createWithPassword(userData: { 
    email: string; 
    password: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<UserEntity> {
    const repo = await this.getRepository();
    const user = new UserEntity();
    user.email = userData.email;
    user.username = userData.username;
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    await user.setPassword(userData.password);
    user.isEmailVerified = false;
    user.isActive = true;
    user.isTwoFactorEnabled = false;
    return await repo.save(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const repo = await this.getRepository();
    return await repo.findOne({
      where: { email }
    });
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const repo = await this.getRepository();
    return await repo.findOne({
      where: { username }
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const repo = await this.getRepository();
    return await repo.findOne({
      where: { id }
    });
  }

  async update(id: string, updateData: Partial<UserEntity>): Promise<UserEntity | null> {
    const repo = await this.getRepository();
    await repo.update(id, {
      ...updateData,
      updatedAt: new Date()
    });
    return this.findById(id);
  }

  async updatePassword(id: string, newPasswordHash: string): Promise<void> {
    const repo = await this.getRepository();
    await repo.update(id, {
      passwordHash: newPasswordHash,
      updatedAt: new Date()
    });
  }

  async updateTwoFactorSecret(userId: string, secret: string): Promise<void> {
    const repo = await this.getRepository();
    await repo.update(userId, {
      twoFactorSecret: secret,
      isTwoFactorEnabled: true,
      updatedAt: new Date()
    });
  }

  async disableTwoFactor(userId: string): Promise<void> {
    const repo = await this.getRepository();
    await repo.update(userId, {
      twoFactorSecret: () => 'NULL',
      isTwoFactorEnabled: false,
      updatedAt: new Date()
    });
  }

  async markEmailAsVerified(userId: string): Promise<void> {
    const repo = await this.getRepository();
    await repo.update(userId, {
      isEmailVerified: true,
      updatedAt: new Date()
    });
  }

  async setResetPasswordToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    const repo = await this.getRepository();
    await repo.update(userId, {
      resetPasswordToken: token,
      resetPasswordExpires: expiresAt,
      updatedAt: new Date()
    });
  }

  async clearResetPasswordToken(userId: string): Promise<void> {
    const repo = await this.getRepository();
    await repo.update(userId, {
      resetPasswordToken: () => 'NULL',
      resetPasswordExpires: () => 'NULL',
      updatedAt: new Date()
    });
  }

  async deactivateUser(userId: string): Promise<void> {
    const repo = await this.getRepository();
    await repo.update(userId, {
      isActive: false,
      updatedAt: new Date()
    });
  }
}

// Экспортируем синглтон
export default new UserRepository();