"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInitialTables1700000000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateInitialTables1700000000000 {
    async up(queryRunner) {
        // Создаем таблицу users
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'users',
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
                    isUnique: true,
                    isNullable: false,
                },
                {
                    name: 'passwordHash',
                    type: 'varchar',
                    length: '255',
                    isNullable: false,
                },
                {
                    name: 'username',
                    type: 'varchar',
                    length: '100',
                    isUnique: true,
                    isNullable: true,
                },
                {
                    name: 'firstName',
                    type: 'varchar',
                    length: '100',
                    isNullable: true,
                },
                {
                    name: 'lastName',
                    type: 'varchar',
                    length: '100',
                    isNullable: true,
                },
                {
                    name: 'isActive',
                    type: 'boolean',
                    default: true,
                },
                {
                    name: 'isEmailVerified',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'isTwoFactorEnabled',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'twoFactorSecret',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'lastLoginAt',
                    type: 'timestamp',
                    isNullable: true,
                },
            ],
        }), true);
        // Создаем индексы для таблицы users
        await queryRunner.createIndex('users', new typeorm_1.TableIndex({
            name: 'IDX_USERS_EMAIL',
            columnNames: ['email'],
        }));
        await queryRunner.createIndex('users', new typeorm_1.TableIndex({
            name: 'IDX_USERS_USERNAME',
            columnNames: ['username'],
        }));
        // Создаем таблицу outbox_events
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'outbox_events',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
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
                },
                {
                    name: 'status',
                    type: 'varchar',
                    length: '20',
                    default: "'pending'",
                },
                {
                    name: 'attempts',
                    type: 'integer',
                    default: 0,
                },
                {
                    name: 'error',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'processedAt',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'now()',
                },
            ],
        }), true);
        // Создаем индексы для таблицы outbox_events
        await queryRunner.createIndex('outbox_events', new typeorm_1.TableIndex({
            name: 'IDX_OUTBOX_EVENTS_STATUS',
            columnNames: ['status'],
        }));
        await queryRunner.createIndex('outbox_events', new typeorm_1.TableIndex({
            name: 'IDX_OUTBOX_EVENTS_CREATED_AT',
            columnNames: ['createdAt'],
        }));
    }
    async down(queryRunner) {
        // Удаляем таблицы в обратном порядке
        await queryRunner.dropTable('outbox_events');
        await queryRunner.dropTable('users');
    }
}
exports.CreateInitialTables1700000000000 = CreateInitialTables1700000000000;
//# sourceMappingURL=1700000000000-CreateInitialTables.js.map