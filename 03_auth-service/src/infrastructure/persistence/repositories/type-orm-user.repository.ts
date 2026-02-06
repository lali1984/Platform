import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { User } from '../../../domain/entities/User';
import { UserRepository, CreateUserData, FindUserCriteria } from '../../../domain/ports/user-repository.port';
import { UserEntity } from '../entities/User.entity';
//import { parseISO8601Date } from '@platform/contracts';

export interface LoginAttemptInfo {
  email: string;
  attempts: number;
  lockedUntil?: Date;
  lastAttemptAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
export class TypeORMUserRepository implements UserRepository {
  private repository: Repository<UserEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserEntity);
  }

  async create(data: CreateUserData): Promise<User> {
    // Создаем доменный объект
    const user = await User.create({
      email: data.email,
      password: data.password,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    // Создаем entity — конвертируем ISO8601Date → Date
    const userEntity = this.repository.create({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      twoFactorSecret: user.twoFactorSecret,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
    });
    
    await this.repository.save(userEntity);
    
    return user;
  }

  async findOne(criteria: FindUserCriteria): Promise<User | null> {
    const where: any = {};
    
    if (criteria.id) where.id = criteria.id;
    if (criteria.email) where.email = criteria.email.toLowerCase().trim();
    if (criteria.username) where.username = criteria.username;

    const entity = await this.repository.findOne({ where });
    
    if (!entity) return null;

    // Конвертируем Date → ISO8601Date при создании User
    return User.fromPersistence({
      id: entity.id,
      email: entity.email,
      passwordHash: entity.passwordHash,
      username: entity.username,
      firstName: entity.firstName,
      lastName: entity.lastName,
      isActive: entity.isActive,
      isEmailVerified: entity.isEmailVerified,
      isTwoFactorEnabled: entity.isTwoFactorEnabled,
      twoFactorSecret: entity.twoFactorSecret,
      createdAt: entity.createdAt.toISOString() as any,
      updatedAt: entity.updatedAt.toISOString() as any,
      lastLoginAt: entity.lastLoginAt?.toISOString() as any,
    });
  }

  async save(user: User): Promise<User> {
    // Проверяем, существует ли пользователь
    const exists = await this.exists({ id: user.id });
    if (!exists) {
      // Создаем нового пользователя
      const userEntity = this.repository.create({
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        twoFactorSecret: user.twoFactorSecret,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
      });
      await this.repository.save(userEntity);
    } else {
      // Обновляем существующего пользователя
      const entity = await this.repository.findOne({ where: { id: user.id } });
      if (!entity) {
        throw new Error(`User with id ${user.id} not found`);
      }
      // Обновляем поля
      entity.email = user.email;
      entity.username = user.username;
      entity.firstName = user.firstName;
      entity.lastName = user.lastName;
      entity.isActive = user.isActive;
      entity.isEmailVerified = user.isEmailVerified;
      entity.isTwoFactorEnabled = user.isTwoFactorEnabled;
      entity.twoFactorSecret = user.twoFactorSecret;
      entity.updatedAt = new Date();
      entity.lastLoginAt = user.lastLoginAt ? new Date(user.lastLoginAt) : undefined;
      await this.repository.save(entity);
    }
    
  // ✅ ИСПРАВЛЕНО: загружаем из БД и преобразуем в доменную сущность
  const savedEntity = await this.repository.findOne({ where: { id: user.id } });
  if (!savedEntity) {
    throw new Error(`User with id ${user.id} was saved but not found`);
  }
  return User.fromPersistence({
    id: savedEntity.id,
    email: savedEntity.email,
    passwordHash: savedEntity.passwordHash,
    username: savedEntity.username,
    firstName: savedEntity.firstName,
    lastName: savedEntity.lastName,
    isActive: savedEntity.isActive,
    isEmailVerified: savedEntity.isEmailVerified,
    isTwoFactorEnabled: savedEntity.isTwoFactorEnabled,
    twoFactorSecret: savedEntity.twoFactorSecret,
    createdAt: savedEntity.createdAt,
    updatedAt: savedEntity.updatedAt,
    lastLoginAt: savedEntity.lastLoginAt,
  });
}

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(criteria: FindUserCriteria): Promise<boolean> {
    const where: any = {};
    
    if (criteria.id) where.id = criteria.id;
    if (criteria.email) where.email = criteria.email.toLowerCase().trim();
    if (criteria.username) where.username = criteria.username;

    const count = await this.repository.count({ where });
    return count > 0;
  }

  // Добавьте ВНУТРЬ класса TypeORMUserRepository (после других методов)
// В TypeORMUserRepository.ts ИСПРАВИТЬ методы:

            // Исправленные методы в TypeORMUserRepository.ts
async findUserRole(userId: string): Promise<string | null> {
  try {
    const result = await this.dataSource
      .createQueryBuilder()
      .select('r.name', 'roleName')
      .from('user_roles', 'ur')
      .innerJoin('roles', 'r', 'r.id = ur.role_id')
      .where('ur.user_id = :userId AND ur.is_active = true', { userId })
      .orderBy('ur.assigned_at', 'DESC')
      .limit(1)
      .getRawOne<{ roleName: string }>();

    return result?.roleName || 'user';
  } catch (error) {
    // Если таблиц еще нет, возвращаем дефолтную роль
    console.warn('RBAC tables might not be initialized, using default role');
    return 'user';
  }
}

async findUserPermissions(userId: string): Promise<string[]> {
  try {
    const permissions = await this.dataSource
      .createQueryBuilder()
      .select('DISTINCT p.code', 'permissionCode')
      .from('user_roles', 'ur')
      .innerJoin('role_permissions', 'rp', 'rp.role_id = ur.role_id')
      .innerJoin('permissions', 'p', 'p.id = rp.permission_id')
      .where('ur.user_id = :userId AND ur.is_active = true', { userId })
      .getRawMany<{ permissionCode: string }>();

    return permissions.map(p => p.permissionCode);
  } catch (error) {
    // Если таблиц еще нет, возвращаем пустой массив
    console.warn('RBAC tables might not be initialized, returning empty permissions');
    return [];
  }
}

// ДОБАВЬТЕ ЭТОТ МЕТОД В КЛАСС TypeORMUserRepository
async findById(id: string): Promise<User | null> {
  try {
    const userEntity = await this.repository.findOne({
      where: { id },
      relations: {
        // при необходимости подгружаем связанные сущности (например, roles)
      },
    });

    if (!userEntity) return null;

    // Преобразуем из Entity → доменную сущность User
    return User.fromPersistence({
      id: userEntity.id,
      email: userEntity.email,
      passwordHash: userEntity.passwordHash,
      username: userEntity.username,
      firstName: userEntity.firstName,
      lastName: userEntity.lastName,
      isActive: userEntity.isActive,
      isEmailVerified: userEntity.isEmailVerified,
      isTwoFactorEnabled: userEntity.isTwoFactorEnabled,
      twoFactorSecret: userEntity.twoFactorSecret,
      createdAt: userEntity.createdAt,
      updatedAt: userEntity.updatedAt,
      lastLoginAt: userEntity.lastLoginAt,
    });
  } catch (error) {
    console.error('Failed to find user by ID:', error);
    return null;
  }
}

// Добавить в конец класса TypeORMUserRepository

async checkLockout(email: string): Promise<{ isLocked: boolean; message?: string }> {
  const attempts = await this.getLoginAttempts(email);
  
  if (!attempts) return { isLocked: false };

  // Проверка блокировки по времени
  if (attempts.lockedUntil && attempts.lockedUntil > new Date()) {
    const remainingMinutes = Math.ceil(
      (attempts.lockedUntil.getTime() - Date.now()) / 60000
    );
    return {
      isLocked: true,
      message: `Account locked. Try again in ${remainingMinutes} minutes.`,
    };
  }

  // Проверка количества попыток
  if (attempts.attempts >= 5) {
    await this.lockAccount(email, 15);
    return {
      isLocked: true,
      message: 'Too many failed attempts. Account locked for 15 minutes.',
    };
  }

  return { isLocked: false };
}

async incrementFailedAttempt(email: string): Promise<void> {
  const attempts = await this.getLoginAttempts(email);
  
  if (attempts) {
    await this.dataSource
      .createQueryBuilder()
      .update('login_attempts')
      .set({
        attempts: attempts.attempts + 1,
        lastAttemptAt: new Date(),
        updatedAt: new Date(),
      })
      .where('email = :email', { email })
      .execute();
  } else {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into('login_attempts')
      .values({
        email,
        attempts: 1,
        lastAttemptAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .execute();
  }
}

async resetFailedAttempts(email: string): Promise<void> {
  await this.dataSource
    .createQueryBuilder()
    .update('login_attempts')
    .set({
      attempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where('email = :email', { email })
    .execute();
}

async lockAccount(email: string, minutes: number): Promise<void> {
  const lockoutTime = new Date(Date.now() + minutes * 60000);
  
  await this.dataSource
    .createQueryBuilder()
    .update('login_attempts')
    .set({
      lockedUntil: lockoutTime,
      updatedAt: new Date(),
    })
    .where('email = :email', { email })
    .execute();
}

async getLoginAttempts(email: string): Promise<LoginAttemptInfo | null> {
  const result = await this.dataSource
    .createQueryBuilder()
    .select('*')
    .from('login_attempts', 'la')
    .where('la.email = :email', { email })
    .getRawOne();

  return result;
}
}