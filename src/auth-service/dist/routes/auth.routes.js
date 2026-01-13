"use strict";
// import { Router } from 'express';
// import authController from '../controllers/auth.controller';
Object.defineProperty(exports, "__esModule", { value: true });
// const router = Router();
// // Public routes
// router.post('/register', authController.register.bind(authController));
// router.post('/login', authController.login.bind(authController));
// router.post('/2fa/generate', authController.generate2FA.bind(authController));
// router.post('/2fa/verify', authController.verify2FA.bind(authController));
// router.post('/refresh-token', authController.refreshToken.bind(authController));
// router.get('/health', authController.healthCheck.bind(authController));
// export default router;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Основные маршруты
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
// 2FA Маршруты
router.post('/2fa/generate', authController.generate2FA.bind(authController));
router.post('/2fa/verify', authController.verify2FA.bind(authController));
// Токены
router.post('/refresh-token', authController.refreshToken.bind(authController));
// Health check
router.get('/health', authController.healthCheck.bind(authController));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map