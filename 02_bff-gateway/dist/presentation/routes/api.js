"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRoutes = void 0;
const express_1 = require("express");
const error_handler_middleware_1 = require("../middleware/error-handler.middleware");
class ApiRoutes {
    constructor(userController, authController, // НОВОЕ
    authMiddleware) {
        this.userController = userController;
        this.authController = authController;
        this.authMiddleware = authMiddleware;
        this.router = (0, express_1.Router)();
        this.setupRoutes();
    }
    setupRoutes() {
        // Health check
        this.router.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                service: 'bff-gateway',
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || '1.0.0',
            });
        });
        // Public routes
        this.router.get('/api/test', (req, res) => {
            res.json({
                message: 'BFF Gateway is working with Clean Architecture',
                architecture: 'Clean Architecture + DDD',
                timestamp: new Date().toISOString(),
            });
        });
        // ========== АУТЕНТИФИКАЦИЯ ========== // НОВОЕ
        const authRouter = (0, express_1.Router)();
        authRouter.post('/register', this.authController.register);
        authRouter.post('/login', this.authController.login);
        authRouter.post('/logout', this.authController.logout);
        authRouter.post('/refresh', this.authController.refreshToken);
        authRouter.post('/validate-token', this.authController.validateToken);
        this.router.use('/api/auth', authRouter);
        // ========== ПОЛЬЗОВАТЕЛИ ========== //
        const userRouter = (0, express_1.Router)();
        // Protected routes (require authentication)
        userRouter.get('/profile/me', this.authMiddleware.authenticate, this.userController.getMyProfile);
        userRouter.get('/profile/:userId', this.authMiddleware.authenticate, this.userController.getProfile);
        userRouter.get('/search', this.authMiddleware.optionalAuth, this.userController.searchUsers);
        // Mount user routes
        this.router.use('/api/users', userRouter);
        // Admin routes (example)
        const adminRouter = (0, express_1.Router)();
        adminRouter.use(this.authMiddleware.authenticate);
        adminRouter.use(this.authMiddleware.requireRole('admin'));
        adminRouter.get('/dashboard', (req, res) => {
            res.json({
                success: true,
                data: {
                    message: 'Admin dashboard',
                    user: req.user,
                },
                timestamp: new Date().toISOString(),
            });
        });
        this.router.use('/api/admin', adminRouter);
        // 404 handler for API routes only
        this.router.use('/api/*', error_handler_middleware_1.ErrorHandlerMiddleware.handleNotFound);
    }
    getRouter() {
        return this.router;
    }
}
exports.ApiRoutes = ApiRoutes;
