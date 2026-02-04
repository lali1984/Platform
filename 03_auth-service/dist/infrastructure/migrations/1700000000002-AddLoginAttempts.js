"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddLoginAttempts1700000000002 = void 0;
const typeorm_1 = require("typeorm");
class AddLoginAttempts1700000000002 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'login_attempts',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                },
                {
                    name: 'email',
                    type: 'varchar',
                    length: '255',
                    isNullable: false,
                },
                {
                    name: 'attempts',
                    type: 'integer',
                    default: 0,
                },
                {
                    name: 'locked_until',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'last_attempt_at',
                    type: 'timestamp',
                    default: 'now()',
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
        await queryRunner.createIndex('login_attempts', new typeorm_1.TableIndex({
            name: 'IDX_LOGIN_ATTEMPTS_EMAIL',
            columnNames: ['email'],
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('login_attempts');
    }
}
exports.AddLoginAttempts1700000000002 = AddLoginAttempts1700000000002;
//# sourceMappingURL=1700000000002-AddLoginAttempts.js.map