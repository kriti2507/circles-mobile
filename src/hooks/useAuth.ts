/**
 * useAuth Hook
 * Authentication logic and state management
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { authService, usersService } from '../services';
import { socketService } from '../services/socket';
import { parseApiError } from '../services/api';

export const useAuth = () => {
  const router = useRouter();
  const { user, tokens, isAuthenticated, isOnboarded, login, logout, setIsLoading, setTokens } =
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

      // Store tokens first so the Axios interceptor can attach them to subsequent requests
      const newTokens = { accessToken: result.token, refreshToken: result.refreshToken! };
      setTokens(newTokens);

      const profile = await usersService.getMe();

      login(
        profile.user,
        newTokens,
        profile.settings
      );

      socketService.connect();

      router.replace('/(onboarding)/name');

      return result;
    } catch (err) {
      setError(parseApiError(err).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [login, setTokens, router]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await authService.signIn(email, password);

        // Store tokens first so the Axios interceptor can attach them to subsequent requests
        const newTokens = { accessToken: result.token, refreshToken: result.refreshToken };
        setTokens(newTokens);

        const profile = await usersService.getMe();

        login(
          profile.user,
          newTokens,
          profile.settings
        );

        socketService.connect();

        if (result.isNewUser || !profile.user.displayName) {
          router.replace('/(onboarding)/name');
        } else {
          router.replace('/(tabs)');
        }

        return result;
      } catch (err) {
        setError(parseApiError(err).message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [login, setTokens, router]
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
