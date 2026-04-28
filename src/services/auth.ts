/**
 * Auth Service
 * Authentication API calls
 */

import api, { parseApiError } from './api';
import type {
  SignUpResponse,
  SignInResponse,
} from '../types/api.types';

export const authService = {
  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string): Promise<SignUpResponse> {
    try {
      const response = await api.post<SignUpResponse>('/auth/signup', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<SignInResponse> {
    try {
      const response = await api.post<SignInResponse>('/auth/signin', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  // refreshToken removed — token refresh is handled by the api.ts interceptor directly

  /**
   * Dev login — get real tokens from the backend for a test user
   */
  async devLogin(): Promise<SignInResponse> {
    try {
      const response = await api.post<SignInResponse>('/auth/dev-login');
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
