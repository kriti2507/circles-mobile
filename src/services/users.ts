/**
 * Users Service
 * User profile and settings API calls
 */

import api, { parseApiError } from './api';
import type { User, UserSettings } from '../types';
import type {
  GetMeResponse,
  UpdateProfileRequest,
  UpdateSettingsRequest,
  ReportUserRequest,
} from '../types/api.types';

export const usersService = {
  /**
   * Get current user profile with settings and circle
   */
  async getMe(): Promise<GetMeResponse> {
    try {
      const response = await api.get<GetMeResponse>('/users/me');
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    try {
      const response = await api.put<{ user: User }>('/users/me', data);
      return response.data.user;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Upload avatar image
   */
  async uploadAvatar(imageUri: string): Promise<string> {
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const response = await api.put<{ avatarUrl: string }>(
        '/users/me/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.avatarUrl;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    try {
      const response = await api.get<{ settings: UserSettings }>('/users/me/settings');
      return response.data.settings;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Update user settings
   */
  async updateSettings(data: UpdateSettingsRequest): Promise<UserSettings> {
    try {
      const response = await api.put<{ settings: UserSettings }>(
        '/users/me/settings',
        data
      );
      return response.data.settings;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    try {
      await api.delete('/users/me');
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Block a user
   */
  async blockUser(userId: string): Promise<void> {
    try {
      await api.post(`/users/${userId}/block`);
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<void> {
    try {
      await api.delete(`/users/${userId}/block`);
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Report a user
   */
  async reportUser(userId: string, data: ReportUserRequest): Promise<void> {
    try {
      await api.post(`/users/${userId}/report`, data);
    } catch (error) {
      throw parseApiError(error);
    }
  },
};

export default usersService;
