// /02_bff-gateway/src/infrastructure/http-clients/auth-http.client.ts
import { 
  IAuthClient, 
  LoginCredentials, 
  RegisterCredentials
} from '../../domain/ports/auth-client.port';
import { ApiResponse } from '../../domain/value-objects/api-response.vo';
import { HttpClientFactory } from './http-client.factory';
import { TokenValidationResult, AuthResponse } from '@platform/contracts';

export class AuthHttpClient implements IAuthClient {
  private client = HttpClientFactory.createAuthClient();

  async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      // 1. Регистрация пользователя
      const registerResponse = await this.client.post('/api/auth/register', credentials);
      
      if (!registerResponse.data.success) {
        return ApiResponse.error(registerResponse.data.error || 'Registration failed');
      }

      console.log('[AuthHttpClient] Registration successful, attempting auto-login');

      // 2. АВТОМАТИЧЕСКИЙ ЛОГИН ПОСЛЕ РЕГИСТРАЦИИ
      const loginResponse = await this.client.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      console.log('[AuthHttpClient] Auto-login response:', {
        success: loginResponse.data.success,
        hasData: !!loginResponse.data.data
      });

      if (loginResponse.data.success && loginResponse.data.data) {
        const loginData = loginResponse.data.data;
        
        // Извлекаем userId из user.id или из регистрации
        const userId = loginData.user?.id || registerResponse.data.user?.id;
        
        if (!userId) {
          console.error('[AuthHttpClient] No userId found in login or register response');
          return ApiResponse.error('User created but userId not found');
        }

        console.log('[AuthHttpClient] Auto-login successful, userId:', userId);

        return ApiResponse.success({
          accessToken: loginData.accessToken,
          refreshToken: loginData.refreshToken,
          expiresIn: loginData.expiresIn || 900, // default 15 minutes
          userId: userId,
        });
      }

      return ApiResponse.error('Registration succeeded but auto-login failed');
    } catch (error: any) {
      console.error('Registration error:', error);
      return ApiResponse.error(
        error.response?.data?.error || error.message || 'Authentication service unavailable'
      );
    }
  }

  async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      const response = await this.client.post('/api/auth/validate-token', { token });
      
      if (response.data.success && response.data.data) {
        const result = response.data.data as TokenValidationResult;
        return {
          isValid: result.isValid,
          user: result.user,
          error: result.error,
          timestamp: result.timestamp,
        };
      }

      return {
        isValid: false,
        error: response.data.error || 'Invalid token response',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Token validation error:', error);
      return {
        isValid: false,
        error: error.response?.data?.error || 'Authentication service unavailable',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.client.post('/api/auth/login', credentials);
      
      console.log('[AuthHttpClient] Login response:', response.data);

      if (response.data.success && response.data.data) {
        const loginData = response.data.data;
        const userId = loginData.user?.id || '';

        if (!userId) {
          console.warn('[AuthHttpClient] No userId in login response');
        }

        return ApiResponse.success({
          accessToken: loginData.accessToken,
          refreshToken: loginData.refreshToken,
          expiresIn: loginData.expiresIn || 900,
          userId: userId,
        });
      }

      return ApiResponse.error(response.data.error || 'Login failed');
    } catch (error: any) {
      console.error('Login error:', error);
      return ApiResponse.error(
        error.response?.data?.error || error.message || 'Authentication service unavailable'
      );
    }
  }

  async logout(token: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.post('/api/auth/logout', { refreshToken: token });
      
      if (response.data.success) {
        return ApiResponse.success(undefined);
      }

      return ApiResponse.error(response.data.error || 'Logout failed');
    } catch (error: any) {
      console.error('Logout error:', error);
      return ApiResponse.error(
        error.response?.data?.error || 'Authentication service unavailable'
      );
    }
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.client.post('/api/auth/refresh-token', { refreshToken });
      
      if (response.data.success && response.data.data) {
        const refreshData = response.data.data;
        return ApiResponse.success({
          accessToken: refreshData.accessToken,
          refreshToken: refreshData.refreshToken,
          expiresIn: refreshData.expiresIn || 900,
          userId: '', // Refresh обычно не возвращает userId
        });
      }

      return ApiResponse.error(response.data.error || 'Token refresh failed');
    } catch (error: any) {
      console.error('Refresh token error:', error);
      return ApiResponse.error(
        error.response?.data?.error || 'Authentication service unavailable'
      );
    }
  }
}