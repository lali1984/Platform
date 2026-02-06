import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth-controller';
import { AuthMiddleware } from '../middleware/auth-middleware';

export function setupRoutes(app: any, authController: AuthController, authMiddleware: AuthMiddleware): void {
  const router = Router();

  // ✅ ИСПРАВЛЕНО: Добавляем корневой /health эндпоинт
  app.get('/health', (req: Request, res: Response) => authController.healthCheck(req, res));

  // Health check внутри /api/auth (для обратной совместимости)
  router.get('/health', (req: Request, res: Response) => authController.healthCheck(req, res));

  // Auth routes
  router.post('/register', (req: Request, res: Response) => authController.register(req, res));
  router.post('/login', (req: Request, res: Response) => authController.login(req, res));
  router.post('/refresh-token', (req: Request, res: Response) => authController.refreshToken(req, res));
  router.post('/validate-token', (req: Request, res: Response) => authController.validateToken(req, res));

  // Protected routes
  router.post('/logout', authMiddleware.authenticate, (req: Request, res: Response) => authController.logout(req, res));

  // 2FA routes
  router.post('/2fa/generate', authMiddleware.authenticate, (req: Request, res: Response) => authController.generate2FA(req, res));
  router.post('/2fa/verify', (req: Request, res: Response) => authController.verify2FA(req, res));
  router.post('/2fa/disable', authMiddleware.authenticate, (req: Request, res: Response) => authController.disable2FA(req, res));

  // Mount auth routes
  app.use('/api/auth', router);

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      service: 'Auth Service',
      version: '1.0.0',
      architecture: 'Clean Architecture',
      description: 'Authentication service with JWT, 2FA, and minimal external dependencies',
      endpoints: {
        public: {
          health: 'GET /health',  // ✅ Обновлено
          authHealth: 'GET /api/auth/health',  // Для обратной совместимости
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