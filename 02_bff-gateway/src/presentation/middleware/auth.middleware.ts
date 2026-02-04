import { Request, Response, NextFunction } from 'express';
import { IAuthClient } from '../../domain/ports/auth-client.port';

export class AuthMiddleware {
  constructor(private readonly authClient: IAuthClient) {}

  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'No token provided',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const token = authHeader.split(' ')[1];
      const validationResult = await this.authClient.validateToken(token);

      if (!validationResult.isValid || !validationResult.user) {
        res.status(401).json({
          success: false,
          error: validationResult.error || 'Invalid token',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Attach user to request
      (req as any).user = validationResult.user;
      (req as any).token = token;

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication service error',
        timestamp: new Date().toISOString(),
      });
    }
  };

  optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const validationResult = await this.authClient.validateToken(token);

        if (validationResult.isValid && validationResult.user) {
          (req as any).user = validationResult.user;
          (req as any).token = token;
        }
      }

      next();
    } catch (error) {
      // Don't fail on optional auth errors
      console.warn('Optional auth error:', error);
      next();
    }
  };

  requireRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (user.role !== role) {
        res.status(403).json({
          success: false,
          error: `Insufficient permissions. Required role: ${role}`, 
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    };
  };

  requirePermission = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!user.permissions || !user.permissions.includes(permission)) {
        res.status(403).json({
          success: false,
          error: `Insufficient permissions. Required: ${permission}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    };
  };
}