import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { TokenService, TokenPayload } from '../services/token.service';

const authService = new AuthService();
const tokenService = new TokenService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Получаем все поля из запроса
      const { email, password, username, firstName, lastName } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Извлекаем метаданные из запроса
      const metadata = {
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      };

      // Создаем объект регистрации с новыми полями
      const registerData = {
        email,
        password,
        username: username || undefined, // Преобразуем пустую строку в undefined
        firstName: firstName || undefined,
        lastName: lastName || undefined
      };

      // Используем authService для регистрации
      const result = await authService.register(registerData, metadata);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      // Подключаемся к Redis для TokenService
      await tokenService.connect();

      // Генерируем JWT токены для нового пользователя
      const tokenPayload: TokenPayload = {
        userId: result.user.id,
        email: result.user.email,
        username: result.user.username,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        isTwoFactorEnabled: result.user.isTwoFactorEnabled || false,
        isTwoFactorAuthenticated: false // При регистрации 2FA не аутентифицирован
      };

      const accessToken = tokenService.generateAccessToken(tokenPayload);
      const refreshToken = tokenService.generateRefreshToken(tokenPayload);

      // Сохраняем refresh токен в Redis
      await tokenService.saveRefreshToken(result.user.id, refreshToken);

      res.status(201).json({ 
        message: 'User registered successfully',
        user: result.user,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 15 * 60 // 15 минут в секундах
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ error: 'Registration failed' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
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
        deviceInfo: req.headers['x-device-info'] as string || 'unknown',
      };

      // Используем authService для входа
      const result = await authService.login({ email, password }, metadata);

      if (!result.success) {
        res.status(401).json({ error: result.error });
        return;
      }

      // Подключаемся к Redis
      await tokenService.connect();

      // Генерируем JWT токены для авторизованного пользователя
      const tokenPayload: TokenPayload = {
        userId: result.user.id,
        email: result.user.email,
        username: result.user.username,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        isTwoFactorEnabled: result.user.isTwoFactorEnabled || false,
        isTwoFactorAuthenticated: !result.user.isTwoFactorEnabled // Если 2FA выключен, считаем аутентифицированным
      };

      const accessToken = tokenService.generateAccessToken(tokenPayload);
      const refreshToken = tokenService.generateRefreshToken(tokenPayload);

      // Сохраняем refresh токен в Redis
      await tokenService.saveRefreshToken(result.user.id, refreshToken);

      res.status(200).json({
        message: 'Login successful',
        user: result.user,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 15 * 60 // 15 минут в секундах
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({ error: 'Login failed' });
    }
  }

  async generate2FA(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      // TODO: Реальная реализация генерации 2FA
      // Используем TwoFactorService когда он будет готов
      res.status(200).json({
        success: true,
        message: '2FA secret generated (stub)',
        data: {
          secret: 'JBSWY3DPEHPK3PXP',
          qrCodeUrl: 'data:image/png;base64,stub',
          otpauthUrl: 'otpauth://totp/App:user?secret=JBSWY3DPEHPK3PXP&issuer=App'
        }
      });
    } catch (error: any) {
      console.error('2FA generation error:', error);
      res.status(500).json({ error: '2FA generation failed' });
    }
  }

  async verify2FA(req: Request, res: Response): Promise<void> {
    try {
      const { userId, token } = req.body;
      
      if (!userId || !token) {
        res.status(400).json({ error: 'User ID and token are required' });
        return;
      }

      // TODO: Реальная верификация 2FA через TwoFactorService
      const isValid = token === '123456';

      if (isValid) {
        res.status(200).json({
          success: true,
          message: '2FA token verified successfully (stub)'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid 2FA token (stub)'
        });
      }
    } catch (error: any) {
      console.error('2FA verification error:', error);
      res.status(500).json({ error: '2FA verification failed' });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }

      // Подключаемся к Redis
      await tokenService.connect();

      // Верифицируем refresh токен
      const payload = tokenService.verifyRefreshToken(refreshToken);
      if (!payload) {
        res.status(401).json({ error: 'Invalid refresh token' });
        return;
      }

      // Проверяем валидность в Redis
      const isValid = await tokenService.validateRefreshToken(payload.userId, refreshToken);
      if (!isValid) {
        res.status(401).json({ error: 'Refresh token expired or revoked' });
        return;
      }

      // Генерируем новую пару токенов
      const newTokenPayload: TokenPayload = {
        userId: payload.userId,
        email: payload.email,
        username: payload.username,
        firstName: payload.firstName,
        lastName: payload.lastName,
        isTwoFactorEnabled: payload.isTwoFactorEnabled,
        isTwoFactorAuthenticated: false // При обновлении нужно заново проходить 2FA если включена
      };

      const newAccessToken = tokenService.generateAccessToken(newTokenPayload);
      const newRefreshToken = tokenService.generateRefreshToken(newTokenPayload);

      // Удаляем старый refresh токен и сохраняем новый
      await tokenService.deleteRefreshToken(payload.userId, refreshToken);
      await tokenService.saveRefreshToken(payload.userId, newRefreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: 15 * 60
        }
      });
    } catch (error: any) {
      console.error('Token refresh error:', error);
      res.status(401).json({ 
        success: false,
        error: error.message || 'Token refresh failed' 
      });
    }
  }

  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ valid: false, error: 'No token provided' });
        return;
      }

      const token = authHeader.split(' ')[1];
      const payload = tokenService.verifyAccessToken(token);

      if (!payload) {
        res.status(401).json({ valid: false, error: 'Invalid token' });
        return;
      }

      // Проверяем 2FA статус
      if (payload.isTwoFactorEnabled && !payload.isTwoFactorAuthenticated) {
        res.status(403).json({ 
          valid: false, 
          error: '2FA authentication required',
          requires2FA: true
        });
        return;
      }

      res.status(200).json({ 
        valid: true, 
        userId: payload.userId,
        email: payload.email,
        isTwoFactorEnabled: payload.isTwoFactorEnabled,
        isTwoFactorAuthenticated: payload.isTwoFactorAuthenticated
      });
    } catch (error: any) {
      console.error('Token validation error:', error);
      res.status(401).json({ valid: false, error: 'Token validation failed' });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const authHeader = req.headers.authorization;
      
      if (refreshToken) {
        // Получаем payload из refresh токена
        const payload = tokenService.verifyRefreshToken(refreshToken);
        if (payload) {
          // Инвалидируем refresh токен в Redis
          const key = `refresh_token:${payload.userId}:${refreshToken}`;
          await tokenService.connect();
          await tokenService.redisClient.del(key);
        }
      }
      
      // TODO: Добавить инвалидацию access токена через blacklist
      
      res.status(200).json({ 
        success: true,
        message: 'Logged out successfully' 
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Проверяем подключение к Redis
      await tokenService.connect();
      const redisStatus = await tokenService.redisClient.ping();
      
      res.json({ 
        status: 'ok', 
        service: 'auth-service',
        redis: redisStatus === 'PONG' ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.json({ 
        status: 'degraded', 
        service: 'auth-service',
        redis: 'disconnected',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default new AuthController();