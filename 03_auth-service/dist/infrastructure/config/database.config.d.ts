import { DataSource } from 'typeorm';
export declare const createDataSource: () => DataSource;
export declare const initializeDatabase: (dataSource: DataSource) => Promise<void>;
