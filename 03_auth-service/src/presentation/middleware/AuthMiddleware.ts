import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../domain/ports/TokenService.port';

export class AuthMiddleware {
  constructor(private readonly tokenService: TokenService) {}

  /**
   * Middleware для обязательной аутентификации
   */
  authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ 
          success: false, 
          error: 'No token provided' 
        });
        return;
      }

      const token = authHeader.split(' ')[1];
      const payload = this.tokenService.verifyAccessToken(token);

      if (!payload) {
        res.status(401).json({ 
          success: false, 
          error: 'Invalid or expired token' 
        });
        return;
      }

      // Проверяем 2FA статус
      if (payload.isTwoFactorEnabled && !payload.isTwoFactorAuthenticated) {
        res.status(403).json({ 
          success: false, 
          error: '2FA authentication required',
          requires2FA: true,
          userId: payload.userId,
        });
        return;
      }

      // Добавляем payload в request
      (req as any).user = payload;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ 
        success: false, 
        error: 'Authentication failed' 
      });
    }
  }

  /**
   * Middleware для опциональной аутентификации
   */
  optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const payload = this.tokenService.verifyAccessToken(token);
        
        if (payload) {
          (req as any).user = payload;
        }
      }
      
      next();
    } catch (error) {
      // При опциональной аутентификации игнорируем ошибки
      next();
    }
  }

  /**
   * Middleware для проверки ролей (заглушка для будущего расширения)
   */
  requireRole = (_role: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!(req as any).user) {
        res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
        return;
      }

      // TODO: Реализовать проверку ролей когда будет система ролей
      // const userRole = (req as any).user.role;
      // if (userRole !== role) {
      //   res.status(403).json({ 
      //     success: false, 
      //     error: 'Insufficient permissions' 
      //   });
      //   return;
      // }

      next();
    };
  }

  /**
   * Middleware для проверки владения ресурсом
   */
  requireOwnership = (paramName: string = 'userId') => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!(req as any).user) {
        res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
        return;
      }

      const requestedUserId = req.params[paramName];
      const authenticatedUserId = (req as any).user.userId;

      if (requestedUserId !== authenticatedUserId) {
        res.status(403).json({ 
          success: false, 
          error: 'Access denied to this resource' 
        });
        return;
      }

      next();
    };
  }
}
