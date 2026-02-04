"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionOutbox1700000000004 = void 0;
class PartitionOutbox1700000000004 {
    async up(queryRunner) {
        await queryRunner.startTransaction();
        try {
            const partitionCheck = await queryRunner.query(`
        SELECT relkind FROM pg_class WHERE relname = 'outbox_events'
      `);
            if (partitionCheck.length > 0 && partitionCheck[0].relkind === 'p') {
                console.log('Partitioning already exists, skipping...');
                await queryRunner.commitTransaction();
                return;
            }
            await queryRunner.query(`
        ALTER TABLE outbox_events 
        PARTITION BY RANGE (created_at)
      `);
            const now = new Date();
            for (let i = 0; i < 12; i++) {
                const startDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
                const endDate = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
                const startMonth = startDate.toISOString().slice(0, 7);
                const endMonth = endDate.toISOString().slice(0, 7);
                const partitionName = `outbox_events_p${startMonth.replace('-', '')}`;
                await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS ${partitionName} 
          PARTITION OF outbox_events 
          FOR VALUES FROM ('${startMonth}-01') TO ('${endMonth}-01')
        `);
                await queryRunner.query(`
          CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_${partitionName}_status 
          ON ${partitionName}(status) 
          WHERE status IN ('pending', 'failed')
        `);
                await queryRunner.query(`
          CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_${partitionName}_type 
          ON ${partitionName}(type)
        `);
                await queryRunner.query(`
          CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_${partitionName}_created_at 
          ON ${partitionName}(created_at)
        `);
            }
            await queryRunner.commitTransaction();
            console.log('✅ Migration 1700000000004 completed: Partitioned outbox_events by month');
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
        DETACH PARTITION outbox_events_p202601
      `);
            const now = new Date();
            for (let i = 0; i < 12; i++) {
                const startDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
                const partitionName = `outbox_events_p${startDate.toISOString().slice(0, 7).replace('-', '')}`;
                await queryRunner.query(`DROP TABLE IF EXISTS ${partitionName}`);
            }
            await queryRunner.commitTransaction();
            console.log('✅ Migration 1700000000004 rolled back');
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
    }
}
exports.PartitionOutbox1700000000004 = PartitionOutbox1700000000004;
//# sourceMappingURL=1700000000004-PartitionOutbox.js.map