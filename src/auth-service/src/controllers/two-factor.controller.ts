// src/controllers/two-factor.controller.ts
import { Router } from 'express';
import { TwoFactorService } from '../services/two-factor.service';
import { UserRepository } from '../repositories/user.repository';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const twoFactorService = new TwoFactorService();
const userRepository = new UserRepository();

router.post('/enable', authenticateToken, async (req: any, res) => {
  try {
    const { userId } = req.user;
    const secret = twoFactorService.generateSecret(req.user.email);
    const qrCode = await twoFactorService.generateQRCode(secret, req.user.email);
    
    // Save secret to user (but don't enable yet)
    // Используем snake_case как в базе данных
    await userRepository.update(userId, { 
      two_factor_secret: secret,
      two_factor_enabled: false // Пока не включаем 2FA
    });
    
    res.json({
      message: 'Scan QR code with authenticator app',
      qrCode,
      secret, // Only for development, remove in production
      backupCodes: twoFactorService.generateBackupCodes()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enable 2FA' });
  }
});

router.post('/verify', authenticateToken, async (req: any, res) => {
  try {
    const { userId } = req.user;
    const { token } = req.body;
    
    const user = await userRepository.findById(userId);
    // Проверяем поле two_factor_secret (snake_case)
    if (!user || !user.two_factor_secret) {
      return res.status(400).json({ error: '2FA not set up' });
    }
    
    // Используем two_factor_secret из объекта user
    const isValid = twoFactorService.verifyToken(user.two_factor_secret, token);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid token' });
    }
    
    // Enable 2FA for user
    await userRepository.update(userId, { 
      two_factor_enabled: true 
    });
    
    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify 2FA' });
  }
});

router.post('/disable', authenticateToken, async (req: any, res) => {
  try {
    const { userId } = req.user;
    const { password } = req.body;
    
    // Verify password first
    const user = await userRepository.findById(userId);
    // ... password verification logic
    // Здесь должна быть реализация проверки пароля
    
    await userRepository.update(userId, {
      two_factor_enabled: false,
      two_factor_secret: null
    });
    
    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

export default router;