import ApiClient from './ApiClient';
import type { ApiResponse } from './ApiClient';

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  displayName?: string;
}

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  nickname?: string;
  partner?: string;
  avatar?: string;
  createdAt: string;
}

class AuthApi {
  /**
   * Sign up a new user
   */
  async signup(
    email: string,
    password: string,
    displayName: string
  ): Promise<ApiResponse<AuthResponse>> {
    return ApiClient.post('/auth/signup', {
      email,
      password,
      displayName,
    });
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return ApiClient.post('/auth/login', {
      email,
      password,
    });
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<UserProfileData>> {
    return ApiClient.get('/auth/profile', { includeAuth: true });
  }

  /**
   * Update user profile
   */
  async updateProfile(
    displayName: string,
    nickname?: string,
    avatar?: string
  ): Promise<ApiResponse<UserProfileData>> {
    return ApiClient.put(
      '/auth/profile',
      {
        displayName,
        nickname,
        avatar,
      },
      { includeAuth: true }
    );
  }

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<ApiResponse<UserProfileData[]>> {
    return ApiClient.get(`/users/search?q=${encodeURIComponent(query)}`, {
      includeAuth: true,
    });
  }

  /**
   * Connect with partner
   */
  async connectWithPartner(partnerEmail: string): Promise<ApiResponse> {
    return ApiClient.post(
      '/users/connect',
      { partnerEmail },
      { includeAuth: true }
    );
  }
}

export default new AuthApi();
