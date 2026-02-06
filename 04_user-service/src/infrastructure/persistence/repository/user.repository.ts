// services/user-service/src/infrastructure/persistence/user.typeorm.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere, IsNull, Not } from 'typeorm';
import { UserProfileEntity } from '../entities/user-profile';
import { IUserRepository, UserFilters, PaginatedResult, FindOptions } from '../../../domain/ports/user.repository.port';
import { User } from '../../../domain/entities/user-profile';
import { UserMapper } from '../../../application/mappers/user';

@Injectable()
export class UserTypormRepository implements IUserRepository {
  private readonly logger = new Logger(UserTypormRepository.name);

  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly repository: Repository<UserProfileEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    try {
      const entity = await this.repository.findOne({
        where: { id },
      });
      
      return entity ? UserMapper.toDomain(entity) : null;
    } catch (error) {
      this.logger.error(`Failed to find user by ID ${id}:`, error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const entity = await this.repository.findOne({
        where: { email },
      });
      
      return entity ? UserMapper.toDomain(entity) : null;
    } catch (error) {
      this.logger.error(`Failed to find user by email ${email}:`, error);
      throw error;
    }
  }

  async findByPhone(phone: string): Promise<User | null> {
    try {
      const entity = await this.repository.findOne({
        where: { phone },
      });
      
      return entity ? UserMapper.toDomain(entity) : null;
    } catch (error) {
      this.logger.error(`Failed to find user by phone ${phone}:`, error);
      throw error;
    }
  }

  // КРИТИЧЕСКИЙ МЕТОД: поиск по authUserId
  async findByAuthUserId(authUserId: string): Promise<User | null> {
    try {
      const entity = await this.repository.findOne({
        where: { userId: authUserId },
      });
      
      if (!entity) {
        this.logger.debug(`No user found for authUserId: ${authUserId}`);
        return null;
      }
      
      // Проверяем целостность данных
      if (entity.userId !== authUserId) {
        this.logger.warn(`Data integrity issue: entity.userId (${entity.userId}) != authUserId (${authUserId})`);
      }
      
      return UserMapper.toDomain(entity);
    } catch (error) {
      this.logger.error(`Failed to find user by authUserId ${authUserId}:`, error);
      throw error;
    }
  }

  async save(user: User): Promise<void> {
    try {
      const entity = UserMapper.toEntity(user);
      
      // КРИТИЧЕСКАЯ ПРОВЕРКА: убеждаемся что userId установлен
      if (!entity.userId) {
        throw new Error('Cannot save user without userId');
      }
      
      await this.repository.save(entity);
      this.logger.debug(`User saved: ${user.id} (auth: ${entity.userId})`);
    } catch (error) {
      this.logger.error(`Failed to save user ${user.id}:`, error);
      throw error;
    }
  }

  async update(user: User): Promise<void> {
    try {
      const existingEntity = await this.repository.findOne({
        where: { id: user.id },
      });
      
      if (!existingEntity) {
        throw new Error(`User not found for update: ${user.id}`);
      }
      
      // Обновляем entity из domain
      UserMapper.updateEntityFromDomain(existingEntity, user);
      
      await this.repository.save(existingEntity);
      this.logger.debug(`User updated: ${user.id}`);
    } catch (error) {
      this.logger.error(`Failed to update user ${user.id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.softDelete(id);
      this.logger.debug(`User soft deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete user ${id}:`, error);
      throw error;
    }
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<User[]> {
    try {
      const entities = await this.repository.find({
        skip: offset,
        take: limit,
        order: { createdAt: 'DESC' },
        where: { deletedAt: IsNull() }, // Не включаем удаленных
      });
      
      return entities.map(entity => UserMapper.toDomain(entity));
    } catch (error) {
      this.logger.error('Failed to find all users:', error);
      throw error;
    }
  }

  async findWithFilters(
    filters: UserFilters, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<User[]> {
    try {
      const where: FindOptionsWhere<UserProfileEntity> = { deletedAt: IsNull() };
      
      // Применяем фильтры
      if (filters.status) where.status = filters.status;
      if (filters.isVerified !== undefined) where.isVerified = filters.isVerified;
      if (filters.country) where.country = filters.country;
      if (filters.city) where.city = filters.city;
      if (filters.company) where.company = Like(`%${filters.company}%`);
      
      // Фильтры по дате
      if (filters.createdAtFrom || filters.createdAtTo) {
        where.createdAt = Between(
          filters.createdAtFrom || new Date(0),
          filters.createdAtTo || new Date()
        );
      }
      
      if (filters.lastActiveFrom || filters.lastActiveTo) {
        where.lastActiveAt = Between(
          filters.lastActiveFrom || new Date(0),
          filters.lastActiveTo || new Date()
        );
      }
      
      const entities = await this.repository.find({
        where,
        skip: offset,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      
      return entities.map(entity => UserMapper.toDomain(entity));
    } catch (error) {
      this.logger.error('Failed to find users with filters:', { filters, error });
      throw error;
    }
  }

  async exists(email: string): Promise<boolean> {
    try {
      const count = await this.repository.count({
        where: { email, deletedAt: IsNull() },
      });
      return count > 0;
    } catch (error) {
      this.logger.error(`Failed to check if user exists by email ${email}:`, error);
      throw error;
    }
  }

  async existsByAuthUserId(authUserId: string): Promise<boolean> {
    try {
      const count = await this.repository.count({
        where: { userId: authUserId, deletedAt: IsNull() },
      });
      return count > 0;
    } catch (error) {
      this.logger.error(`Failed to check if user exists by authUserId ${authUserId}:`, error);
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      return await this.repository.count({
        where: { deletedAt: IsNull() },
      });
    } catch (error) {
      this.logger.error('Failed to count users:', error);
      throw error;
    }
  }

  async countByStatus(status: string): Promise<number> {
    try {
      return await this.repository.count({
        where: { status, deletedAt: IsNull() },
      });
    } catch (error) {
      this.logger.error(`Failed to count users by status ${status}:`, error);
      throw error;
    }
  }

  async search(query: string, limit: number = 50, offset: number = 0): Promise<User[]> {
    try {
      const entities = await this.repository
        .createQueryBuilder('user')
        .where('user.deletedAt IS NULL')
        .andWhere(
          '(user.email ILIKE :query OR ' +
          'user.firstName ILIKE :query OR ' +
          'user.lastName ILIKE :query OR ' +
          'user.displayName ILIKE :query OR ' +
          'user.company ILIKE :query)',
          { query: `%${query}%` }
        )
        .skip(offset)
        .take(limit)
        .orderBy('user.createdAt', 'DESC')
        .getMany();
      
      return entities.map(entity => UserMapper.toDomain(entity));
    } catch (error) {
      this.logger.error(`Failed to search users with query "${query}":`, error);
      throw error;
    }
  }

  // Дополнительные методы для административных задач
  async findDeletedUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    try {
      const entities = await this.repository.find({
        where: { deletedAt: Not(IsNull()) },
        skip: offset,
        take: limit,
        order: { deletedAt: 'DESC' },
        withDeleted: true,
      });
      
      return entities.map(entity => UserMapper.toDomain(entity));
    } catch (error) {
      this.logger.error('Failed to find deleted users:', error);
      throw error;
    }
  }

  async restore(id: string): Promise<void> {
    try {
      await this.repository.restore(id);
      this.logger.debug(`User restored: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to restore user ${id}:`, error);
      throw error;
    }
  }

  async permanentlyDelete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
      this.logger.debug(`User permanently deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to permanently delete user ${id}:`, error);
      throw error;
    }
  }

  // Метод для проверки целостности данных
  async checkDataIntegrity(): Promise<{ issues: string[]; count: number }> {
    try {
      const issues: string[] = [];
      
      // Проверка: пользователи без userId
      const usersWithoutUserId = await this.repository.find({
        where: { userId: IsNull() },
      });
      
      if (usersWithoutUserId.length > 0) {
        issues.push(`${usersWithoutUserId.length} users without userId`);
      }
      
      // Проверка: дубликаты userId (должно быть предотвращено constraint)
      const duplicateUserIds = await this.repository
        .createQueryBuilder('user')
        .select('user.userId, COUNT(*) as count')
        .where('user.userId IS NOT NULL')
        .groupBy('user.userId')
        .having('COUNT(*) > 1')
        .getRawMany();
      
      if (duplicateUserIds.length > 0) {
        issues.push(`${duplicateUserIds.length} duplicate userIds found`);
      }
      
      // Проверка: невалидные email
      const invalidEmails = await this.repository
        .createQueryBuilder('user')
        .where('user.email IS NOT NULL')
        .andWhere("user.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'")
        .getMany();
      
      if (invalidEmails.length > 0) {
        issues.push(`${invalidEmails.length} users with invalid email format`);
      }
      
      return {
        issues,
        count: issues.length,
      };
    } catch (error) {
      this.logger.error('Failed to check data integrity:', error);
      throw error;
    }
  }

  // Метод для административных отчетов
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    byCountry: Record<string, number>;
    byCompany: Record<string, number>;
    createdLast30Days: number;
    avgProfileCompletion: number;
  }> {
    try {
      const total = await this.count();
      const active = await this.countByStatus('ACTIVE');
      const inactive = await this.countByStatus('INACTIVE');
      
      const verifiedCount = await this.repository.count({
        where: { isVerified: true, deletedAt: IsNull() },
      });
      
      // Статистика по странам
      const countryStats = await this.repository
        .createQueryBuilder('user')
        .select('user.country, COUNT(*) as count')
        .where('user.country IS NOT NULL AND user.deletedAt IS NULL')
        .groupBy('user.country')
        .getRawMany();
      
      const byCountry: Record<string, number> = {};
      countryStats.forEach(stat => {
        byCountry[stat.country] = parseInt(stat.count);
      });
      
      // Статистика по компаниям (топ 10)
      const companyStats = await this.repository
        .createQueryBuilder('user')
        .select('user.company, COUNT(*) as count')
        .where('user.company IS NOT NULL AND user.deletedAt IS NULL')
        .groupBy('user.company')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();
      
      const byCompany: Record<string, number> = {};
      companyStats.forEach(stat => {
        byCompany[stat.company] = parseInt(stat.count);
      });
      
      // Пользователи созданные за последние 30 дней
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const createdLast30Days = await this.repository.count({
        where: {
          createdAt: Between(thirtyDaysAgo, new Date()),
          deletedAt: IsNull(),
        },
      });
      
      // Средний процент заполнения профиля
      const avgCompletion = await this.repository
        .createQueryBuilder('user')
        .select('AVG(user.profileCompletionPercentage)', 'avg')
        .where('user.deletedAt IS NULL')
        .getRawOne();
      
      return {
        total,
        active,
        inactive,
        verified: verifiedCount,
        byCountry,
        byCompany,
        createdLast30Days,
        avgProfileCompletion: parseFloat(avgCompletion?.avg || '0'),
      };
    } catch (error) {
      this.logger.error('Failed to get statistics:', error);
      throw error;
    }
  }
}