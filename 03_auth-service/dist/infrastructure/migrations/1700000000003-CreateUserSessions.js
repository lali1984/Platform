"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserSessions1700000000003 = void 0;
const typeorm_1 = require("typeorm");
class CreateUserSessions1700000000003 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'user_sessions',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                },
                {
                    name: 'user_id',
                    type: 'uuid',
                    isNullable: false,
                },
                {
                    name: 'refresh_token_hash',
                    type: 'varchar',
                    length: '255',
                    isNullable: false,
                },
                {
                    name: 'ip_address',
                    type: 'varchar',
                    length: '45',
                    isNullable: true,
                },
                {
                    name: 'user_agent',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'device_info',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true,
                },
                {
                    name: 'last_activity_at',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'expires_at',
                    type: 'timestamp',
                    isNullable: false,
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'now()',
                },
            ],
        }), true);
        await queryRunner.createIndex('user_sessions', new typeorm_1.TableIndex({
            name: 'IDX_USER_SESSIONS_USER_ID',
            columnNames: ['user_id'],
        }));
        await queryRunner.createIndex('user_sessions', new typeorm_1.TableIndex({
            name: 'IDX_USER_SESSIONS_REFRESH_TOKEN_HASH',
            columnNames: ['refresh_token_hash'],
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('user_sessions');
    }
}
exports.CreateUserSessions1700000000003 = CreateUserSessions1700000000003;
//# sourceMappingURL=1700000000003-CreateUserSessions.js.map