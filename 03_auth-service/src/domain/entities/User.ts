import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserId, unsafeCreateUserId } from '@platform/contracts';
import { Email, createEmail } from '@platform/contracts';
import { ISO8601Date, toISO8601Date } from '@platform/contracts';

export interface UserProps {
  id: UserId;
  email: Email;
  passwordHash: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: ISO8601Date;
  updatedAt: ISO8601Date;
  lastLoginAt?: ISO8601Date;
}

export class User {
  private props: UserProps;
  private domainEvents: Array<{ type: string; data: any }> = [];

  private constructor(props: UserProps) {
    this.props = props;
  }

  public static async create(data: {
    email: string;
    password: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    const passwordHash = await User.hashPassword(data.password);
    const emailObj = createEmail(data.email.toLowerCase().trim());
    if (!emailObj) {
      throw new Error('Invalid email format');
    }

    const user = new User({
      id: unsafeCreateUserId(crypto.randomUUID()),
      email: emailObj,
      passwordHash,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      isActive: true,
      isEmailVerified: false,
      isTwoFactorEnabled: false,
      createdAt: toISO8601Date(new Date()),
      updatedAt: toISO8601Date(new Date()),
    });

    user.addDomainEvent('UserRegistered', {
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return user;
  }

  public static fromPersistence(props: Omit<UserProps, 'id' | 'email' | 'createdAt' | 'updatedAt' | 'lastLoginAt'> & {
    id: string;
    email: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    lastLoginAt?: string | Date;
  }): User {
    const emailObj = createEmail(props.email);
    if (!emailObj) {
      throw new Error(`Invalid email in persistence: ${props.email}`);
    }
    return new User({
      ...props,
      id: unsafeCreateUserId(props.id),
      email: emailObj,
      createdAt: toISO8601Date(new Date(props.createdAt)),
      updatedAt: toISO8601Date(new Date(props.updatedAt)),
      lastLoginAt: props.lastLoginAt ? toISO8601Date(new Date(props.lastLoginAt)) : undefined,
    });
  }

  private static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12); // 🔴 Увеличено до 12 для продакшена
    return bcrypt.hash(password, salt);
  }

  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.props.passwordHash);
  }

  public login(): void {
    const now = toISO8601Date(new Date());
    this.props.lastLoginAt = now;
    this.props.updatedAt = now;
    this.addDomainEvent('UserLoggedIn', {
      userId: this.id,
      timestamp: now,
    });
  }

  public enableTwoFactor(secret: string): void {
    this.props.isTwoFactorEnabled = true;
    this.props.twoFactorSecret = secret;
    this.props.updatedAt = toISO8601Date(new Date());
    this.addDomainEvent('TwoFactorEnabled', {
      userId: this.id,
      timestamp: toISO8601Date(new Date()),
    });
  }

  public disableTwoFactor(): void {
    this.props.isTwoFactorEnabled = false;
    this.props.twoFactorSecret = undefined;
    this.props.updatedAt = toISO8601Date(new Date());
  }

  public verifyEmail(): void {
    this.props.isEmailVerified = true;
    this.props.updatedAt = toISO8601Date(new Date());
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = toISO8601Date(new Date());
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = toISO8601Date(new Date());
  }

  private addDomainEvent(type: string, data: any): void {
    this.domainEvents.push({ type, data });
  }

  public getDomainEvents(): Array<{ type: string; data: any }> {
    return [...this.domainEvents];
  }

  public clearDomainEvents(): void {
    this.domainEvents = [];
  }

  // Getters
  get id(): UserId {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get username(): string | undefined {
    return this.props.username;
  }

  get firstName(): string | undefined {
    return this.props.firstName;
  }

  get lastName(): string | undefined {
    return this.props.lastName;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get isEmailVerified(): boolean {
    return this.props.isEmailVerified;
  }

  get isTwoFactorEnabled(): boolean {
    return this.props.isTwoFactorEnabled;
  }

  get createdAt(): ISO8601Date {
    return this.props.createdAt;
  }

  get updatedAt(): ISO8601Date {
    return this.props.updatedAt;
  }

  get lastLoginAt(): ISO8601Date | undefined {
    return this.props.lastLoginAt;
  }

  // Для persistence
  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get twoFactorSecret(): string | undefined {
    return this.props.twoFactorSecret;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      isActive: this.isActive,
      isEmailVerified: this.isEmailVerified,
      isTwoFactorEnabled: this.isTwoFactorEnabled,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLoginAt: this.lastLoginAt,
    };
  }
}