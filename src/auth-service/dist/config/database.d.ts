import { Pool } from 'pg';
declare class Database {
    private static instance;
    private pool;
    private constructor();
    static getInstance(): Database;
    private setupEventListeners;
    query(text: string, params?: any[]): Promise<any>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getPool(): Pool;
}
declare const _default: Database;
export default _default;
//# sourceMappingURL=database.d.ts.map