// ./03_auth-service/src/infrastructure/persistence/entities/Permission.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 100 })
  code!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string;

  @Column({ length: 50 })
  module!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}