import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class SyncUserSchema1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Добавляем недостающие поля из init-auth.sql
    const columnsToAdd = [
      new TableColumn({
        name: 'locked_until',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
      new TableColumn({
        name: 'failed_login_attempts',
        type: 'integer',
        default: 0,
      }),
      new TableColumn({
        name: 'backup_codes',
        type: 'text',
        isArray: true,
        isNullable: true,
      }),
      new TableColumn({
        name: 'reset_password_token',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'reset_password_expires',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
      new TableColumn({
        name: 'profile_id',
        type: 'uuid',
        isNullable: true,
        isUnique: true,
      }),
      new TableColumn({
        name: 'created_by',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'updated_by',
        type: 'uuid',
        isNullable: true,
      }),
    ];

    for (const column of columnsToAdd) {
      await queryRunner.addColumn('users', column);
    }

    // 2. Обновляем outbox_events
    await queryRunner.addColumn(
      'outbox_events',
      new TableColumn({
        name: 'last_attempt_at',
        type: 'timestamp with time zone',
        isNullable: true,
      })
    );

    // 3. Добавляем отсутствующие индексы
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_locked_until 
      ON users(locked_until) 
      WHERE locked_until IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_is_locked 
      ON users(is_locked) 
      WHERE is_locked = TRUE
    `);

    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_reset_password_expires 
      ON users(reset_password_expires) 
      WHERE reset_password_expires IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_outbox_events_last_attempt_at 
      ON outbox_events(last_attempt_at) 
      WHERE last_attempt_at IS NOT NULL
    `);

    // 4. Добавляем триггер для обновления updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON users 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('✅ Migration 1700000000001 completed: Synced users schema with init-auth.sql');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем триггер
    await queryRunner.query('DROP TRIGGER IF EXISTS update_users_updated_at ON users');
    
    // Удаляем функцию
    await queryRunner.query('DROP FUNCTION IF EXISTS update_updated_at_column');

    // Удаляем индексы
    const indexes = [
      'idx_users_locked_until',
      'idx_users_is_locked',
      'idx_users_reset_password_expires',
      'idx_outbox_events_last_attempt_at',
    ];

    for (const index of indexes) {
      await queryRunner.query(`DROP INDEX IF EXISTS ${index}`);
    }

    // Удаляем колонки в обратном порядке
    const columnsToRemove = [
      'updated_by',
      'created_by',
      'profile_id',
      'reset_password_expires',
      'reset_password_token',
      'backup_codes',
      'failed_login_attempts',
      'locked_until',
    ];

    for (const column of columnsToRemove) {
      await queryRunner.dropColumn('users', column);
    }

    await queryRunner.dropColumn('outbox_events', 'last_attempt_at');

    console.log('✅ Migration 1700000000001 rolled back');
  }
}