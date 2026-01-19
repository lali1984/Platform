"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTwoFactor = exports.authenticateToken = void 0;
const token_service_1 = require("../services/token.service");
const tokenService = new token_service_1.TokenService();
const authenticateToken = (req, res, next) => {
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
exports.authenticateToken = authenticateToken;
const requireTwoFactor = (req, res, next) => {
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
exports.requireTwoFactor = requireTwoFactor;
//# sourceMappingURL=auth.middleware.js.map