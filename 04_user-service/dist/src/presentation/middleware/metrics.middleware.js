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
var MetricsMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsMiddleware = void 0;
const common_1 = require("@nestjs/common");
const metrics_1 = require("../../infrastructure/metrics/metrics");
let MetricsMiddleware = MetricsMiddleware_1 = class MetricsMiddleware {
    constructor(metricsService) {
        this.metricsService = metricsService;
        this.logger = new common_1.Logger(MetricsMiddleware_1.name);
        this.excludedPaths = ['/metrics', '/favicon.ico'];
    }
    use(req, res, next) {
        const startTime = Date.now();
        const path = this.normalizePath(req.path);
        if (this.excludedPaths.includes(path)) {
            return next();
        }
        const originalSend = res.send.bind(res);
        res.send = (body) => {
            const duration = Date.now() - startTime;
            const statusCode = res.statusCode;
            try {
                this.metricsService.recordHttpRequest(req.method, path, statusCode, duration / 1000);
            }
            catch (error) {
                this.logger.warn(`Failed to record metrics for ${req.method} ${path}:`, error);
            }
            return originalSend(body);
        };
        next();
    }
    normalizePath(path) {
        return path
            .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, '/:id')
            .replace(/\/\d+/g, '/:id')
            .replace(/\/$/, '');
    }
};
exports.MetricsMiddleware = MetricsMiddleware;
exports.MetricsMiddleware = MetricsMiddleware = MetricsMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_1.MetricsService])
], MetricsMiddleware);
//# sourceMappingURL=metrics.middleware.js.map