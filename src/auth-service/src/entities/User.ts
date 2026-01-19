// src/entities/User.ts - обновляем
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, Index } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @Index()
  email!: string;

  @Column({ unique: true, nullable: true })
  @Index()
  username?: string;

  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified!: boolean;

  @Column({ name: 'two_factor_secret', nullable: true })
  twoFactorSecret?: string;

  @Column({ name: 'is_two_factor_enabled', default: false })
  isTwoFactorEnabled!: boolean;

  @Column({ name: 'reset_password_token', nullable: true })
  resetPasswordToken?: string;

  @Column({ name: 'reset_password_expires', nullable: true })
  resetPasswordExpires?: Date;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Метод для проверки пароля
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  // Хук перед вставкой
  @BeforeInsert()
  async hashPasswordOnInsert() {
    if (this.passwordHash && !this.passwordHash.startsWith('$2b$')) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
  }

  // Хук перед обновлением (если обновляется пароль)
  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    // Можно добавить логику если нужно
  }

  // Вспомогательный метод для установки пароля
  async setPassword(password: string): Promise<void> {
    this.passwordHash = await bcrypt.hash(password, 10);
  }
}