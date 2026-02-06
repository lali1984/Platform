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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const contracts_1 = require("@platform/contracts");
const path = __importStar(require("path"));
const user_profile_1 = require("./infrastructure/persistence/entities/user-profile");
const outbox_event_1 = require("./infrastructure/persistence/entities/outbox-event");
const user_controller_1 = require("./presentation/controllers/user.controller");
const health_controller_1 = require("./presentation/controllers/health.controller");
const create_user_1 = require("./application/use-cases/create-user");
const get_user_1 = require("./application/use-cases/get-user");
const update_user_1 = require("./application/use-cases/update-user");
const delete_user_1 = require("./application/use-cases/delete-user");
const list_users_1 = require("./application/use-cases/list-users");
const handle_user_registered_event_1 = require("./application/use-cases/handle-user-registered-event");
const user_repository_1 = require("./infrastructure/persistence/repository/user.repository");
const user_1 = require("./application/mappers/user");
const outbox_publisher_1 = require("./infrastructure/messaging/outbox-publisher");
const event_validator_1 = require("./application/validators/event-validator");
const kafka_bootstrap_1 = require("./infrastructure/kafka/kafka-bootstrap");
const terminus_1 = require("@nestjs/terminus");
let AppModule = class AppModule {
    constructor(kafkaBootstrapService, configService) {
        this.kafkaBootstrapService = kafkaBootstrapService;
        this.configService = configService;
    }
    async onModuleInit() {
        var _a, _b;
        const nodeEnv = this.configService.get('NODE_ENV', 'development');
        const isProduction = nodeEnv === 'production';
        console.log(`Starting User Service in ${nodeEnv} mode...`);
        try {
            if (isProduction || this.configService.get('KAFKA_ENABLE_CONSUMER') === 'true') {
                console.log('Initializing Kafka consumer...');
                await ((_b = (_a = this.kafkaBootstrapService).onModuleInit) === null || _b === void 0 ? void 0 : _b.call(_a));
                console.log('Kafka consumer initialized');
            }
            console.log('User Service initialization completed successfully');
        }
        catch (error) {
            console.error('Failed to initialize User Service:', error);
            if (isProduction) {
                console.warn('Service starting in degraded mode. Some features may be unavailable.');
            }
            else {
                throw error;
            }
        }
    }
    async onModuleDestroy() {
        var _a, _b;
        console.log('Shutting down User Service...');
        try {
            await ((_b = (_a = this.kafkaBootstrapService).onModuleDestroy) === null || _b === void 0 ? void 0 : _b.call(_a));
            console.log('User Service shutdown completed');
        }
        catch (error) {
            console.error('Error during shutdown:', error);
        }
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            terminus_1.TerminusModule.forRoot({
                errorLogStyle: 'pretty',
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [
                    path.resolve(process.cwd(), '.env'),
                    path.resolve(process.cwd(), '.env.local'),
                    path.resolve(process.cwd(), '.env.development'),
                ],
            }),
            contracts_1.KafkaModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const brokers = configService.get('KAFKA_BROKERS', 'kafka:9092').split(',');
                    return {
                        brokers,
                        clientId: configService.get('KAFKA_CLIENT_ID', 'user-service'),
                        connectionTimeout: 10000,
                        authenticationTimeout: 5000,
                        reauthenticationThreshold: 10000,
                        consumer: {
                            groupId: configService.get('KAFKA_CONSUMER_GROUP_ID', 'user-service-group'),
                            sessionTimeout: parseInt(configService.get('KAFKA_CONSUMER_SESSION_TIMEOUT', '60000')),
                            heartbeatInterval: parseInt(configService.get('KAFKA_CONSUMER_HEARTBEAT_INTERVAL', '15000')),
                            maxPollInterval: parseInt(configService.get('KAFKA_CONSUMER_MAX_POLL_INTERVAL', '300000')),
                            maxPollRecords: parseInt(configService.get('KAFKA_CONSUMER_MAX_POLL_RECORDS', '500')),
                            allowAutoTopicCreation: true,
                            maxWaitTimeInMs: 5000,
                            retry: {
                                initialRetryTime: 100,
                                maxRetryTime: 30000,
                                retries: 10,
                            },
                        },
                        producer: {
                            allowAutoTopicCreation: true,
                            transactionTimeout: 60000,
                            idempotent: true,
                            maxInFlightRequests: 5,
                            retry: {
                                initialRetryTime: 100,
                                maxRetryTime: 30000,
                                retries: 10,
                            },
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const isProduction = configService.get('NODE_ENV') === 'production';
                    return {
                        type: 'postgres',
                        host: configService.get('DATABASE_HOST', 'postgres-user'),
                        port: parseInt(configService.get('DATABASE_PORT', '5432')),
                        username: configService.get('DATABASE_USERNAME', 'admin'),
                        password: configService.get('DATABASE_PASSWORD', 'secret'),
                        database: configService.get('DATABASE_NAME', 'user_db'),
                        entities: [user_profile_1.UserProfileEntity, outbox_event_1.OutboxEventEntity],
                        migrations: [path.join(__dirname, 'infrastructure/migrations/*.{ts,js}')],
                        migrationsTableName: 'typeorm_migrations_history',
                        migrationsRun: configService.get('RUN_MIGRATIONS', 'false') === 'true',
                        synchronize: false,
                        logging: isProduction
                            ? ['error', 'warn', 'migration']
                            : ['query', 'error', 'warn', 'migration'],
                        autoLoadEntities: false,
                        maxQueryExecutionTime: 1000,
                        poolSize: parseInt(configService.get('DATABASE_POOL_SIZE', '10')),
                        extra: {
                            max: parseInt(configService.get('DATABASE_POOL_MAX', '20')),
                            connectionTimeoutMillis: 5000,
                            idleTimeoutMillis: 30000,
                        },
                        ssl: isProduction ? { rejectUnauthorized: false } : false,
                    };
                },
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forFeature([user_profile_1.UserProfileEntity, outbox_event_1.OutboxEventEntity]),
        ],
        controllers: [
            user_controller_1.UserController,
            health_controller_1.HealthController,
        ],
        providers: [
            {
                provide: 'UserRepository',
                useClass: user_repository_1.UserTypormRepository,
            },
            {
                provide: 'EventPublisher',
                useClass: outbox_publisher_1.OutboxEventPublisher,
            },
            event_validator_1.EventValidator,
            create_user_1.CreateUserUseCase,
            get_user_1.GetUserUseCase,
            update_user_1.UpdateUserUseCase,
            delete_user_1.DeleteUserUseCase,
            list_users_1.ListUsersUseCase,
            handle_user_registered_event_1.HandleUserRegisteredEventUseCase,
            user_1.UserMapper,
            outbox_publisher_1.OutboxEventPublisher,
            kafka_bootstrap_1.KafkaBootstrapService,
        ],
        exports: [
            'UserRepository',
            'EventPublisher',
            contracts_1.KafkaModule,
        ],
    }),
    __metadata("design:paramtypes", [kafka_bootstrap_1.KafkaBootstrapService,
        config_1.ConfigService])
], AppModule);
//# sourceMappingURL=app.module.js.map