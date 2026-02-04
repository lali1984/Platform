"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.createDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../persistence/entities/User.entity");
const OutboxEvent_entity_1 = require("../persistence/entities/OutboxEvent.entity");
const Role_entity_1 = require("../persistence/entities/Role.entity"); // ДОБАВИТЬ
const Permission_entity_1 = require("../persistence/entities/Permission.entity"); // ДОБАВИТЬ
const UserRole_entity_1 = require("../persistence/entities/UserRole.entity"); // ДОБАВИТЬ
const createDataSource = () => {
    console.log('🔧 Creating DataSource...');
    console.log('📋 Environment variables:');
    console.log('  DATABASE_HOST:', process.env.DATABASE_HOST);
    console.log('  DATABASE_PORT:', process.env.DATABASE_PORT);
    console.log('  DATABASE_USERNAME:', process.env.DATABASE_USERNAME);
    console.log('  DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD ? '***' : 'not set');
    console.log('  DATABASE_NAME:', process.env.DATABASE_NAME);
    console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '***' : 'not set');
    // Используем строку подключения
    const connectionString = process.env.DATABASE_URL ||
        `postgresql://${process.env.DATABASE_USERNAME || 'admin'}:${process.env.DATABASE_PASSWORD || '***'}@${process.env.DATABASE_HOST || 'postgres-auth'}:${process.env.DATABASE_PORT || '5432'}/${process.env.DATABASE_NAME || 'auth_db'}?sslmode=disable`;
    console.log('🔌 Database connection string established (hidden for security)');
    const dataSourceConfig = {
        type: 'postgres',
        url: connectionString,
        host: process.env.DATABASE_HOST || 'postgres-auth',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USERNAME || 'admin',
        password: process.env.DATABASE_PASSWORD || 'secret',
        database: process.env.DATABASE_NAME || 'auth_db',
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
        entities: [
            User_entity_1.UserEntity,
            OutboxEvent_entity_1.OutboxEvent,
            Role_entity_1.RoleEntity,
            Permission_entity_1.PermissionEntity,
            UserRole_entity_1.UserRoleEntity,
        ],
        migrations: [],
        subscribers: [],
        extra: {
            connectionTimeoutMillis: 5000,
            query_timeout: 5000,
            statement_timeout: 5000,
            family: 4, // Принудительно используем IPv4
        },
    };
    console.log('⚙️ DataSource config:', JSON.stringify({
        ...dataSourceConfig,
        password: '****',
        url: dataSourceConfig.url.replace(/:[^:]*@/, ':****@'),
    }, null, 2));
    return new typeorm_1.DataSource(dataSourceConfig);
};
exports.createDataSource = createDataSource;
const initializeDatabase = async (dataSource) => {
    try {
        console.log('🔌 Initializing database connection...');
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
            console.log('✅ Database connection established');
            // Проверяем подключение
            await dataSource.query('SELECT 1');
            console.log('✅ Database health check passed');
        }
    }
    catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=database.config.js.map