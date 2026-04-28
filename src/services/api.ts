/**
 * API Client
 * Axios instance with interceptors for auth
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Config, AppConfig } from '../constants/config';
import { useAuthStore } from '../stores/authStore';
import type { AuthTokens } from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: Config.API_URL,
  timeout: AppConfig.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Token refresh mutex (BUG 1) ---
let refreshPromise: Promise<AuthTokens> | null = null;
type TokenRefreshCallback = (tokens: AuthTokens) => void;
const tokenRefreshListeners: Set<TokenRefreshCallback> = new Set();

/**
 * Subscribe to token refresh events.
 * Returns an unsubscribe function.
 */
export function onTokenRefreshed(callback: TokenRefreshCallback): () => void {
  tokenRefreshListeners.add(callback);
  return () => {
    tokenRefreshListeners.delete(callback);
  };
}

function notifyTokenRefreshListeners(tokens: AuthTokens) {
  for (const cb of tokenRefreshListeners) {
    try { cb(tokens); } catch {}
  }
}

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

// Response interceptor - handle token refresh with mutex
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // If a refresh is already in-flight, wait for it instead of issuing a new one
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const tokens = useAuthStore.getState().tokens;
            if (!tokens?.refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await axios.post(`${Config.API_URL}/auth/refresh`, null, {
              headers: {
                Authorization: `Bearer ${tokens.refreshToken}`,
              },
            });

            const newTokens: AuthTokens = {
              accessToken: response.data.token,
              refreshToken: response.data.refreshToken,
            };

            useAuthStore.getState().setTokens(newTokens);
            notifyTokenRefreshListeners(newTokens);
            return newTokens;
          })();
        }

        const newTokens = await refreshPromise;
        refreshPromise = null;

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
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
