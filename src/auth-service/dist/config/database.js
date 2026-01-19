"use strict";
// import { Pool, PoolConfig } from 'pg';
// import dotenv from 'dotenv';
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
// dotenv.config();
// const dbConfig: PoolConfig = {
//   host: process.env.DB_HOST || 'localhost',
//   port: parseInt(process.env.DB_PORT || '5432'),
//   database: process.env.DB_NAME || 'auth_db',
//   user: process.env.DB_USER || 'admin',
//   password: process.env.DB_PASSWORD || 'secret',
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
// };
// class Database {
//   private static instance: Database;
//   private pool: Pool;
//   private constructor() {
//     this.pool = new Pool(dbConfig);
//     this.setupEventListeners();
//   }
//   public static getInstance(): Database {
//     if (!Database.instance) {
//       Database.instance = new Database();
//     }
//     return Database.instance;
//   }
//   private setupEventListeners(): void {
//     this.pool.on('connect', () => {
//       console.log('New client connected to PostgreSQL');
//     });
//     this.pool.on('error', (err: Error) => {
//       console.error('Unexpected error on idle PostgreSQL client', err);
//     });
//   }
//   public async query(text: string, params?: any[]): Promise<any> {
//     const start = Date.now();
//     try {
//       const result = await this.pool.query(text, params);
//       const duration = Date.now() - start;
//       console.log('Executed query', { text, duration, rows: result.rowCount });
//       return result;
//     } catch (error) {
//       console.error('Error executing query', { text, error });
//       throw error;
//     }
//   }
//   public async connect(): Promise<void> {
//     try {
//       // Тестируем соединение с простым запросом
//       await this.pool.query('SELECT NOW()');
//       console.log('PostgreSQL connected successfully');
//     } catch (error) {
//       console.error('PostgreSQL connection error:', error);
//       throw error;
//     }
//   }
//   public async disconnect(): Promise<void> {
//     await this.pool.end();
//     console.log('PostgreSQL disconnected');
//   }
//   public getPool(): Pool {
//     return this.pool;
//   }
// }
// export default Database.getInstance();
// Переименовываем старый database.ts в database-legacy.ts
// И создаем новый с TypeORM
var database_typeorm_1 = require("./database-typeorm");
Object.defineProperty(exports, "AppDataSource", { enumerable: true, get: function () { return database_typeorm_1.AppDataSource; } });
Object.defineProperty(exports, "initializeDatabase", { enumerable: true, get: function () { return database_typeorm_1.initializeDatabase; } });
//# sourceMappingURL=database.js.map