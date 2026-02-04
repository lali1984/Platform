"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUserUseCase = void 0;
const api_response_vo_1 = require("../../domain/value-objects/api-response.vo");
const kafka_event_waiter_service_1 = require("../services/kafka-event-waiter.service");
class AuthUserUseCase {
    constructor(authClient, userClient, cache) {
        this.authClient = authClient;
        this.userClient = userClient;
        this.cache = cache;
        this.eventWaiter = new kafka_event_waiter_service_1.KafkaEventWaiter();
    }
    async register(data) {
        try {
            console.log('[AuthUserUseCase] Starting registration for:', { email: data.email });
            // 1. Регистрация в auth-service
            const authResponse = await this.authClient.register(data);
            if (!authResponse.success) {
                console.error('[AuthUserUseCase] Registration failed in auth-service:', authResponse.error);
                return api_response_vo_1.ApiResponse.error(`Registration failed: ${authResponse.error}`);
            }
            const authData = authResponse.data;
            console.log('[AuthUserUseCase] Auth registration successful:', {
                userId: authData.userId,
                hasToken: !!authData.accessToken,
            });
            // 2. Ожидаем событие UserCreated из user-service через Kafka
            console.log('[AuthUserUseCase] Waiting for user-created event from Kafka...');
            const userCreatedEvent = await this.eventWaiter.waitForUserCreated(authData.userId, 15000 // ← КРИТИЧЕСКИ ВАЖНО: 15 секунд
            );
            if (userCreatedEvent) {
                console.log('[AuthUserUseCase] User created event received:', {
                    eventId: userCreatedEvent.eventId,
                    userId: userCreatedEvent.payload.userId,
                    timestamp: userCreatedEvent.timestamp,
                });
            }
            else {
                console.warn('[AuthUserUseCase] User created event not received within timeout');
            }
            // 3. Получаем профиль с экспоненциальной задержкой
            let profileResponse;
            let retries = 3;
            let attempt = 0;
            while (retries > 0) {
                profileResponse = await this.userClient.getUserProfileWithAuth(authData.accessToken, authData.userId);
                if (profileResponse.success && profileResponse.data) {
                    break;
                }
                retries--;
                attempt++;
                if (retries > 0) {
                    const delay = Math.min(4000, 1000 * Math.pow(2, attempt - 1));
                    console.log(`[AuthUserUseCase] Profile not ready, retrying in ${delay}ms... (${retries} attempts left)`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            console.log('[AuthUserUseCase] Profile response:', {
                success: profileResponse?.success,
                hasData: !!profileResponse?.data,
            });
            // ✅ ИСПРАВЛЕНО: Гарантируем, что userProfile всегда определён
            const userProfile = profileResponse?.data
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
            const result = {
                tokens: {
                    accessToken: authData.accessToken,
                    refreshToken: authData.refreshToken,
                    expiresIn: authData.expiresIn,
                },
                user: userProfile,
            };
            console.log('[AuthUserUseCase] Registration completed successfully');
            return api_response_vo_1.ApiResponse.success(result, 'Registration successful');
        }
        catch (error) {
            console.error('[AuthUserUseCase] Registration error:', error);
            return api_response_vo_1.ApiResponse.error(`Registration failed: ${error.message}`);
        }
    }
    async login(data) {
        try {
            console.log('[AuthUserUseCase] Login attempt for:', { email: data.email });
            const authResponse = await this.authClient.login(data);
            if (!authResponse.success) {
                console.error('[AuthUserUseCase] Login failed:', authResponse.error);
                return api_response_vo_1.ApiResponse.error(`Login failed: ${authResponse.error}`);
            }
            const authData = authResponse.data;
            // Получаем профиль пользователя
            const profileResponse = await this.userClient.getUserProfileWithAuth(authData.accessToken, authData.userId);
            if (!profileResponse.success) {
                return api_response_vo_1.ApiResponse.error('Failed to load user profile');
            }
            // ✅ ИСПРАВЛЕНО: Гарантируем, что userProfile всегда определён
            const userProfile = profileResponse.data
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
            const result = {
                tokens: {
                    accessToken: authData.accessToken,
                    refreshToken: authData.refreshToken,
                    expiresIn: authData.expiresIn,
                },
                user: userProfile,
            };
            console.log('[AuthUserUseCase] Login successful');
            return api_response_vo_1.ApiResponse.success(result, 'Login successful');
        }
        catch (error) {
            console.error('[AuthUserUseCase] Login error:', error);
            return api_response_vo_1.ApiResponse.error(`Login failed: ${error.message}`);
        }
    }
    async logout(token) {
        try {
            console.log('[AuthUserUseCase] Logout attempt');
            const result = await this.authClient.logout(token);
            if (!result.success) {
                console.error('[AuthUserUseCase] Logout failed:', result.error);
                return api_response_vo_1.ApiResponse.error(`Logout failed: ${result.error}`);
            }
            console.log('[AuthUserUseCase] Logout successful');
            return api_response_vo_1.ApiResponse.success(undefined, 'Logout successful');
        }
        catch (error) {
            console.error('[AuthUserUseCase] Logout error:', error);
            return api_response_vo_1.ApiResponse.error(`Logout failed: ${error.message}`);
        }
    }
    async refreshToken(refreshToken) {
        try {
            console.log('[AuthUserUseCase] Refresh token attempt');
            const authResponse = await this.authClient.refreshToken(refreshToken);
            if (!authResponse.success) {
                console.error('[AuthUserUseCase] Token refresh failed:', authResponse.error);
                return api_response_vo_1.ApiResponse.error(`Token refresh failed: ${authResponse.error}`);
            }
            const authData = authResponse.data;
            // Получаем профиль пользователя
            const profileResponse = await this.userClient.getUserProfileWithAuth(authData.accessToken, authData.userId);
            if (!profileResponse.success) {
                return api_response_vo_1.ApiResponse.error('Failed to load user profile');
            }
            // ✅ ИСПРАВЛЕНО: Гарантируем, что userProfile всегда определён
            const userProfile = profileResponse.data
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
            const result = {
                tokens: {
                    accessToken: authData.accessToken,
                    refreshToken: authData.refreshToken,
                    expiresIn: authData.expiresIn,
                },
                user: userProfile,
            };
            console.log('[AuthUserUseCase] Token refresh successful');
            return api_response_vo_1.ApiResponse.success(result, 'Token refresh successful');
        }
        catch (error) {
            console.error('[AuthUserUseCase] Refresh token error:', error);
            return api_response_vo_1.ApiResponse.error(`Token refresh failed: ${error.message}`);
        }
    }
    async cleanup() {
        await this.eventWaiter.disconnect();
    }
}
exports.AuthUserUseCase = AuthUserUseCase;
