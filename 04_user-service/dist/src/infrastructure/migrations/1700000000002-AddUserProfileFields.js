"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserProfileFields1700000000002 = void 0;
const typeorm_1 = require("typeorm");
class AddUserProfileFields1700000000002 {
    async up(queryRunner) {
        await queryRunner.addColumn('user_profiles', new typeorm_1.TableColumn({
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
        }));
        await queryRunner.addColumn('user_profiles', new typeorm_1.TableColumn({
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'ACTIVE'",
        }));
        await queryRunner.addColumn('user_profiles', new typeorm_1.TableColumn({
            name: 'is_verified',
            type: 'boolean',
            default: false,
        }));
        await queryRunner.addColumn('user_profiles', new typeorm_1.TableColumn({
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
        }));
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
        ON user_profiles(email) 
        WHERE email IS NOT NULL`);
        await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_user_profiles_status 
        ON user_profiles(status)
    `);
        await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_user_profiles_is_verified 
        ON user_profiles(is_verified)
    `);
        console.log('✅ Migration 1700000000002 completed: Added email, status, is_verified, metadata fields to user_profiles');
    }
    async down(queryRunner) {
        await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_is_verified');
        await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_status');
        await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_email');
        await queryRunner.dropColumn('user_profiles', 'metadata');
        await queryRunner.dropColumn('user_profiles', 'is_verified');
        await queryRunner.dropColumn('user_profiles', 'status');
        await queryRunner.dropColumn('user_profiles', 'email');
        console.log('✅ Migration 1700000000002 rolled back');
    }
}
exports.AddUserProfileFields1700000000002 = AddUserProfileFields1700000000002;
//# sourceMappingURL=1700000000002-AddUserProfileFields.js.map