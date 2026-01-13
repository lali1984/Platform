"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'auth_db',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'secret',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};
class Database {
    constructor() {
        this.pool = new pg_1.Pool(dbConfig);
        this.setupEventListeners();
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    setupEventListeners() {
        this.pool.on('connect', () => {
            console.log('New client connected to PostgreSQL');
        });
        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle PostgreSQL client', err);
        });
    }
    async query(text, params) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            console.log('Executed query', { text, duration, rows: result.rowCount });
            return result;
        }
        catch (error) {
            console.error('Error executing query', { text, error });
            throw error;
        }
    }
    async connect() {
        try {
            // Тестируем соединение с простым запросом
            await this.pool.query('SELECT NOW()');
            console.log('PostgreSQL connected successfully');
        }
        catch (error) {
            console.error('PostgreSQL connection error:', error);
            throw error;
        }
    }
    async disconnect() {
        await this.pool.end();
        console.log('PostgreSQL disconnected');
    }
    getPool() {
        return this.pool;
    }
}
exports.default = Database.getInstance();
//# sourceMappingURL=database.js.map