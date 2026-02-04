import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../domain/ports/TokenService.port';
export declare class AuthMiddleware {
    private readonly tokenService;
    constructor(tokenService: TokenService);
    /**
     * Middleware для обязательной аутентификации
     */
    authenticate: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Middleware для опциональной аутентификации
     */
    optionalAuth: (req: Request, _res: Response, next: NextFunction) => void;
    /**
     * Middleware для проверки ролей (заглушка для будущего расширения)
     */
    requireRole: (_role: string) => (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Middleware для проверки владения ресурсом
     */
    requireOwnership: (paramName?: string) => (req: Request, res: Response, next: NextFunction) => void;
}
