import { ApiResponse } from '../value-objects/api-response.vo';

export interface UserProfile {
  id: string;
  username: string;
  email: string; // ДОБАВИТЬ email
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  language: string;
}

export interface CompleteUserProfile {
  profile: UserProfile;
  preferences: UserPreferences;
  statistics?: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
  };
}

export interface IUserClient {
  getUserProfile(userId: string): Promise<ApiResponse<UserProfile>>;
  getUserPreferences(userId: string): Promise<ApiResponse<UserPreferences>>;
  getCompleteUserProfile(userId: string): Promise<ApiResponse<CompleteUserProfile>>;
  searchUsers(query: string, limit?: number): Promise<ApiResponse<UserProfile[]>>;
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>>;
  getUserProfileWithAuth(token: string, userId: string): Promise<ApiResponse<UserProfile>>; 
}