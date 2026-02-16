/**
 * useAuth Hook
 * Authentication logic and state management
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { authService, usersService } from '../services';
import { socketService } from '../services/socket';
import type { ApiError } from '../services/api';

export const useAuth = () => {
  const router = useRouter();
  const { user, tokens, isAuthenticated, isOnboarded, login, logout, setIsLoading } =
    useAuthStore();

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.signUp(email, password);

      if (!result.token) {
        // Email confirmation required — stay on login screen
        return result;
      }

      // Auto-confirmed: full login flow
      const profile = await usersService.getMe();

      login(
        profile.user,
        { accessToken: result.token, refreshToken: result.refreshToken! },
        profile.settings
      );

      socketService.connect();

      router.replace('/(onboarding)/name');

      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [login, router]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await authService.signIn(email, password);

        // Get full user profile
        const profile = await usersService.getMe();

        // Store auth state
        login(
          profile.user,
          { accessToken: result.token, refreshToken: result.refreshToken },
          profile.settings
        );

        // Connect to socket
        socketService.connect();

        // Navigate based on onboarding status
        if (result.isNewUser || !profile.user.displayName) {
          router.replace('/(onboarding)/name');
        } else {
          router.replace('/(tabs)');
        }

        return result;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [login, router]
  );

  /**
   * Initialize auth state on app start
   */
  const initAuth = useCallback(async () => {
    setIsLoading(true);

    try {
      if (tokens?.accessToken) {
        // Try to fetch user profile to validate token
        const profile = await usersService.getMe();
        login(profile.user, tokens, profile.settings);
        socketService.connect();
      }
    } catch (err) {
      // Token invalid, clear auth state
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [tokens, login, logout, setIsLoading]);

  /**
   * Logout user
   */
  const signOut = useCallback(async () => {
    setLoading(true);

    try {
      await authService.logout();
    } finally {
      socketService.disconnect();
      logout();
      router.replace('/(auth)/welcome');
      setLoading(false);
    }
  }, [logout, router]);

  return {
    user,
    isAuthenticated,
    isOnboarded,
    isLoading,
    error,
    signUp,
    signIn,
    initAuth,
    signOut,
    clearError: () => setError(null),
  };
};

export default useAuth;
