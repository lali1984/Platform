"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserProfileUseCase = void 0;
const user_profile_aggregate_1 = require("../../domain/aggregates/user-profile.aggregate");
const api_response_vo_1 = require("../../domain/value-objects/api-response.vo");
class GetUserProfileUseCase {
    constructor(authClient, userClient, cache) {
        this.authClient = authClient;
        this.userClient = userClient;
        this.cache = cache;
    }
    async execute(token, userId) {
        try {
            // 1. Validate token
            const validationResult = await this.authClient.validateToken(token);
            if (!validationResult.isValid || !validationResult.user) {
                return api_response_vo_1.ApiResponse.error('Invalid or expired token');
            }
            const targetUserId = userId || validationResult.user.id;
            const cacheKey = `user_profile_${targetUserId}`;
            // 2. Check cache
            const cachedProfile = await this.cache.get(cacheKey);
            if (cachedProfile) {
                return api_response_vo_1.ApiResponse.success(cachedProfile);
            }
            // 3. Fetch user profile from user service
            const profileResponse = await this.userClient.getUserProfileWithAuth(token, targetUserId);
            if (!profileResponse.success || !profileResponse.data) {
                return api_response_vo_1.ApiResponse.error(profileResponse.error || 'Failed to fetch user profile');
            }
            // 4. Преобразуем данные к формату CompleteUserProfile
            const profileData = profileResponse.data;
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
            const userProfile = user_profile_aggregate_1.UserProfileAggregate.create(validationResult.user, completeProfile, // Теперь передаем CompleteUserProfile
            `session_${Date.now()}`);
            // 6. Cache the result
            await this.cache.set(cacheKey, userProfile);
            return api_response_vo_1.ApiResponse.success(userProfile);
        }
        catch (error) {
            console.error('GetUserProfileUseCase error:', error);
            return api_response_vo_1.ApiResponse.error(error instanceof Error ? error.message : 'Internal server error');
        }
    }
}
exports.GetUserProfileUseCase = GetUserProfileUseCase;
