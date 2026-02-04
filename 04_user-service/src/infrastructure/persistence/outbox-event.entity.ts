import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('outbox_events')
export class OutboxEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  type!: string;

  @Column('jsonb')
  payload!: Record<string, any>;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @Column({ default: 'pending' })
  @Index()
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