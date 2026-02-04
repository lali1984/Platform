"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixOutboxTableConstraints1700000000002 = void 0;
class FixOutboxTableConstraints1700000000002 {
    async up(queryRunner) {
        await queryRunner.startTransaction();
        try {
            const constraintExists = await queryRunner.query(`
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'outbox_events' 
        AND constraint_name = 'valid_status' 
        AND constraint_type = 'CHECK'
        AND table_schema = 'public'
      `);
            if (constraintExists.length > 0) {
                console.log('Constraint valid_status already exists, skipping...');
            }
            else {
                await queryRunner.query(`
          ALTER TABLE outbox_events 
          ADD CONSTRAINT valid_status 
          CHECK (status IN ('pending', 'processing', 'published', 'failed', 'completed'))
        `);
                console.log('Constraint valid_status added successfully');
            }
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
                    await queryRunner.query(index.query);
                    console.log(`Index ${index.name} created successfully`);
                }
            }
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Migration failed:', error);
            throw error;
        }
    }
    async down(queryRunner) {
        await queryRunner.startTransaction();
        try {
            await queryRunner.query(`
        ALTER TABLE outbox_events 
        DROP CONSTRAINT IF EXISTS valid_status
      `);
            const indexes = ['idx_outbox_events_status', 'idx_outbox_events_created_at', 'idx_outbox_events_type'];
            for (const indexName of indexes) {
                await queryRunner.query(`
          DROP INDEX CONCURRENTLY IF EXISTS ${indexName}
        `);
            }
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
    }
}
exports.FixOutboxTableConstraints1700000000002 = FixOutboxTableConstraints1700000000002;
//# sourceMappingURL=1700000000002-FixOutboxTableConstraints.js.map