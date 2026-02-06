// services/user-service/src/application/mappers/user.mapper.ts
import { User, UserStatus } from '../../domain/entities/user-profile';
import { UserProfileEntity } from '../../infrastructure/persistence/entities/user-profile';
import { UserResponseDto } from '../../presentation/dto/user-response.dto';

export class UserMapper {
  static toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      status: user.status,
      isVerified: user.isVerified,
      metadata: user.metadata ?? undefined,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      deletedAt: user.deletedAt ? new Date(user.deletedAt) : undefined,
    };
  }

  static toResponseFromEntity(entity: UserProfileEntity): UserResponseDto {
    return {
      id: entity.id,
      email: entity.email ?? undefined,
      firstName: entity.firstName ?? undefined,
      lastName: entity.lastName ?? undefined,
      phone: entity.phone ?? undefined,
      avatarUrl: entity.avatarUrl ?? undefined,
      status: entity.status as UserStatus,
      isVerified: entity.isVerified,
      metadata: entity.metadata ?? undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? undefined,
    };
  }

  static toEntity(user: User): UserProfileEntity {
    const entity = new UserProfileEntity();
    
    // КРИТИЧЕСКИЕ ПОЛЯ: ID и связь с auth-service
    entity.id = user.id;
    entity.userId = user.getAuthUserId() || user.id; // Если нет authUserId, используем id
    
    // Базовые поля профиля
    entity.email = user.email;
    entity.firstName = user.firstName ?? null;
    entity.lastName = user.lastName ?? null;
    
    // Вычисляем displayName если нужно
    if (!user.firstName && !user.lastName) {
      entity.displayName = null;
    } else {
      entity.displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || null;
    }
    
    // Контактные данные
    entity.phone = user.phone ?? null;
    entity.avatarUrl = user.avatarUrl ?? null;
    
    // Статус и верификация
    entity.status = user.status;
    entity.isVerified = user.isVerified;
    
    // Системные поля
    entity.createdAt = new Date(user.createdAt);
    entity.updatedAt = new Date(user.updatedAt);
    entity.deletedAt = user.deletedAt ? new Date(user.deletedAt) : null;
    
    // Metadata
    entity.metadata = user.metadata || {};
    
    // Вычисляем profileCompletionPercentage
    entity.profileCompletionPercentage = this.calculateProfileCompletion(user);
    
    return entity;
  }

  /**
   * КРИТИЧЕСКИЙ МЕТОД: преобразование entity -> domain
   * Используется репозиторием для загрузки пользователей из БД
   */
  static toDomain(entity: UserProfileEntity): User {
    // Создаем User из entity
    // ВАЖНО: нужно использовать правильный метод создания в зависимости от контекста
    const isFromAuthService = entity.metadata?.source === 'auth-service' || 
                              entity.metadata?.source === 'auth-service-registration';
    
    if (isFromAuthService && entity.metadata?.authUserId) {
      // Пользователь создан из auth-service события
      return User.createFromAuthEvent({
        authUserId: entity.metadata.authUserId,
        email: entity.email || '',
        firstName: entity.firstName || '',
        lastName: entity.lastName || '',
        phone: entity.phone || undefined,
        avatarUrl: entity.avatarUrl || undefined,
        isVerified: entity.isVerified,
        metadata: entity.metadata,
      });
    } else {
      // Обычный пользователь
      return User.create({
        id: entity.id,
        email: entity.email || '',
        firstName: entity.firstName || '',
        lastName: entity.lastName || '',
        phone: entity.phone || undefined,
        avatarUrl: entity.avatarUrl || undefined,
        authUserId: entity.metadata?.authUserId,
        isActive: entity.status !== 'INACTIVE',
        isVerified: entity.isVerified,
      });
    }
  }

  /**
   * Вычисляет процент заполнения профиля
   */
  private static calculateProfileCompletion(user: User): number {
    let completion = 0;
    
    if (user.email) completion += 10;
    if (user.firstName) completion += 15;
    if (user.lastName) completion += 15;
    if (user.avatarUrl) completion += 10;
    if (user.phone) completion += 10;
    // Добавить проверку других полей по мере необходимости
    
    return Math.min(completion, 100);
  }

  /**
   * Обновляет entity из domain (для update операций)
   */
  static updateEntityFromDomain(entity: UserProfileEntity, user: User): void {
    entity.firstName = user.firstName ?? null;
    entity.lastName = user.lastName ?? null;
    entity.phone = user.phone ?? null;
    entity.avatarUrl = user.avatarUrl ?? null;
    entity.status = user.status;
    entity.isVerified = user.isVerified;
    entity.updatedAt = new Date();
    
    // Обновляем displayName
    if (user.firstName || user.lastName) {
      entity.displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || null;
    }
    
    // Обновляем metadata
    if (user.metadata) {
      entity.metadata = { ...entity.metadata, ...user.metadata };
    }
    
    // Пересчитываем completion
    entity.profileCompletionPercentage = this.calculateProfileCompletion(user);
  }

  /**
   * Проверяет целостность данных между entity и domain
   */
  static validateIntegrity(entity: UserProfileEntity, user: User): string[] {
    const errors: string[] = [];
    
    if (entity.id !== user.id) {
      errors.push(`ID mismatch: entity=${entity.id}, domain=${user.id}`);
    }
    
    if (entity.email !== user.email) {
      errors.push(`Email mismatch: entity=${entity.email}, domain=${user.email}`);
    }
    
    if (entity.status !== user.status) {
      errors.push(`Status mismatch: entity=${entity.status}, domain=${user.status}`);
    }
    
    if (entity.isVerified !== user.isVerified) {
      errors.push(`isVerified mismatch: entity=${entity.isVerified}, domain=${user.isVerified}`);
    }
    
    return errors;
  }
}