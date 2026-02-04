"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = exports.DatabaseConfig = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class DatabaseConfig {
    constructor() {
        this.services = [];
        this.dataSources = new Map();
        this.loadServiceConfigs();
    }
    validatePort(portStr) {
        const port = parseInt(portStr, 10);
        if (isNaN(port) || port < 1 || port > 65535) {
            throw new Error(`Invalid port: ${portStr}`);
        }
        return port;
    }
    loadServiceConfigs() {
        // Конфигурация auth-service
        try {
            this.services.push({
                name: 'auth-service',
                host: process.env.AUTH_DB_HOST || 'postgres-auth',
                port: this.validatePort(process.env.AUTH_DB_PORT || '5432'),
                username: process.env.AUTH_DB_USERNAME || 'admin',
                password: process.env.AUTH_DB_PASSWORD || 'secret',
                database: process.env.AUTH_DB_DATABASE || 'auth_db',
                outboxTable: 'outbox_events'
            });
        }
        catch (error) {
            console.error('❌ Invalid auth-service database configuration:', error);
            throw error;
        }
        // Конфигурация user-service
        try {
            this.services.push({
                name: 'user-service',
                host: process.env.USER_DB_HOST || 'postgres-user',
                port: this.validatePort(process.env.USER_DB_PORT || '5432'),
                username: process.env.USER_DB_USERNAME || 'admin',
                password: process.env.USER_DB_PASSWORD || 'secret',
                database: process.env.USER_DB_DATABASE || 'user_db',
                outboxTable: 'outbox_events'
            });
        }
        catch (error) {
            console.error('❌ Invalid user-service database configuration:', error);
            throw error;
        }
        console.log(`📊 Loaded ${this.services.length} service database configurations`);
    }
    createDataSourceOptions(config) {
        return {
            type: 'postgres',
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            database: config.database,
            synchronize: false,
            logging: ['error'],
            entities: [], // Не регистрируем сущности, используем raw queries
            migrations: [],
            subscribers: [],
            extra: {
                max: 10,
                connectionTimeoutMillis: 5000,
            },
        };
    }
    async initializeDataSources() {
        console.log('🔌 Initializing database connections...');
        for (const service of this.services) {
            try {
                const options = this.createDataSourceOptions(service);
                const dataSource = new typeorm_1.DataSource(options);
                await dataSource.initialize();
                this.dataSources.set(service.name, dataSource);
                console.log(`✅ Connected to ${service.name} database`);
            }
            catch (error) {
                console.error(`❌ Failed to connect to ${service.name} database:`, error);
                // Продолжаем с другими сервисами
            }
        }
        console.log(`✅ ${this.dataSources.size}/${this.services.length} database connections established`);
    }
    getDataSource(serviceName) {
        return this.dataSources.get(serviceName);
    }
    getServiceConfig(serviceName) {
        return this.services.find(s => s.name === serviceName);
    }
    getAllServices() {
        return [...this.services];
    }
    async shutdown() {
        console.log('🔻 Closing database connections...');
        for (const [name, dataSource] of this.dataSources) {
            try {
                if (dataSource.isInitialized) {
                    await dataSource.destroy();
                    console.log(`✅ Closed connection to ${name}`);
                }
            }
            catch (error) {
                console.error(`❌ Error closing connection to ${name}:`, error);
            }
        }
        this.dataSources.clear();
    }
}
exports.DatabaseConfig = DatabaseConfig;
exports.databaseConfig = new DatabaseConfig();
