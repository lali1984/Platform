// 02_bff-gateway/src/presentation/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { AuthUserUseCase } from '../../application/use-cases/auth-user.use-case';
import { ApiResponse } from '../../domain/value-objects/api-response.vo';
import { validateBody } from '../middleware/validation.middleware';
import { RegisterSchema, LoginSchema } from '../../shared/validation/chemas';

export class AuthController {
  constructor(private readonly authUserUseCase: AuthUserUseCase) {}

  validateRegister = validateBody(RegisterSchema);
  validateLogin = validateBody(LoginSchema);

  validateToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400).json(
        ApiResponse.error('Token is required').toJSON()
      );
      return;
    }

    // Проксируем запрос к auth-service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
    const response = await fetch(`${authServiceUrl}/auth/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('AuthController.validateToken error:', error);
    res.status(500).json(
      ApiResponse.error('Internal server error').toJSON()
    );
  }
};

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, username, firstName, lastName } = req.body;

      const result = await this.authUserUseCase.register({
        email,
        password,
        username,
        firstName,
        lastName
      });

      res.status(result.success ? 201 : 400).json(result.toJSON());
    } catch (error) {
      console.error('AuthController.register error:', error);
      res.status(500).json(
        ApiResponse.error('Internal server error').toJSON()
      );
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.authUserUseCase.login({ email, password });

      res.status(result.success ? 200 : 401).json(result.toJSON());
    } catch (error) {
      console.error('AuthController.login error:', error);
      res.status(500).json(
        ApiResponse.error('Internal server error').toJSON()
      );
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        res.status(400).json(
          ApiResponse.error('Token is required').toJSON()
        );
        return;
      }

      const result = await this.authUserUseCase.logout(token);
      res.status(result.success ? 200 : 400).json(result.toJSON());
    } catch (error) {
      console.error('AuthController.logout error:', error);
      res.status(500).json(
        ApiResponse.error('Internal server error').toJSON()
      );
    }
  };

refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json(
        ApiResponse.error('Refresh token is required').toJSON()
      );
      return;
    }

    const result = await this.authUserUseCase.refreshToken(refreshToken);
    res.status(result.success ? 200 : 401).json(result.toJSON());
  } catch (error) {
    console.error('AuthController.refreshToken error:', error);
    res.status(500).json(
      ApiResponse.error('Internal server error').toJSON()
    );
  }
};
}