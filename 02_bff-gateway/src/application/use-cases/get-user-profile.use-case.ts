import { IAuthClient } from '../../domain/ports/auth-client.port';
import { IUserClient } from '../../domain/ports/user-client.port';
import { ICache } from '../../domain/ports/cache.port';
import { UserProfileAggregate } from '../../domain/aggregates/user-profile.aggregate';
import { ApiResponse } from '../../domain/value-objects/api-response.vo';

export class GetUserProfileUseCase {
  constructor(
    private readonly authClient: IAuthClient,
    private readonly userClient: IUserClient,
    private readonly cache: ICache
  ) {}

  async execute(token: string, userId?: string): Promise<ApiResponse<UserProfileAggregate>> {
    try {
      // 1. Validate token
      const validationResult = await this.authClient.validateToken(token);
      if (!validationResult.isValid || !validationResult.user) {
        return ApiResponse.error<UserProfileAggregate>('Invalid or expired token');
      }

      const targetUserId = userId || validationResult.user.id;
      const cacheKey = `user_profile_${targetUserId}`;

      // 2. Check cache
      const cachedProfile = await this.cache.get<UserProfileAggregate>(cacheKey);
      if (cachedProfile) {
        return ApiResponse.success(cachedProfile);
      }

      // 3. Fetch user profile from user service
      const profileResponse = await this.userClient.getUserProfileWithAuth(
        token, 
        targetUserId
      );
      
      if (!profileResponse.success || !profileResponse.data) {
        return ApiResponse.error<UserProfileAggregate>(
          profileResponse.error || 'Failed to fetch user profile'
        );
      }

      // 4. Преобразуем данные к формату CompleteUserProfile
      const profileData = profileResponse.data as any;
      
      // Создаем объект CompleteUserProfile с обязательными полями
      const completeProfile = {
        ...profileData,
        // Добавляем недостающие поля с значениями по умолчанию
        profile: profileData.profile || {},
        preferences: profileData.preferences || {},
        // Убедимся, что есть все обязательные поля для CompleteUserProfile
        id: profileData.id || targetUserId,
        email: profileData.email || validationResult.user.email,
      };

      // 5. Create aggregate
      const userProfile = UserProfileAggregate.create(
        validationResult.user,
        completeProfile, // Теперь передаем CompleteUserProfile
        `session_${Date.now()}`
      );

      // 6. Cache the result
      await this.cache.set(cacheKey, userProfile);

      return ApiResponse.success(userProfile);
    } catch (error) {
      console.error('GetUserProfileUseCase error:', error);
      return ApiResponse.error<UserProfileAggregate>(
        error instanceof Error ? error.message : 'Internal server error'
      );
    }
  }
}