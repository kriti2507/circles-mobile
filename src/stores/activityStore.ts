/**
 * Activity Store
 * Manages activities state
 */

import { create } from 'zustand';
import type { Activity, ActivityWithDetails, ActivityParticipant } from '../types';

interface ActivityState {
  // State
  activities: Activity[];
  myActivities: Activity[];
  currentActivity: ActivityWithDetails | null;
  isListLoading: boolean;
  isDetailLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Filters
  filters: {
    latitude: number | null;
    longitude: number | null;
    radius: number;
    category: string | null;
  };

  // Actions
  setActivities: (activities: Activity[]) => void;
  setMyActivities: (activities: Activity[]) => void;
  setCurrentActivity: (activity: ActivityWithDetails | null) => void;
  setIsListLoading: (loading: boolean) => void;
  setIsDetailLoading: (loading: boolean) => void;
  setIsRefreshing: (refreshing: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ActivityState['filters']>) => void;

  // Activity actions
  addActivity: (activity: Activity) => void;
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  removeActivity: (activityId: string) => void;

  // Participant actions
  updateParticipant: (
    activityId: string,
    userId: string,
    status: ActivityParticipant['status']
  ) => void;

  reset: () => void;
}

const initialState = {
  activities: [],
  myActivities: [],
  currentActivity: null,
  isListLoading: false,
  isDetailLoading: false,
  isRefreshing: false,
  error: null,
  filters: {
    latitude: null,
    longitude: null,
    radius: 10,
    category: null,
  },
};

export const useActivityStore = create<ActivityState>((set, get) => ({
  ...initialState,

  setActivities: (activities) => set({ activities }),

  setMyActivities: (myActivities) => set({ myActivities }),

  setCurrentActivity: (currentActivity) => set({ currentActivity }),

  setIsListLoading: (isListLoading) => set({ isListLoading }),

  setIsDetailLoading: (isDetailLoading) => set({ isDetailLoading }),

  setIsRefreshing: (isRefreshing) => set({ isRefreshing }),

  setError: (error) => set({ error }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  addActivity: (activity) =>
    set((state) => ({
      activities: [activity, ...state.activities],
    })),

  updateActivity: (activityId, updates) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId ? { ...a, ...updates } : a
      ),
      myActivities: state.myActivities.map((a) =>
        a.id === activityId ? { ...a, ...updates } : a
      ),
      currentActivity:
        state.currentActivity?.id === activityId
          ? { ...state.currentActivity, ...updates }
          : state.currentActivity,
    })),

  removeActivity: (activityId) =>
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== activityId),
      myActivities: state.myActivities.filter((a) => a.id !== activityId),
      currentActivity:
        state.currentActivity?.id === activityId ? null : state.currentActivity,
    })),

  updateParticipant: (activityId, userId, status) =>
    set((state) => {
      if (state.currentActivity?.id === activityId) {
        return {
          currentActivity: {
            ...state.currentActivity,
            participants: state.currentActivity.participants.map((p) =>
              p.userId === userId ? { ...p, status } : p
            ),
          },
        };
      }
      return state;
    }),

  reset: () => set(initialState),
}));

// Selectors
export const selectActivities = (state: ActivityState) => state.activities;
export const selectMyActivities = (state: ActivityState) => state.myActivities;
export const selectOpenActivities = (state: ActivityState) =>
  state.activities.filter((a) => a.status === 'open');

export default useActivityStore;
