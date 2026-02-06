import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { AuthController } from '../controllers/auth.controller'; // НОВОЕ
import { AuthMiddleware } from '../middleware/auth.middleware';
import { ErrorHandlerMiddleware } from '../middleware/error-handler.middleware';

export class ApiRoutes {
  private router: Router;

  constructor(
    private readonly userController: UserController,
    private readonly authController: AuthController, // НОВОЕ
    private readonly authMiddleware: AuthMiddleware
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
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
    const authRouter = Router();
    
    authRouter.post('/register', this.authController.register);
    authRouter.post('/login', this.authController.login);
    authRouter.post('/logout', this.authController.logout);
    authRouter.post('/refresh', this.authController.refreshToken);
    authRouter.post('/validate-token', this.authController.validateToken);

    this.router.use('/api/auth', authRouter);

    // ========== ПОЛЬЗОВАТЕЛИ ========== //
    const userRouter = Router();
    
    // Protected routes (require authentication)
    userRouter.get('/profile/me', 
      this.authMiddleware.authenticate,
      this.userController.getMyProfile
    );
    
    userRouter.get('/profile/:userId', 
      this.authMiddleware.authenticate,
      this.userController.getProfile
    );
    
    userRouter.get('/search', 
      this.authMiddleware.optionalAuth,
      this.userController.searchUsers
    );

    // Mount user routes
    this.router.use('/api/users', userRouter);

    // Admin routes (example)
    const adminRouter = Router();
    adminRouter.use(this.authMiddleware.authenticate);
    adminRouter.use(this.authMiddleware.requireRole('admin'));
    
    adminRouter.get('/dashboard', (req, res) => {
      res.json({
        success: true,
        data: {
          message: 'Admin dashboard',
          user: (req as any).user,
        },
        timestamp: new Date().toISOString(),
      });
    });

    this.router.use('/api/admin', adminRouter);

    // 404 handler for API routes only
    this.router.use('/api/*', ErrorHandlerMiddleware.handleNotFound);
  }

  getRouter(): Router {
    return this.router;
  }
}