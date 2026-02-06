// Обновленный User.entity.ts
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserRoleEntity } from './user-role.entity'; // Добавить импорт

@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ nullable: true, unique: true })
  username?: string;

  @Column({ nullable: true, name: 'first_name' })
  firstName?: string;

  @Column({ nullable: true, name: 'last_name' })
  lastName?: string;

  @Column({ default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ default: false, name: 'is_email_verified' })
  isEmailVerified!: boolean;

  @Column({ default: false, name: 'is_two_factor_enabled' })
  isTwoFactorEnabled!: boolean;

  @Column({ nullable: true, name: 'two_factor_secret' })
  twoFactorSecret?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ nullable: true, name: 'last_login_at' })
  lastLoginAt?: Date;

  // Связь с ролями (опционально, можно оставить в отдельном репозитории)
  @OneToMany(() => UserRoleEntity, userRole => userRole.userId)
  userRoles?: UserRoleEntity[];
}