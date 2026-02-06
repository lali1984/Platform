"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserHttpClient = void 0;
const api_response_vo_1 = require("../../domain/value-objects/api-response.vo");
const client_factory_1 = require("./client-factory");
class UserHttpClient {
    constructor() {
        this.client = client_factory_1.HttpClientFactory.createUserClient();
    }
    async getUserProfileWithAuth(token, userId) {
        try {
            const response = await this.client.get(`/users/${userId}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                return api_response_vo_1.ApiResponse.success(response.data.data);
            }
            return api_response_vo_1.ApiResponse.error(response.data.error || 'Failed to fetch user profile');
        }
        catch (error) {
            console.error('Get user profile with auth error:', error);
            return api_response_vo_1.ApiResponse.error(error.response?.data?.error || 'User service unavailable');
        }
    }
    async getUserProfile(userId) {
        try {
            const response = await this.client.get(`/users/${userId}`);
            if (response.data.success) {
                return api_response_vo_1.ApiResponse.success(response.data.data);
            }
            return api_response_vo_1.ApiResponse.error(response.data.error || 'Failed to fetch user profile');
        }
        catch (error) {
            console.error('Get user profile error:', error);
            return api_response_vo_1.ApiResponse.error(error.response?.data?.error || 'User service unavailable');
        }
    }
    async getUserPreferences(userId) {
        try {
            const response = await this.client.get(`/users/${userId}/preferences`);
            if (response.data.success) {
                return api_response_vo_1.ApiResponse.success(response.data.data);
            }
            return api_response_vo_1.ApiResponse.error(response.data.error || 'Failed to fetch user preferences');
        }
        catch (error) {
            console.error('Get user preferences error:', error);
            return api_response_vo_1.ApiResponse.error(error.response?.data?.error || 'User service unavailable');
        }
    }
    async getCompleteUserProfile(userId) {
        try {
            const response = await this.client.get(`/users/${userId}/complete`);
            if (response.data.success) {
                return api_response_vo_1.ApiResponse.success(response.data.data);
            }
            return api_response_vo_1.ApiResponse.error(response.data.error || 'Failed to fetch complete user profile');
        }
        catch (error) {
            console.error('Get complete user profile error:', error);
            return api_response_vo_1.ApiResponse.error(error.response?.data?.error || 'User service unavailable');
        }
    }
    async searchUsers(query, limit = 10) {
        try {
            const response = await this.client.get('/users/search', {
                params: { query, limit },
            });
            if (response.data.success) {
                return api_response_vo_1.ApiResponse.success(response.data.data);
            }
            return api_response_vo_1.ApiResponse.error(response.data.error || 'User search failed');
        }
        catch (error) {
            console.error('Search users error:', error);
            return api_response_vo_1.ApiResponse.error(error.response?.data?.error || 'User service unavailable');
        }
    }
    async updateUserProfile(userId, updates) {
        try {
            const response = await this.client.patch(`/users/${userId}/profile`, updates);
            if (response.data.success) {
                return api_response_vo_1.ApiResponse.success(response.data.data);
            }
            return api_response_vo_1.ApiResponse.error(response.data.error || 'Failed to update user profile');
        }
        catch (error) {
            console.error('Update user profile error:', error);
            return api_response_vo_1.ApiResponse.error(error.response?.data?.error || 'User service unavailable');
        }
    }
}
exports.UserHttpClient = UserHttpClient;
