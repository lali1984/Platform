import { DataSource } from 'typeorm';
export declare class MigrationRunner {
    private dataSource;
    constructor(dataSource: DataSource);
    runSafeMigrations(): Promise<void>;
    private ensureMigrationTable;
}
