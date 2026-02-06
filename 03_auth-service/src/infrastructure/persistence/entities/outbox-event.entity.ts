// 03_auth-service/src/infrastructure/persistence/entities/OutboxEvent.entity.ts
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('outbox_events')
export class OutboxEvent {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  type!: string;

  @Column('jsonb')
  payload!: Record<string, any>;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending'
  })
  status!: 'pending' | 'processing' | 'published' | 'failed' | 'completed';

  @Column({ default: 0 })
  attempts!: number;

  @Column({ nullable: true })
  error?: string;

  @Column({ nullable: true, name: 'error_message' })
  errorMessage?: string;

  @Column({ nullable: true, name: 'processed_at' })
  processedAt?: Date;

  @Column({ nullable: true, name: 'last_attempt_at' })
  lastAttemptAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}