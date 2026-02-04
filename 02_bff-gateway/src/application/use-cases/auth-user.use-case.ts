// /02_bff-gateway/src/application/use-cases/auth-user.use-case.ts
import {
  IAuthClient,
  RegisterCredentials,
  LoginCredentials,
} from '../../domain/ports/auth-client.port';
import { IUserClient } from '../../domain/ports/user-client.port';
import { ICache } from '../../domain/ports/cache.port';
import { ApiResponse } from '../../domain/value-objects/api-response.vo';
import { KafkaEventWaiter } from '../services/kafka-event-waiter.service';
import { AuthResponse } from '@platform/contracts';

export interface RegisterUserRequest extends RegisterCredentials {}
export interface LoginUserRequest extends LoginCredentials {}

export interface AuthResult {
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  user: {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    bio?: string;
  };
}

// ✅ Добавляем тип для профиля из user-service
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  [key: string]: any;
}

export class AuthUserUseCase {
  private eventWaiter: KafkaEventWaiter;

  constructor(
    private readonly authClient: IAuthClient,
    private readonly userClient: IUserClient,
    private readonly cache: ICache
  ) {
    this.eventWaiter = new KafkaEventWaiter();
  }

  async register(data: RegisterUserRequest): Promise<ApiResponse<AuthResult>> {
    try {
      console.log('[AuthUserUseCase] Starting registration for:', { email: data.email });

      // 1. Регистрация в auth-service
      const authResponse = await this.authClient.register(data);
      if (!authResponse.success) {
        console.error('[AuthUserUseCase] Registration failed in auth-service:', authResponse.error);
        return ApiResponse.error(`Registration failed: ${authResponse.error}`);
      }

      const authData = authResponse.data as AuthResponse;
      console.log('[AuthUserUseCase] Auth registration successful:', {
        userId: authData.userId,
        hasToken: !!authData.accessToken,
      });

      // 2. Ожидаем событие UserCreated из user-service через Kafka
      console.log('[AuthUserUseCase] Waiting for user-created event from Kafka...');
      const userCreatedEvent = await this.eventWaiter.waitForUserCreated(
        authData.userId,
        15000 // ← КРИТИЧЕСКИ ВАЖНО: 15 секунд
      );

      if (userCreatedEvent) {
        console.log('[AuthUserUseCase] User created event received:', {
          eventId: userCreatedEvent.eventId,
          userId: userCreatedEvent.payload.userId,
          timestamp: userCreatedEvent.timestamp,
        });
      } else {
        console.warn('[AuthUserUseCase] User created event not received within timeout');
      }

      // 3. Получаем профиль с экспоненциальной задержкой
      let profileResponse;
      let retries = 3;
      let attempt = 0;

      while (retries > 0) {
        profileResponse = await this.userClient.getUserProfileWithAuth(
          authData.accessToken,
          authData.userId
        );

        if (profileResponse.success && profileResponse.data) {
          break;
        }

        retries--;
        attempt++;
        if (retries > 0) {
          const delay = Math.min(4000, 1000 * Math.pow(2, attempt - 1));
          console.log(
            `[AuthUserUseCase] Profile not ready, retrying in ${delay}ms... (${retries} attempts left)`
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      console.log('[AuthUserUseCase] Profile response:', {
        success: profileResponse?.success,
        hasData: !!profileResponse?.data,
      });

      // ✅ ИСПРАВЛЕНО: Гарантируем, что userProfile всегда определён
      const userProfile: UserProfile = profileResponse?.data
        ? {
            id: profileResponse.data.id || authData.userId,
            email: profileResponse.data.email || data.email,
            username: profileResponse.data.username || data.username || '',
            firstName: profileResponse.data.firstName || data.firstName || '',
            lastName: profileResponse.data.lastName || data.lastName || '',
            avatarUrl: profileResponse.data.avatarUrl || '',
            bio: profileResponse.data.bio || '',
          }
        : {
            id: authData.userId,
            email: data.email,
            username: data.username || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            avatarUrl: '',
            bio: '',
          };

      // 4. Кэшируем
      await this.cache.set(`user:${authData.userId}:profile`, userProfile, 300);

      // ✅ ИСПРАВЛЕНО: Теперь типы совпадают
      const result: AuthResult = {
        tokens: {
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          expiresIn: authData.expiresIn,
        },
        user: userProfile,
      };

      console.log('[AuthUserUseCase] Registration completed successfully');
      return ApiResponse.success(result, 'Registration successful');

    } catch (error: any) {
      console.error('[AuthUserUseCase] Registration error:', error);
      return ApiResponse.error(`Registration failed: ${error.message}`);
    }
  }

  async login(data: LoginUserRequest): Promise<ApiResponse<AuthResult>> {
    try {
      console.log('[AuthUserUseCase] Login attempt for:', { email: data.email });

      const authResponse = await this.authClient.login(data);
      if (!authResponse.success) {
        console.error('[AuthUserUseCase] Login failed:', authResponse.error);
        return ApiResponse.error(`Login failed: ${authResponse.error}`);
      }

      const authData = authResponse.data as AuthResponse;

      // Получаем профиль пользователя
      const profileResponse = await this.userClient.getUserProfileWithAuth(
        authData.accessToken,
        authData.userId
      );

      if (!profileResponse.success) {
        return ApiResponse.error('Failed to load user profile');
      }

      // ✅ ИСПРАВЛЕНО: Гарантируем, что userProfile всегда определён
      const userProfile: UserProfile = profileResponse.data
        ? {
            id: profileResponse.data.id || authData.userId,
            email: profileResponse.data.email || data.email,
            username: profileResponse.data.username || '',
            firstName: profileResponse.data.firstName || '',
            lastName: profileResponse.data.lastName || '',
            avatarUrl: profileResponse.data.avatarUrl || '',
            bio: profileResponse.data.bio || '',
          }
        : {
            id: authData.userId,
            email: data.email,
            username: '',
            firstName: '',
            lastName: '',
            avatarUrl: '',
            bio: '',
          };

      // Кэшируем
      await this.cache.set(`user:${authData.userId}:profile`, userProfile, 300);

      // ✅ ИСПРАВЛЕНО: Теперь типы совпадают
      const result: AuthResult = {
        tokens: {
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          expiresIn: authData.expiresIn,
        },
        user: userProfile,
      };

      console.log('[AuthUserUseCase] Login successful');
      return ApiResponse.success(result, 'Login successful');

    } catch (error: any) {
      console.error('[AuthUserUseCase] Login error:', error);
      return ApiResponse.error(`Login failed: ${error.message}`);
    }
  }

  async logout(token: string): Promise<ApiResponse<void>> {
    try {
      console.log('[AuthUserUseCase] Logout attempt');

      const result = await this.authClient.logout(token);
      
      if (!result.success) {
        console.error('[AuthUserUseCase] Logout failed:', result.error);
        return ApiResponse.error(`Logout failed: ${result.error}`);
      }

      console.log('[AuthUserUseCase] Logout successful');
      return ApiResponse.success(undefined, 'Logout successful');

    } catch (error: any) {
      console.error('[AuthUserUseCase] Logout error:', error);
      return ApiResponse.error(`Logout failed: ${error.message}`);
    }
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResult>> {
    try {
      console.log('[AuthUserUseCase] Refresh token attempt');

      const authResponse = await this.authClient.refreshToken(refreshToken);
      if (!authResponse.success) {
        console.error('[AuthUserUseCase] Token refresh failed:', authResponse.error);
        return ApiResponse.error(`Token refresh failed: ${authResponse.error}`);
      }

      const authData = authResponse.data as AuthResponse;

      // Получаем профиль пользователя
      const profileResponse = await this.userClient.getUserProfileWithAuth(
        authData.accessToken,
        authData.userId
      );

      if (!profileResponse.success) {
        return ApiResponse.error('Failed to load user profile');
      }

      // ✅ ИСПРАВЛЕНО: Гарантируем, что userProfile всегда определён
      const userProfile: UserProfile = profileResponse.data
        ? {
            id: profileResponse.data.id || authData.userId,
            email: profileResponse.data.email || '',
            username: profileResponse.data.username || '',
            firstName: profileResponse.data.firstName || '',
            lastName: profileResponse.data.lastName || '',
            avatarUrl: profileResponse.data.avatarUrl || '',
            bio: profileResponse.data.bio || '',
          }
        : {
            id: authData.userId,
            email: '',
            username: '',
            firstName: '',
            lastName: '',
            avatarUrl: '',
            bio: '',
          };

      // Кэшируем
      await this.cache.set(`user:${authData.userId}:profile`, userProfile, 300);

      // ✅ ИСПРАВЛЕНО: Теперь типы совпадают
      const result: AuthResult = {
        tokens: {
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          expiresIn: authData.expiresIn,
        },
        user: userProfile,
      };

      console.log('[AuthUserUseCase] Token refresh successful');
      return ApiResponse.success(result, 'Token refresh successful');

    } catch (error: any) {
      console.error('[AuthUserUseCase] Refresh token error:', error);
      return ApiResponse.error(`Token refresh failed: ${error.message}`);
    }
  }

  async cleanup(): Promise<void> {
    await this.eventWaiter.disconnect();
  }
}