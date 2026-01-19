"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
class AuthController {
    async register(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }
            // Извлекаем метаданные из запроса
            const metadata = {
                ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown',
            };
            // Используем authService для регистрации
            const result = await authService.register({ email, password }, metadata);
            if (!result.success) {
                res.status(400).json({ error: result.error });
                return;
            }
            res.status(201).json({
                message: 'User registered successfully',
                user: result.user
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(400).json({ error: 'Registration failed' });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }
            // Извлекаем метаданные из запроса
            const metadata = {
                ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown',
                deviceInfo: req.headers['x-device-info'] || 'unknown',
            };
            // Используем authService для входа
            const result = await authService.login({ email, password }, metadata);
            if (!result.success) {
                res.status(401).json({ error: result.error });
                return;
            }
            res.status(200).json({
                message: 'Login successful',
                user: result.user,
                tokens: {
                    accessToken: 'stub-token',
                    refreshToken: 'stub-refresh-token'
                }
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(401).json({ error: 'Login failed' });
        }
    }
    async generate2FA(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }
            // TODO: Реальная реализация генерации 2FA
            res.status(200).json({
                success: true,
                message: '2FA secret generated (stub)',
                data: {
                    secret: 'JBSWY3DPEHPK3PXP',
                    qrCodeUrl: 'data:image/png;base64,stub',
                    otpauthUrl: 'otpauth://totp/App:user?secret=JBSWY3DPEHPK3PXP&issuer=App'
                }
            });
        }
        catch (error) {
            console.error('2FA generation error:', error);
            res.status(500).json({ error: '2FA generation failed' });
        }
    }
    async verify2FA(req, res) {
        try {
            const { userId, token } = req.body;
            if (!userId || !token) {
                res.status(400).json({ error: 'User ID and token are required' });
                return;
            }
            // TODO: Реальная верификация 2FA
            const isValid = token === '123456';
            if (isValid) {
                res.status(200).json({
                    success: true,
                    message: '2FA token verified successfully (stub)'
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    error: 'Invalid 2FA token (stub)'
                });
            }
        }
        catch (error) {
            console.error('2FA verification error:', error);
            res.status(500).json({ error: '2FA verification failed' });
        }
    }
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({ error: 'Refresh token is required' });
                return;
            }
            // TODO: Реальная логика обновления токена
            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully (stub)',
                data: {
                    accessToken: 'new-stub-access-token',
                    refreshToken: 'new-stub-refresh-token'
                }
            });
        }
        catch (error) {
            console.error('Token refresh error:', error);
            res.status(401).json({ error: 'Token refresh failed' });
        }
    }
    async healthCheck(req, res) {
        res.json({
            status: 'ok',
            service: 'auth-service',
            timestamp: new Date().toISOString()
        });
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map