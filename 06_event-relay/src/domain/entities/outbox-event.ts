import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('outbox_events')
export class OutboxEvent {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  type!: string;

  @Column()
  version!: string;

  @Column({ nullable: true })
  aggregateId?: string;

  @Column('jsonb')
  payload!: Record<string, any>;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @Column()
  status!: 'pending' | 'processing' | 'completed' | 'failed';

  @Column({ default: 0 })
  attempts!: number;

  @Column({ nullable: true })
  error?: string;

  @Column({ nullable: true, name: 'error_message' })
  errorMessage?: string;

  @Column({ nullable: true, name: 'processed_at' })
  processedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}