import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateOutboxTable1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем таблицу outbox_events
    await queryRunner.createTable(
      new Table({
        name: 'outbox_events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'payload',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            default: "'{}'",
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'pending'",
          },
          {
            name: 'attempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'error',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'processed_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'last_attempt_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Добавляем constraint для статуса
    await queryRunner.query(`
      ALTER TABLE outbox_events 
      ADD CONSTRAINT valid_status 
      CHECK (status IN ('pending', 'processing', 'published', 'failed', 'completed'))
    `);

    // Создаем индексы
    await queryRunner.createIndex(
      'outbox_events',
      new TableIndex({
        name: 'idx_outbox_events_status',
        columnNames: ['status'],
        where: "status IN ('pending', 'failed')",
      }),
    );

    await queryRunner.createIndex(
      'outbox_events',
      new TableIndex({
        name: 'idx_outbox_events_created_at',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createIndex(
      'outbox_events',
      new TableIndex({
        name: 'idx_outbox_events_type',
        columnNames: ['type'],
      }),
    );

    // Триггер для обновления updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_outbox_events_updated_at 
      BEFORE UPDATE ON outbox_events 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем триггер
    await queryRunner.query('DROP TRIGGER IF EXISTS update_outbox_events_updated_at ON outbox_events');
    
    // Удаляем функцию
    await queryRunner.query('DROP FUNCTION IF EXISTS update_updated_at_column');
    
    // Удаляем таблицу
    await queryRunner.dropTable('outbox_events');
  }
}