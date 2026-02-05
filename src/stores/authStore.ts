/**
 * Auth Store
 * Manages authentication state
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, AuthTokens, UserSettings } from '../types';

interface AuthState {
  // State
  user: User | null;
  settings: UserSettings | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSettings: (settings: UserSettings | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsOnboarded: (onboarded: boolean) => void;
  login: (user: User, tokens: AuthTokens, settings?: UserSettings) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  settings: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  isOnboarded: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setSettings: (settings) => set({ settings }),

      setTokens: (tokens) => set({ tokens }),

      setIsLoading: (isLoading) => set({ isLoading }),

      setIsOnboarded: (isOnboarded) => set({ isOnboarded }),

      login: (user, tokens, settings) => {
        const isOnboarded = !!(
          user.displayName &&
          user.city &&
          user.languages.length > 0 &&
          user.interests.length >= 3
        );

        set({
          user,
          tokens,
          settings: settings || null,
          isAuthenticated: true,
          isLoading: false,
          isOnboarded,
        });
      },

      logout: () => {
        set({
          ...initialState,
          isLoading: false,
        });
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          const isOnboarded = !!(
            updatedUser.displayName &&
            updatedUser.city &&
            updatedUser.languages.length > 0 &&
            updatedUser.interests.length >= 3
          );
          set({ user: updatedUser, isOnboarded });
        }
      },

      updateSettings: (updates) => {
        const currentSettings = get().settings;
        if (currentSettings) {
          set({ settings: { ...currentSettings, ...updates } });
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'circles-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        settings: state.settings,
        isOnboarded: state.isOnboarded,
      }),
    }
  )
);

// Selectors for common use cases
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsOnboarded = (state: AuthState) => state.isOnboarded;
export const selectTokens = (state: AuthState) => state.tokens;

export default useAuthStore;
