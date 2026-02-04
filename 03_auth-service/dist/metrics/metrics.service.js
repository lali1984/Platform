"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const prom_client_1 = require("prom-client");
let MetricsService = class MetricsService {
    constructor() {
        this.registry = new prom_client_1.Registry();
        this.registry.setDefaultLabels({
            app: 'auth-service',
            environment: process.env.NODE_ENV || 'development',
        });
    }
    // ✅ Обязательный метод OnModuleInit
    onModuleInit() {
        this.initializeMetrics();
    }
    // ✅ Обязательный метод OnModuleDestroy
    async onModuleDestroy() {
        // Очистка ресурсов при необходимости
        this.registry.clear();
    }
    initializeMetrics() {
        // Auth-specific metrics
        this.authRequestsTotal = new prom_client_1.Counter({
            name: 'auth_requests_total',
            help: 'Total authentication requests',
            labelNames: ['type', 'status'],
            registers: [this.registry],
        });
        this.jwtTokensIssuedTotal = new prom_client_1.Counter({
            name: 'jwt_tokens_issued_total',
            help: 'Total JWT tokens issued',
            labelNames: ['type'],
            registers: [this.registry],
        });
        // HTTP metrics
        this.httpRequestsTotal = new prom_client_1.Counter({
            name: 'http_requests_total',
            help: 'Total HTTP requests',
            labelNames: ['method', 'route', 'status'],
            registers: [this.registry],
        });
        this.httpRequestDuration = new prom_client_1.Histogram({
            name: 'http_request_duration_seconds',
            help: 'HTTP request duration in seconds',
            labelNames: ['method', 'route', 'status'],
            buckets: [0.1, 0.5, 1, 2, 5],
            registers: [this.registry],
        });
    }
    async getMetrics() {
        return await this.registry.metrics();
    }
    // Методы для записи метрик
    recordAuthRequest(type, status) {
        this.authRequestsTotal.inc({ type, status });
    }
    recordJwtTokenIssued(type) {
        this.jwtTokensIssuedTotal.inc({ type });
    }
    recordHttpRequest(method, route, status, duration) {
        this.httpRequestsTotal.inc({ method, route, status: status.toString() });
        this.httpRequestDuration.observe({ method, route, status: status.toString() }, duration);
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map