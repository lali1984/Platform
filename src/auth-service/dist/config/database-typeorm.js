"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../entities/User");
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'secret',
    database: process.env.DB_NAME || 'auth_db',
    entities: [User_1.UserEntity],
    synchronize: false, // Важно: false для production, используем миграции
    logging: process.env.NODE_ENV === 'development',
    poolSize: 20,
});
// Инициализация подключения
const initializeDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
        console.log('TypeORM Data Source has been initialized!');
    }
    catch (error) {
        console.error('Error during TypeORM Data Source initialization:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=database-typeorm.js.map