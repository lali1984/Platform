// /03_auth-service/src/presentation/controllers/AuthController.ts
import { Request, Response } from 'express';
import { TokenValidationResult } from '@platform/contracts';
import { RegisterUserUseCase, RegisterUserCommand } from '../../application/use-cases/register-user.use-case';
import { LoginUserUseCase, LoginUserCommand } from '../../application/use-cases/login-user.use-case';
import { UserResponseMapper } from '../../application/dto/user-response.dto';
import { UserResponseDto } from '../../application/dto/user-response.dto';
import { TokenService } from '../../domain/ports/token-service.port';
import { UserRepository } from '../../domain/ports/user-repository.port';

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly userResponseMapper: UserResponseMapper,
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const command: LoginUserCommand = {
        email: req.body.email,
        password: req.body.password,
        metadata: {
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
        },
      };

      const result = await this.loginUserUseCase.execute(command);

      if (!result.success) {
        res.status(401).json({
          success: false,
          error: result.error,
        });
        return;
      }

      if (result.requires2FA) {
        res.status(200).json({
          success: true,
          message: '2FA required',
          data: {
            requires2FA: true,
            userId: result.user?.id,
          },
        });
        return;
      }

      let userDto: UserResponseDto | undefined = undefined;
      if (result.user && result.tokens) {
        try {
          userDto = await this.userResponseMapper.toDto(result.user);
          
          // Сохраняем refresh token в Redis
          await this.tokenService.saveRefreshToken(
            result.user.id,
            result.tokens.refreshToken
          );
        } catch (error) {
          console.error('Failed to map user or save token:', error);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: result.tokens?.accessToken,
          refreshToken: result.tokens?.refreshToken,
          expiresIn: result.tokens?.expiresIn,
          user: userDto,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const command: RegisterUserCommand = {
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        metadata: {
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
        },
      };

      const result = await this.registerUserUseCase.execute(command);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error,
        });
        return;
      }

      let userDto: UserResponseDto | undefined = undefined;
      if (result.user) {
        try {
          userDto = await this.userResponseMapper.toDto(result.user);
        } catch (error) {
          console.error('Failed to map user to DTO in register:', error);
        }
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: userDto,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        res.status(400).json({
          success: false,
          error: 'Token is required',
        });
        return;
      }

      // Валидируем access token
      const payload = this.tokenService.verifyAccessToken(token);
      
      if (!payload) {
        res.status(200).json({
          success: true,
          data: {
            isValid: false,
            error: 'Invalid or expired token',
            timestamp: new Date().toISOString(),
          } as TokenValidationResult,
        });
        return;
      }

      // Получаем пользователя
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        res.status(200).json({
          success: true,
          data: {
            isValid: false,
            error: 'User not found',
            timestamp: new Date().toISOString(),
          } as TokenValidationResult,
        });
        return;
      }

      // Маппим в DTO
      const userAuthData = await this.userResponseMapper.toDto(user);
      
      res.status(200).json({
        success: true,
        data: {
          isValid: true,
          user: userAuthData,
          timestamp: new Date().toISOString(),
        } as TokenValidationResult,
      });
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required',
        });
        return;
      }

      // Валидируем refresh token
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      if (!payload) {
        res.status(401).json({
          success: false,
          error: 'Invalid refresh token',
        });
        return;
      }

      // Проверяем наличие в Redis
      const isValid = await this.tokenService.validateRefreshToken(payload.userId, refreshToken);
      if (!isValid) {
        res.status(401).json({
          success: false,
          error: 'Refresh token revoked or expired',
        });
        return;
      }

      // Генерируем новую пару токенов
      const newTokenPair = (this.tokenService as any).generateTokenPair?.({
        userId: payload.userId,
        email: payload.email,
        isTwoFactorEnabled: payload.isTwoFactorEnabled,
        isTwoFactorAuthenticated: true,
      }) || {
        accessToken: this.tokenService.generateAccessToken(payload),
        refreshToken: this.tokenService.generateRefreshToken(payload),
        expiresIn: 900,
      };

      // Сохраняем новый refresh token
      await this.tokenService.saveRefreshToken(payload.userId, newTokenPair.refreshToken);

      // Удаляем старый refresh token
      await this.tokenService.deleteRefreshToken(payload.userId, refreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken: newTokenPair.accessToken,
          refreshToken: newTokenPair.refreshToken,
          expiresIn: newTokenPair.expiresIn,
        },
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required',
        });
        return;
      }

      // Валидируем refresh token для получения userId
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      if (payload) {
        await this.tokenService.deleteRefreshToken(payload.userId, refreshToken);
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async generate2FA(_req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: '2FA generation endpoint - to be implemented',
        data: {
          secret: '2fa-secret-key',
          qrCodeUrl: 'data:image/png;base64,...',
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('2FA generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async verify2FA(_req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: '2FA verification endpoint - to be implemented',
        data: {
          verified: true,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async disable2FA(_req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: '2FA disable endpoint - to be implemented',
        data: {
          disabled: true,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('2FA disable error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async healthCheck(_req: Request, res: Response): Promise<void> {
    // Проверяем подключение к Redis
    let redisStatus = 'ok';
    try {
      const tokenService = this.tokenService as any;
      if (tokenService.redisClient && tokenService.redisClient.ping) {
        await tokenService.redisClient.ping();
      }
    } catch (error) {
      redisStatus = 'error';
      console.error('Redis health check failed:', error);
    }

    res.json({
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: 'PostgreSQL',
        redis: redisStatus,
        eventPublisher: 'Outbox Pattern',
      },
    });
  }
}