// import { Router } from 'express';
// import authController from '../controllers/auth.controller';

// const router = Router();

// // Public routes
// router.post('/register', authController.register.bind(authController));
// router.post('/login', authController.login.bind(authController));
// router.post('/2fa/generate', authController.generate2FA.bind(authController));
// router.post('/2fa/verify', authController.verify2FA.bind(authController));
// router.post('/refresh-token', authController.refreshToken.bind(authController));
// router.get('/health', authController.healthCheck.bind(authController));

// export default router;

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

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

export default router;