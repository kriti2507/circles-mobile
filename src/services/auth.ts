/**
 * Auth Service
 * Authentication API calls
 */

import api, { parseApiError } from './api';
import type {
  RequestCodeRequest,
  RequestCodeResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  RefreshTokenResponse,
} from '../types/api.types';

export const authService = {
  /**
   * Request SMS verification code
   */
  async requestCode(phone: string): Promise<RequestCodeResponse> {
    try {
      const response = await api.post<RequestCodeResponse>('/auth/request-code', {
        phone,
      } as RequestCodeRequest);
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Verify SMS code and get tokens
   */
  async verifyCode(phone: string, code: string): Promise<VerifyCodeResponse> {
    try {
      const response = await api.post<VerifyCodeResponse>('/auth/verify-code', {
        phone,
        code,
      } as VerifyCodeRequest);
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await api.post<RefreshTokenResponse>(
        '/auth/refresh',
        null,
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Dev login — get real tokens from the backend for a test user
   */
  async devLogin(): Promise<VerifyCodeResponse> {
    try {
      const response = await api.post<VerifyCodeResponse>('/auth/dev-login');
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Logout and invalidate tokens
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors, we'll clear local state anyway
      console.warn('Logout API error:', error);
    }
  },
};

export default authService;
