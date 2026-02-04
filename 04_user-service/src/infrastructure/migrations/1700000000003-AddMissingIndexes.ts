import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingIndexes1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();
    try {
      // 1. Критически важный индекс для связи с auth_db
      await queryRunner.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_user_id 
        ON user_profiles(user_id)
      `);

      // 2. Индекс для поиска по имени
      await queryRunner.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_first_last_name 
        ON user_profiles(first_name, last_name) 
        WHERE first_name IS NOT NULL OR last_name IS NOT NULL
      `);

      // 3. Индекс для поиска по локации
      await queryRunner.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_location 
        ON user_profiles(country, region, city) 
        WHERE country IS NOT NULL
      `);

      // 4. Индекс для сортировки по дате создания
      await queryRunner.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_updated_at 
        ON user_profiles(updated_at)
      `);

      // 5. Индекс для поиска неактивных пользователей
      await queryRunner.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_deleted_at 
        ON user_profiles(deleted_at) 
        WHERE deleted_at IS NOT NULL
      `);

      // 6. Обновляем статистику для оптимизатора
      await queryRunner.query(`ANALYZE user_profiles`);

      await queryRunner.commitTransaction();
      console.log('✅ Migration 1700000000003 completed: Added critical indexes to user_profiles');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Migration failed:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();
    try {
      const indexes = [
        'idx_user_profiles_user_id',
        'idx_user_profiles_first_last_name',
        'idx_user_profiles_location',
        'idx_user_profiles_updated_at',
        'idx_user_profiles_deleted_at',
      ];

      for (const index of indexes) {
        await queryRunner.query(`DROP INDEX IF EXISTS ${index}`);
      }

      await queryRunner.commitTransaction();
      console.log('✅ Migration 1700000000003 rolled back');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}