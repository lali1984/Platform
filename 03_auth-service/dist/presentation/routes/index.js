"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = setupRoutes;
const express_1 = require("express");
function setupRoutes(app, authController, authMiddleware) {
    const router = (0, express_1.Router)();
    // Health check
    router.get('/health', (req, res) => authController.healthCheck(req, res));
    // Auth routes
    router.post('/register', (req, res) => authController.register(req, res));
    router.post('/login', (req, res) => authController.login(req, res));
    router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));
    router.post('/validate-token', (req, res) => authController.validateToken(req, res));
    // Protected routes (require authentication)
    router.post('/logout', authMiddleware.authenticate, (req, res) => authController.logout(req, res));
    // 2FA routes
    router.post('/2fa/generate', authMiddleware.authenticate, (req, res) => authController.generate2FA(req, res));
    router.post('/2fa/verify', (req, res) => authController.verify2FA(req, res));
    router.post('/2fa/disable', authMiddleware.authenticate, (req, res) => authController.disable2FA(req, res));
    // Mount routes
    app.use('/api/auth', router);
    // Root endpoint
    app.get('/', (_req, res) => {
        res.json({
            service: 'Auth Service',
            version: '1.0.0',
            architecture: 'Clean Architecture',
            description: 'Authentication service with JWT, 2FA, and minimal external dependencies',
            endpoints: {
                public: {
                    health: 'GET /api/auth/health',
                    register: 'POST /api/auth/register',
                    login: 'POST /api/auth/login',
                    refreshToken: 'POST /api/auth/refresh-token',
                    validateToken: 'POST /api/auth/validate-token',
                    verify2FA: 'POST /api/auth/2fa/verify',
                },
                protected: {
                    logout: 'POST /api/auth/logout',
                    generate2FA: 'POST /api/auth/2fa/generate',
                    disable2FA: 'POST /api/auth/2fa/disable',
                },
            },
            features: ['JWT Authentication', 'Two-Factor Authentication', 'Outbox Pattern', 'Clean Architecture'],
            timestamp: new Date().toISOString(),
        });
    });
}
//# sourceMappingURL=index.js.map