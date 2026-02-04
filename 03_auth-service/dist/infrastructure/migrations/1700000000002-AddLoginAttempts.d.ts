import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddLoginAttempts1700000000002 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
