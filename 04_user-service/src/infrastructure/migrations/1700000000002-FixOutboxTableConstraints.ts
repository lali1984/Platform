// 1700000000002-FixOutboxTableConstraints.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixOutboxTableConstraints1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Используем транзакцию для атомарности
    await queryRunner.startTransaction();
    
    try {
      // 1. Проверяем существование constraint
      const constraintExists = await queryRunner.query(`
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'outbox_events' 
        AND constraint_name = 'valid_status' 
        AND constraint_type = 'CHECK'
        AND table_schema = 'public'
      `);
      
      if (constraintExists.length > 0) {
        console.log('Constraint valid_status already exists, skipping...');
      } else {
        // 2. Добавляем constraint только если не существует
        await queryRunner.query(`
          ALTER TABLE outbox_events 
          ADD CONSTRAINT valid_status 
          CHECK (status IN ('pending', 'processing', 'published', 'failed', 'completed'))
        `);
        console.log('Constraint valid_status added successfully');
      }
      
      // 3. Проверяем и добавляем недостающие индексы идемпотентно
      const indexes = [
        { name: 'idx_outbox_events_status', query: "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_outbox_events_status ON outbox_events(status) WHERE status IN ('pending', 'failed')" },
        { name: 'idx_outbox_events_created_at', query: "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_outbox_events_created_at ON outbox_events(created_at)" },
        { name: 'idx_outbox_events_type', query: "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_outbox_events_type ON outbox_events(type)" }
      ];
      
      for (const index of indexes) {
        const indexExists = await queryRunner.query(`
          SELECT 1 FROM pg_indexes 
          WHERE tablename = 'outbox_events' 
          AND indexname = '${index.name}'
        `);
        
        if (indexExists.length === 0) {
          // Используем CONCURRENTLY для безопасного создания в production
          await queryRunner.query(index.query);
          console.log(`Index ${index.name} created successfully`);
        }
      }
      
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Migration failed:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Для down миграции также используем транзакцию
    await queryRunner.startTransaction();
    
    try {
      // Удаляем constraint если существует
      await queryRunner.query(`
        ALTER TABLE outbox_events 
        DROP CONSTRAINT IF EXISTS valid_status
      `);
      
      // Удаляем индексы если существуют
      const indexes = ['idx_outbox_events_status', 'idx_outbox_events_created_at', 'idx_outbox_events_type'];
      
      for (const indexName of indexes) {
        await queryRunner.query(`
          DROP INDEX CONCURRENTLY IF EXISTS ${indexName}
        `);
      }
      
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}