"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationRunner = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let MigrationRunner = class MigrationRunner {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async runSafeMigrations() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            await this.ensureMigrationTable();
            const migrationFiles = await this.getMigrationFiles();
            for (const migration of migrationFiles) {
                const alreadyExecuted = await this.checkMigrationExecuted(migration.name);
                if (!alreadyExecuted) {
                    console.log(`Executing migration: ${migration.name}`);
                    await queryRunner.startTransaction();
                    try {
                        await migration.up(queryRunner);
                        await this.markMigrationAsExecuted(migration.name);
                        await queryRunner.commitTransaction();
                    }
                    catch (error) {
                        await queryRunner.rollbackTransaction();
                        console.error(`Migration ${migration.name} failed:`, error);
                        throw error;
                    }
                }
                else {
                    console.log(`Migration ${migration.name} already executed, skipping`);
                }
            }
        }
        finally {
            await queryRunner.release();
        }
    }
    async ensureMigrationTable() {
        await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS custom_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        checksum VARCHAR(64),
        status VARCHAR(20) DEFAULT 'completed'
      )
    `);
    }
};
exports.MigrationRunner = MigrationRunner;
exports.MigrationRunner = MigrationRunner = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], MigrationRunner);
//# sourceMappingURL=migration-runner.service.js.map