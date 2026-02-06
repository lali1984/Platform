import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('user_profiles')
export class UserProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Link to auth_db.users.id — NOT a local email field
  @Column('uuid', { name: 'user_id', unique: true })
  userId!: string;

  // КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ: добавляем email поле
  // Дублируем email из auth_db.users для удобства и производительности
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  email!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  firstName!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lastName!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  displayName!: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'date', nullable: true })
  dateOfBirth!: Date | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender!: string | null;

  // КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ: добавляем status поле
  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']
  })
  @Index()
  status!: string;

  // КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ: добавляем isVerified поле
  @Column({ type: 'boolean', default: false, name: 'is_verified' })
  @Index()
  isVerified!: boolean;

  // Location
  @Column({ type: 'char', length: 2, nullable: true })
  country!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone!: string | null;

  @Column({ type: 'varchar', length: 10, default: 'en-US' })
  locale!: string;

  // Professional
  @Column({ type: 'varchar', length: 100, nullable: true })
  jobTitle!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  company!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department!: string | null;

  @Column({ type: 'text', nullable: true })
  website!: string | null;

  @Column({ type: 'jsonb', default: '{}' })
  socialLinks!: Record<string, string> | null;

  // Profile metrics
  @Column({ type: 'int', default: 0, name: 'profile_completion_percentage' })
  profileCompletionPercentage!: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_active_at' })
  lastActiveAt!: Date | null;

  @Column({ type: 'int', default: 0, name: 'profile_views' })
  profileViews!: number;

  // System fields
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  // Audit
  @Column('uuid', { name: 'created_by', nullable: true })
  createdBy!: string | null;

  @Column('uuid', { name: 'updated_by', nullable: true })
  updatedBy!: string | null;

  // Metadata для дополнительных данных
  @Column({ type: 'jsonb', default: '{}', name: 'metadata' })
  metadata!: Record<string, any>;

  // Indexes (matching init-user.sql)
  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'display_name' })
  displayNameForIndex!: string | null;

  @Index()
  @Column({ type: 'char', length: 2, nullable: true, name: 'country' })
  countryForIndex!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'city' })
  cityForIndex!: string | null;

  @Index()
  @Column({ type: 'timestamptz', nullable: true, name: 'last_active_at' })
  lastActiveAtForIndex!: Date | null;
}