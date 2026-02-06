"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthHttpClient = void 0;
const api_response_vo_1 = require("../../domain/value-objects/api-response.vo");
const client_factory_1 = require("./client-factory");
class AuthHttpClient {
    constructor() {
        this.client = client_factory_1.HttpClientFactory.createAuthClient();
    }
    async register(credentials) {
        try {
            // 1. Регистрация пользователя
            const registerResponse = await this.client.post('/api/auth/register', credentials);
            if (!registerResponse.data.success) {
                return api_response_vo_1.ApiResponse.error(registerResponse.data.error || 'Registration failed');
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
                    return api_response_vo_1.ApiResponse.error('User created but userId not found');
                }
                console.log('[AuthHttpClient] Auto-login successful, userId:', userId);
                return api_response_vo_1.ApiResponse.success({
                    accessToken: loginData.accessToken,
                    refreshToken: loginData.refreshToken,
                    expiresIn: loginData.expiresIn || 900, // default 15 minutes
                    userId: userId,
                });
            }
            return api_response_vo_1.ApiResponse.error('Registration succeeded but auto-login failed');
        }
        catch (error) {
            console.error('Registration error:', error);
            return api_response_vo_1.ApiResponse.error(error.response?.data?.error || error.message || 'Authentication service unavailable');
        }
    }
    async validateToken(token) {
        try {
            const response = await this.client.post('/api/auth/validate-token', { token });
            if (response.data.success && response.data.data) {
                const result = response.data.data;
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
        }
        catch (error) {
            console.error('Token validation error:', error);
            return {
                isValid: false,
                error: error.response?.data?.error || 'Authentication service unavailable',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async login(credentials) {
        try {
            const response = await this.client.post('/api/auth/login', credentials);
            console.log('[AuthHttpClient] Login response:', response.data);
            if (response.data.success && response.data.data) {
                const loginData = response.data.data;
                const userId = loginData.user?.id || '';
                if (!userId) {
                    console.warn('[AuthHttpClient] No userId in login response');
                }
                return api_response_vo_1.ApiResponse.success({
                    accessToken: loginData.accessToken,
                    refreshToken: loginData.refreshToken,
                    expiresIn: loginData.expiresIn || 900,
                    userId: userId,
                });
            }
            return api_response_vo_1.ApiResponse.error(response.data.error || 'Login failed');
        }
        catch (error) {
            console.error('Login error:', error);
            return api_response_vo_1.ApiResponse.error(error.response?.data?.error || error.message || 'Authentication service unavailable');
        }
    }
    async logout(token) {
        try {
            const response = await this.client.post('/api/auth/logout', { refreshToken: token });
            if (response.data.success) {
                return api_response_vo_1.ApiResponse.success(undefined);
            }
            return api_response_vo_1.ApiResponse.error(response.data.error || 'Logout failed');
        }
        catch (error) {
            console.error('Logout error:', error);
            return api_response_vo_1.ApiResponse.error(error.response?.data?.error || 'Authentication service unavailable');
        }
    }
    async refreshToken(refreshToken) {
        try {
            const response = await this.client.post('/api/auth/refresh-token', { refreshToken });
            if (response.data.success && response.data.data) {
                const refreshData = response.data.data;
                return api_response_vo_1.ApiResponse.success({
                    accessToken: refreshData.accessToken,
                    refreshToken: refreshData.refreshToken,
                    expiresIn: refreshData.expiresIn || 900,
                    userId: '', // Refresh обычно не возвращает userId
                });
            }
            return api_response_vo_1.ApiResponse.error(response.data.error || 'Token refresh failed');
        }
        catch (error) {
            console.error('Refresh token error:', error);
            return api_response_vo_1.ApiResponse.error(error.response?.data?.error || 'Authentication service unavailable');
        }
    }
}
exports.AuthHttpClient = AuthHttpClient;
