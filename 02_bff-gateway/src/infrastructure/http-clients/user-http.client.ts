import { 
  IUserClient, 
  UserProfile, 
  UserPreferences, 
  CompleteUserProfile 
} from '../../domain/ports/user-client.port';

import { ApiResponse } from '../../domain/value-objects/api-response.vo';
import { HttpClientFactory } from './http-client.factory';

export class UserHttpClient implements IUserClient {
  private client = HttpClientFactory.createUserClient();

  async getUserProfileWithAuth(token: string, userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await this.client.get(`/users/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        return ApiResponse.success(response.data.data);
      }

      return ApiResponse.error(response.data.error || 'Failed to fetch user profile');
    } catch (error: any) {
      console.error('Get user profile with auth error:', error);
      return ApiResponse.error(
        error.response?.data?.error || 'User service unavailable'
      );
    }
  }
  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await this.client.get(`/users/${userId}`);
      
      if (response.data.success) {
        return ApiResponse.success(response.data.data);
      }

      return ApiResponse.error(response.data.error || 'Failed to fetch user profile');
    } catch (error: any) {
      console.error('Get user profile error:', error);
      return ApiResponse.error(
        error.response?.data?.error || 'User service unavailable'
      );
    }
  }

  async getUserPreferences(userId: string): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await this.client.get(`/users/${userId}/preferences`);
      
      if (response.data.success) {
        return ApiResponse.success(response.data.data);
      }

      return ApiResponse.error(response.data.error || 'Failed to fetch user preferences');
    } catch (error: any) {
      console.error('Get user preferences error:', error);
      return ApiResponse.error(
        error.response?.data?.error || 'User service unavailable'
      );
    }
  }

  async getCompleteUserProfile(userId: string): Promise<ApiResponse<CompleteUserProfile>> {
    try {
      const response = await this.client.get(`/users/${userId}/complete`);
      
      if (response.data.success) {
        return ApiResponse.success(response.data.data);
      }

      return ApiResponse.error(response.data.error || 'Failed to fetch complete user profile');
    } catch (error: any) {
      console.error('Get complete user profile error:', error);
      return ApiResponse.error(
        error.response?.data?.error || 'User service unavailable'
      );
    }
  }

  async searchUsers(query: string, limit: number = 10): Promise<ApiResponse<UserProfile[]>> {
    try {
      const response = await this.client.get('/users/search', {
        params: { query, limit },
      });
      
      if (response.data.success) {
        return ApiResponse.success(response.data.data);
      }

      return ApiResponse.error(response.data.error || 'User search failed');
    } catch (error: any) {
      console.error('Search users error:', error);
      return ApiResponse.error(
        error.response?.data?.error || 'User service unavailable'
      );
    }
  }

  async updateUserProfile(
    userId: string, 
    updates: Partial<UserProfile>
  ): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await this.client.patch(`/users/${userId}/profile`, updates);
      
      if (response.data.success) {
        return ApiResponse.success(response.data.data);
      }

      return ApiResponse.error(response.data.error || 'Failed to update user profile');
    } catch (error: any) {
      console.error('Update user profile error:', error);
      return ApiResponse.error(
        error.response?.data?.error || 'User service unavailable'
      );
    }
  }
}