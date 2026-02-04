// ./04_user-service/src/infrastructure/migrations/1700000000002-AddUserProfileFields.ts
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserProfileFields1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Добавляем email поле
    await queryRunner.addColumn(
      'user_profiles',
      new TableColumn({
        name: 'email',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // 2. Добавляем status поле
    await queryRunner.addColumn(
      'user_profiles',
      new TableColumn({
        name: 'status',
        type: 'varchar',
        length: '20',
        default: "'ACTIVE'",
      }),
    );

    // 3. Добавляем is_verified поле
    await queryRunner.addColumn(
      'user_profiles',
      new TableColumn({
        name: 'is_verified',
        type: 'boolean',
        default: false,
      }),
    );

    // 4. Добавляем metadata поле
    await queryRunner.addColumn(
      'user_profiles',
      new TableColumn({
        name: 'metadata',
        type: 'jsonb',
        default: "'{}'",
      }),
    );

    // 5. Создаем индексы
    await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
        ON user_profiles(email) 
        WHERE email IS NOT NULL`
    );

    await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_user_profiles_status 
        ON user_profiles(status)
    `);

    await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_user_profiles_is_verified 
        ON user_profiles(is_verified)
    `);

    // 6. Обновляем существующие записи
    // Если email нет в user_profiles, можно взять из связанного auth пользователя
    // Но так как у нас нет прямой связи между БД, оставляем NULL
    // В production нужно будет запустить data migration
    
    console.log('✅ Migration 1700000000002 completed: Added email, status, is_verified, metadata fields to user_profiles');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем индексы
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_is_verified');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_status');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_email');

    // Удаляем колонки
    await queryRunner.dropColumn('user_profiles', 'metadata');
    await queryRunner.dropColumn('user_profiles', 'is_verified');
    await queryRunner.dropColumn('user_profiles', 'status');
    await queryRunner.dropColumn('user_profiles', 'email');

    console.log('✅ Migration 1700000000002 rolled back');
  }
}