"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
class AuthMiddleware {
    constructor(authClient) {
        this.authClient = authClient;
        this.authenticate = async (req, res, next) => {
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
                req.user = validationResult.user;
                req.token = token;
                next();
            }
            catch (error) {
                console.error('Auth middleware error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Authentication service error',
                    timestamp: new Date().toISOString(),
                });
            }
        };
        this.optionalAuth = async (req, res, next) => {
            try {
                const authHeader = req.headers.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    const token = authHeader.split(' ')[1];
                    const validationResult = await this.authClient.validateToken(token);
                    if (validationResult.isValid && validationResult.user) {
                        req.user = validationResult.user;
                        req.token = token;
                    }
                }
                next();
            }
            catch (error) {
                // Don't fail on optional auth errors
                console.warn('Optional auth error:', error);
                next();
            }
        };
        this.requireRole = (role) => {
            return (req, res, next) => {
                const user = req.user;
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
        this.requirePermission = (permission) => {
            return (req, res, next) => {
                const user = req.user;
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
}
exports.AuthMiddleware = AuthMiddleware;
