import { AuthController } from '../controllers/AuthController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
export declare function setupRoutes(app: any, authController: AuthController, authMiddleware: AuthMiddleware): void;
