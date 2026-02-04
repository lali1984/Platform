"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = exports.typeormConfig = void 0;
const typeorm_1 = require("typeorm");
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const outbox_event_entity_1 = require("../persistence/outbox-event.entity");
const user_profile_entity_1 = require("../persistence/user-profile.entity");
dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });
exports.typeormConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433', 10),
    username: process.env.DB_USERNAME || 'user_service',
    password: process.env.DB_PASSWORD || 'UserServiceSecurePass2026!',
    database: process.env.DB_DATABASE || 'user_db',
    entities: [user_profile_entity_1.UserProfileEntity, outbox_event_entity_1.OutboxEventEntity],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development' ? ['query', 'error', 'schema'] : ['error'],
    migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
    migrationsRun: true,
    migrationsTableName: 'typeorm_migrations',
    extra: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        statement_timeout: 30000,
        query_timeout: 30000,
        application_name: 'user-service',
    },
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: true }
        : false,
};
exports.AppDataSource = new typeorm_1.DataSource(exports.typeormConfig);
//# sourceMappingURL=typeorm.config.js.map