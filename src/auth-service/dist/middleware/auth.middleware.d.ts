import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../services/token.service';
export interface AuthRequest extends Request {
    user?: TokenPayload;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireTwoFactor: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map