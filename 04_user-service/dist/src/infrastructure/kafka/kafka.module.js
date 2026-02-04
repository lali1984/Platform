"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var KafkaModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const contracts_1 = require("@platform/contracts");
const kafka_bootstrap_service_1 = require("./kafka-bootstrap.service");
const handle_user_registered_event_use_case_1 = require("../../application/use-cases/handle-user-registered-event.use-case");
let KafkaModule = KafkaModule_1 = class KafkaModule {
    static forRoot() {
        return {
            module: KafkaModule_1,
            imports: [
                config_1.ConfigModule,
                contracts_1.KafkaModule.forConsumer('user-service-group'),
            ],
            providers: [
                handle_user_registered_event_use_case_1.HandleUserRegisteredEventUseCase,
                kafka_bootstrap_service_1.KafkaBootstrapService,
                {
                    provide: 'KAFKA_TOPICS',
                    useValue: {
                        userRegistered: 'auth-service.user-registered.v1',
                        userLoggedIn: 'auth-service.user-logged-in.v1',
                        userEvents: 'user.events',
                    },
                },
            ],
            exports: [
                kafka_bootstrap_service_1.KafkaBootstrapService,
                'KAFKA_TOPICS',
            ],
        };
    }
};
exports.KafkaModule = KafkaModule;
exports.KafkaModule = KafkaModule = KafkaModule_1 = __decorate([
    (0, common_1.Module)({})
], KafkaModule);
//# sourceMappingURL=kafka.module.js.map