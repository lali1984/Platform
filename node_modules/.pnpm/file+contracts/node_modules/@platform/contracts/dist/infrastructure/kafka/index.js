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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaModule = exports.createKafkaProducer = exports.KafkaProducerService = void 0;
// contracts/src/infrastructure/kafka/index.ts
__exportStar(require("./kafka.config"), exports);
__exportStar(require("./CircuitBreaker"), exports);
// Явный экспорт из KafkaProducer.service без дублирования
var KafkaProducer_service_1 = require("./KafkaProducer.service");
Object.defineProperty(exports, "KafkaProducerService", { enumerable: true, get: function () { return KafkaProducer_service_1.KafkaProducerService; } });
Object.defineProperty(exports, "createKafkaProducer", { enumerable: true, get: function () { return KafkaProducer_service_1.createKafkaProducer; } });
__exportStar(require("./KafkaConsumer.service"), exports);
var kafka_module_1 = require("./kafka.module");
Object.defineProperty(exports, "KafkaModule", { enumerable: true, get: function () { return kafka_module_1.KafkaModule; } });
//# sourceMappingURL=index.js.map