import { Router } from 'express';
import AuthController from '../controllers/auth.controller';

const router = Router();

// Регистрация
router.post('/register', AuthController.register);

// Вход
router.post('/login', AuthController.login);

// Обновление токена
router.post('/refresh', AuthController.refreshToken);

// Выход
router.post('/logout', AuthController.logout);

// Валидация токена
router.get('/validate', AuthController.validateToken);

// 2FA
router.post('/2fa/generate', AuthController.generate2FA);
router.post('/2fa/verify', AuthController.verify2FA);

// Health check
router.get('/health', AuthController.healthCheck);

router.get('/health', (req, res) => {
  res.json({
  status: 'ok',
  service: 'auth-service',
  timestamp: new Date().toISOString(),
  path: '/api/auth/health'

});

});

export default router;