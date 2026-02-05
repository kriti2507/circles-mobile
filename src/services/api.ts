/**
 * API Client
 * Axios instance with interceptors for auth
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Config, AppConfig } from '../constants/config';
import { useAuthStore } from '../stores/authStore';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: Config.API_URL,
  timeout: AppConfig.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = useAuthStore.getState().tokens;
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = useAuthStore.getState().tokens;
        if (tokens?.refreshToken) {
          const response = await axios.post(`${Config.API_URL}/auth/refresh`, null, {
            headers: {
              Authorization: `Bearer ${tokens.refreshToken}`,
            },
          });

          const newTokens = {
            accessToken: response.data.token,
            refreshToken: response.data.refreshToken,
          };

          useAuthStore.getState().setTokens(newTokens);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Error helper
export interface ApiError {
  code: string;
  message: string;
  status?: number;
}

export const parseApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: { code: string; message: string } }>;
    if (axiosError.response?.data?.error) {
      return {
        ...axiosError.response.data.error,
        status: axiosError.response.status,
      };
    }
    return {
      code: 'NETWORK_ERROR',
      message: axiosError.message || 'Network error occurred',
      status: axiosError.response?.status,
    };
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'An unknown error occurred',
  };
};

export default api;
