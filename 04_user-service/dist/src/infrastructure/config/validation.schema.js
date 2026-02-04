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
exports.JoiValidationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.JoiValidationSchema = Joi.object({
    DATABASE_HOST: Joi.string().default('postgres-user'),
    DATABASE_PORT: Joi.number().port().default(5432),
    DATABASE_USERNAME: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
    DATABASE_POOL_SIZE: Joi.number().min(1).max(50).default(10),
    KAFKA_BROKERS: Joi.string().required(),
    KAFKA_CLIENT_ID: Joi.string().default('user-service'),
    KAFKA_CONSUMER_GROUP_ID: Joi.string().default('user-service-group'),
    KAFKA_SSL: Joi.boolean().default(false),
    KAFKA_SASL: Joi.string().optional(),
    RUN_MIGRATIONS: Joi.boolean().default(false),
    NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
    PORT: Joi.number().port().default(3000),
    ENABLE_OUTBOX_PROCESSOR: Joi.boolean().default(true),
    OUTBOX_PROCESSOR_INTERVAL: Joi.number().min(1000).default(5000),
    OUTBOX_MAX_ATTEMPTS: Joi.number().min(1).default(5),
});
//# sourceMappingURL=validation.schema.js.map