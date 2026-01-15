import { Request, Response, NextFunction } from 'express';
import { TokenService, TokenPayload } from '../services/token.service';

const tokenService = new TokenService();

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = tokenService.verifyAccessToken(token);
  
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

export const requireTwoFactor = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.isTwoFactorEnabled && !req.user.isTwoFactorAuthenticated) {
    return res.status(403).json({ 
      error: 'Two-factor authentication required',
      requires2FA: true 
    });
  }
  
  next();
};