// ./03_auth-service/src/infrastructure/persistence/entities/UserRole.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('user_roles')
export class UserRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId!: string;

  @Column({ name: 'assigned_by', type: 'uuid', nullable: true })
  assignedBy!: string;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt!: Date;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt!: Date;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}