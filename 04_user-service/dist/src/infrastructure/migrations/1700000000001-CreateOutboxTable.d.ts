import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateOutboxTable1700000000001 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
