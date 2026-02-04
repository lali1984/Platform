"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMissingIndexes1700000000003 = void 0;
class AddMissingIndexes1700000000003 {
    async up(queryRunner) {
        await queryRunner.startTransaction();
        try {
            await queryRunner.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_user_id 
        ON user_profiles(user_id)
      `);
            await queryRunner.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_first_last_name 
        ON user_profiles(first_name, last_name) 
        WHERE first_name IS NOT NULL OR last_name IS NOT NULL
      `);
            await queryRunner.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_location 
        ON user_profiles(country, region, city) 
        WHERE country IS NOT NULL
      `);
            await queryRunner.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_updated_at 
        ON user_profiles(updated_at)
      `);
            await queryRunner.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_deleted_at 
        ON user_profiles(deleted_at) 
        WHERE deleted_at IS NOT NULL
      `);
            await queryRunner.query(`ANALYZE user_profiles`);
            await queryRunner.commitTransaction();
            console.log('✅ Migration 1700000000003 completed: Added critical indexes to user_profiles');
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
    }
}
exports.AddMissingIndexes1700000000003 = AddMissingIndexes1700000000003;
//# sourceMappingURL=1700000000003-AddMissingIndexes.js.map