// services/user-service/src/domain/entities/user.entity.ts
import { AggregateRoot } from './aggregate-root';
import { 
  UserId, 
  Email, 
  PhoneNumber, 
  ISO8601Date, 
  toISO8601Date,
  unsafeCreateUserId,
  createEmail,
  createPhoneNumber
} from '@platform/contracts';
import { v4 as uuidv4 } from 'uuid';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

export interface UserProps {
  id: UserId;
  email: Email;
  firstName: string;
  lastName: string;
  phone?: PhoneNumber;
  avatarUrl?: string;
  status: UserStatus;
  isVerified: boolean;
  metadata?: Record<string, any>;
  createdAt: ISO8601Date;
  updatedAt: ISO8601Date;
  deletedAt?: ISO8601Date;
}

export class User extends AggregateRoot<UserProps> {
  constructor(props: UserProps) {
    super(props);
  }

  protected getId(): string {
    return this.props.id;
  }

  // Геттеры
  get id(): UserId { return this.props.id; }
  get email(): Email { return this.props.email; }
  get firstName(): string { return this.props.firstName; }
  get lastName(): string { return this.props.lastName; }
  get fullName(): string { return `${this.firstName} ${this.lastName}`.trim(); }
  get phone(): PhoneNumber | undefined { return this.props.phone; }
  get avatarUrl(): string | undefined { return this.props.avatarUrl; }
  get status(): UserStatus { return this.props.status; }
  get isVerified(): boolean { return this.props.isVerified; }
  get metadata(): Record<string, any> | undefined { return this.props.metadata; }
  get createdAt(): ISO8601Date { return this.props.createdAt; }
  get updatedAt(): ISO8601Date { return this.props.updatedAt; }
  get deletedAt(): ISO8601Date | undefined { return this.props.deletedAt; }

  // Бизнес-методы
  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  verify(): void {
    this.props.isVerified = true;
    this.props.updatedAt = toISO8601Date(new Date());
  }

  deactivate(): void {
    this.props.status = UserStatus.INACTIVE;
    this.props.deletedAt = toISO8601Date(new Date());
    this.props.updatedAt = toISO8601Date(new Date());
  }

  delete(): void {
    this.props.status = UserStatus.DELETED;
    this.props.deletedAt = toISO8601Date(new Date());
    this.props.updatedAt = toISO8601Date(new Date());
  }

  updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  }): void {
    if (data.firstName) this.props.firstName = data.firstName;
    if (data.lastName) this.props.lastName = data.lastName;
    if (data.phone !== undefined) {
      if (data.phone === '') {
        this.props.phone = undefined;
      } else if (data.phone) {
        const phoneVo = createPhoneNumber(data.phone);
        if (!phoneVo) {
          throw new Error(`Invalid phone number provided in updateProfile: ${data.phone}`);
        }
        this.props.phone = phoneVo;
      } else {
        this.props.phone = undefined;
      }
    }
    if (data.avatarUrl !== undefined) this.props.avatarUrl = data.avatarUrl;
    this.props.updatedAt = toISO8601Date(new Date());
  }

  // ============================================
  // КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ: МЕТОДЫ СОЗДАНИЯ ПОЛЬЗОВАТЕЛЯ
  // ============================================

  /**
   * Существующий метод для общего создания пользователя
   * Используется для ручного создания или тестирования
   */
  static create(props: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    id?: string; // Опциональный ID
    authUserId?: string; // ID из auth-service
    isActive?: boolean;
    isVerified?: boolean;
  }): User {
    const emailVo = createEmail(props.email);
    if (!emailVo) {
      throw new Error(`Invalid email provided: ${props.email}`);
    }

    const phoneVo = props.phone
      ? (() => {
          const vo = createPhoneNumber(props.phone);
          return vo ?? undefined;
        })()
      : undefined;

    if (props.phone && !phoneVo) {
      throw new Error(`Invalid phone number provided: ${props.phone}`);
    }

    // ⚠️ ВАЖНО: Определяем ID пользователя
    // Приоритет: 1. id, 2. authUserId, 3. новый UUID
    const userId = props.id || props.authUserId || uuidv4();
    const userIdVo = unsafeCreateUserId(userId);

    const user = new User({
      id: userIdVo,
      email: emailVo,
      firstName: props.firstName,
      lastName: props.lastName,
      phone: phoneVo,
      avatarUrl: props.avatarUrl,
      status: props.isActive === false ? UserStatus.INACTIVE : UserStatus.ACTIVE,
      isVerified: props.isVerified || false,
      metadata: {
        ...(props.authUserId ? { authUserId: props.authUserId } : {}),
        source: props.authUserId ? 'auth-service' : 'manual-creation',
      },
      createdAt: toISO8601Date(new Date()),
      updatedAt: toISO8601Date(new Date()),
    });

    return user;
  }

  /**
   * КРИТИЧЕСКИ ВАЖНЫЙ МЕТОД: Создание пользователя из события auth-service
   * Гарантирует что ID пользователя совпадает с authUserId
   * Используется ТОЛЬКО для обработки UserRegisteredEvent
   */
  static createFromAuthEvent(props: {
    authUserId: string; // ⚠️ ОБЯЗАТЕЛЬНОЕ ПОЛЕ
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    isVerified?: boolean;
    metadata?: Record<string, any>;
  }): User {
    // ⚠️ ВАЛИДАЦИЯ: authUserId обязателен
    if (!props.authUserId) {
      throw new Error('authUserId is REQUIRED for creating user from auth event');
    }

    // ⚠️ ВАЛИДАЦИЯ: Проверка формата UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(props.authUserId)) {
      throw new Error(`Invalid authUserId format (must be UUID): ${props.authUserId}`);
    }

    const emailVo = createEmail(props.email);
    if (!emailVo) {
      throw new Error(`Invalid email provided: ${props.email}`);
    }

    const phoneVo = props.phone
      ? (() => {
          const vo = createPhoneNumber(props.phone);
          return vo ?? undefined;
        })()
      : undefined;

    if (props.phone && !phoneVo) {
      throw new Error(`Invalid phone number provided: ${props.phone}`);
    }

    // ⚠️ КРИТИЧЕСКОЕ: Используем authUserId как ID пользователя
    // Это гарантирует согласованность между сервисами
    const userIdVo = unsafeCreateUserId(props.authUserId);

    const user = new User({
      id: userIdVo, // ⚠️ ТОЧНО СОВПАДАЕТ С authUserId
      email: emailVo,
      firstName: props.firstName,
      lastName: props.lastName,
      phone: phoneVo,
      avatarUrl: props.avatarUrl,
      status: UserStatus.ACTIVE, // Новые пользователи всегда активны
      isVerified: props.isVerified || false,
      metadata: {
        authUserId: props.authUserId, // Дублируем для удобства
        source: 'auth-service-registration',
        originalEventTimestamp: new Date().toISOString(),
        ...props.metadata,
      },
      createdAt: toISO8601Date(new Date()),
      updatedAt: toISO8601Date(new Date()),
    });

    return user;
  }

  /**
   * Фабричный метод для создания пользователя с гарантированной согласованностью
   * Выбирает правильный метод создания в зависимости от контекста
   */
  static createWithContext(context: {
    source: 'auth-event' | 'manual' | 'migration';
    data: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      avatarUrl?: string;
      authUserId?: string;
      isVerified?: boolean;
      metadata?: Record<string, any>;
    };
  }): User {
    switch (context.source) {
      case 'auth-event':
        if (!context.data.authUserId) {
          throw new Error('authUserId is required when source is "auth-event"');
        }
        return User.createFromAuthEvent({
          authUserId: context.data.authUserId,
          email: context.data.email,
          firstName: context.data.firstName,
          lastName: context.data.lastName,
          phone: context.data.phone,
          avatarUrl: context.data.avatarUrl,
          isVerified: context.data.isVerified,
          metadata: context.data.metadata,
        });

      case 'manual':
      case 'migration':
        return User.create({
          email: context.data.email,
          firstName: context.data.firstName,
          lastName: context.data.lastName,
          phone: context.data.phone,
          avatarUrl: context.data.avatarUrl,
          authUserId: context.data.authUserId,
          isVerified: context.data.isVerified,
        });

      default:
        throw new Error(`Unknown context source: ${context.source}`);
    }
  }

  // ============================================
  // ВАЛИДАЦИОННЫЕ МЕТОДЫ
  // ============================================

  /**
   * Проверяет, совпадает ли ID пользователя с authUserId
   * Для отладки и валидации согласованности
   */
  validateAuthIdConsistency(): boolean {
    const authUserId = this.metadata?.authUserId;
    if (!authUserId) {
      // Нет authUserId в metadata - возможно создан вручную
      return true;
    }
    
    return this.id === authUserId;
  }

  /**
   * Получает authUserId из metadata
   * Возвращает undefined если пользователь создан не из auth-service
   */
  getAuthUserId(): string | undefined {
    return this.metadata?.authUserId;
  }

  /**
   * Проверяет, был ли пользователь создан из auth-service
   */
  isFromAuthService(): boolean {
    return this.metadata?.source === 'auth-service' || 
           this.metadata?.source === 'auth-service-registration';
  }
}