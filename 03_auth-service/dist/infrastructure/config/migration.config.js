"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../persistence/entities/User.entity");
const OutboxEvent_entity_1 = require("../persistence/entities/OutboxEvent.entity");
exports.migrationDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'postgres-auth',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || 'admin',
    password: process.env.DATABASE_PASSWORD || 'secret',
    database: process.env.DATABASE_NAME || 'auth_db',
    synchronize: false,
    logging: true,
    entities: [User_entity_1.UserEntity, OutboxEvent_entity_1.OutboxEvent],
    migrations: ['src/infrastructure/migrations/*.ts'],
    subscribers: [],
    extra: {
        connectionTimeoutMillis: 5000,
        query_timeout: 5000,
        statement_timeout: 5000,
        family: 4, // Принудительно используем IPv4
    },
});
//# sourceMappingURL=migration.config.js.map