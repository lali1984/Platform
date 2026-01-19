"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/controllers/two-factor.controller.ts
const express_1 = require("express");
const two_factor_service_1 = require("../services/two-factor.service");
const user_repository_1 = require("../repositories/user.repository");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const twoFactorService = new two_factor_service_1.TwoFactorService();
const userRepository = new user_repository_1.UserRepository();
router.post('/enable', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const secret = twoFactorService.generateSecret(req.user.email);
        const qrCode = await twoFactorService.generateQRCode(secret, req.user.email);
        // Save secret to user (but don't enable yet)
        // Используем camelCase как в TypeORM сущности
        await userRepository.updateTwoFactorSecret(userId, secret);
        res.json({
            message: 'Scan QR code with authenticator app',
            qrCode,
            secret, // Only for development, remove in production
            backupCodes: twoFactorService.generateBackupCodes()
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to enable 2FA' });
    }
});
router.post('/verify', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { token } = req.body;
        const user = await userRepository.findById(userId);
        // Проверяем поле twoFactorSecret (camelCase)
        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ error: '2FA not set up' });
        }
        // Используем twoFactorSecret из объекта user
        const isValid = twoFactorService.verifyToken(user.twoFactorSecret, token);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid token' });
        }
        // Enable 2FA for user - используем метод update с правильными полями
        await userRepository.update(userId, {
            isTwoFactorEnabled: true
        });
        res.json({ message: '2FA enabled successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to verify 2FA' });
    }
});
router.post('/disable', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { password } = req.body;
        // Verify password first
        const user = await userRepository.findById(userId);
        // ... password verification logic
        // Здесь должна быть реализация проверки пароля
        // Пример: const isPasswordValid = await verifyPassword(password, user.passwordHash);
        await userRepository.disableTwoFactor(userId);
        res.json({ message: '2FA disabled successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to disable 2FA' });
    }
});
exports.default = router;
//# sourceMappingURL=two-factor.controller.js.map