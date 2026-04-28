/**
 * useActivities Hook
 * Activity discovery and management
 */

import { useState, useCallback } from 'react';
import { useActivityStore } from '../stores/activityStore';
import { activitiesService } from '../services';
import type { Activity, CreateActivityData } from '../types';
import type { ApiError } from '../services/api';

interface LocationOverride {
  latitude: number;
  longitude: number;
}

export const useActivities = () => {
  const {
    activities,
    myActivities,
    currentActivity,
    isListLoading,
    isDetailLoading,
    isRefreshing,
    filters,
    setActivities,
    setMyActivities,
    setCurrentActivity,
    setIsListLoading,
    setIsDetailLoading,
    setIsRefreshing,
    setFilters,
    addActivity,
    updateActivity,
    removeActivity,
  } = useActivityStore();

  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch nearby activities
   * BUG 7: Read filters from getState() to avoid stale closure.
   * Accepts optional locationOverride so caller can pass freshly obtained coords.
   */
  const fetchActivities = useCallback(
    async (refresh = false, locationOverride?: LocationOverride) => {
      // Read latest filters from store, not from closure
      const currentFilters = useActivityStore.getState().filters;
      const lat = locationOverride?.latitude ?? currentFilters.latitude;
      const lng = locationOverride?.longitude ?? currentFilters.longitude;

      if (!lat || !lng) {
        setError('Location required to fetch activities');
        return;
      }

      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsListLoading(true);
      }
      setError(null);

      try {
        const result = await activitiesService.getActivities({
          lat,
          lng,
          radius: currentFilters.radius,
          status: 'open',
        });
        setActivities(result.activities);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
      } finally {
        setIsListLoading(false);
        setIsRefreshing(false);
      }
    },
    [setActivities, setIsListLoading, setIsRefreshing]
  );

  /**
   * Fetch my activities
   */
  const fetchMyActivities = useCallback(
    async (type: 'hosting' | 'participating' = 'participating') => {
      setIsListLoading(true);
      setError(null);

      try {
        const result = await activitiesService.getMyActivities({ type });
        setMyActivities(result);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
      } finally {
        setIsListLoading(false);
      }
    },
    [setMyActivities, setIsListLoading]
  );

  /**
   * Fetch activity details
   * BUG 19: Uses isDetailLoading instead of shared isLoading
   */
  const fetchActivity = useCallback(
    async (activityId: string) => {
      setIsDetailLoading(true);
      setError(null);

      try {
        const result = await activitiesService.getActivity(activityId);
        setCurrentActivity({
          ...result.activity,
          participants: result.participants,
          isParticipating: result.isParticipating,
        });
        return result;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
        throw err;
      } finally {
        setIsDetailLoading(false);
      }
    },
    [setCurrentActivity, setIsDetailLoading]
  );

  /**
   * Create a new activity
   */
  const createActivity = useCallback(
    async (data: CreateActivityData) => {
      setError(null);

      try {
        const activity = await activitiesService.createActivity({
          title: data.title,
          description: data.description,
          locationName: data.locationName,
          lat: data.latitude,
          lng: data.longitude,
          scheduledAt: data.scheduledAt,
          maxParticipants: data.maxParticipants,
        });
        addActivity(activity);
        return activity;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
        throw err;
      }
    },
    [addActivity]
  );

  /**
   * Join an activity
   */
  const joinActivity = useCallback(
    async (activityId: string) => {
      setError(null);

      try {
        await activitiesService.joinActivity(activityId);
        // Refresh activity to get updated participant list
        await fetchActivity(activityId);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
        throw err;
      }
    },
    [fetchActivity]
  );

  /**
   * Leave an activity
   */
  const leaveActivity = useCallback(
    async (activityId: string) => {
      setError(null);

      try {
        await activitiesService.leaveActivity(activityId);
        // Refresh activity
        await fetchActivity(activityId);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
        throw err;
      }
    },
    [fetchActivity]
  );

  /**
   * Approve or decline a participant
   */
  const respondToParticipant = useCallback(
    async (
      activityId: string,
      userId: string,
      status: 'approved' | 'declined'
    ) => {
      setError(null);

      try {
        await activitiesService.updateParticipant(activityId, userId, { status });
        // Refresh activity
        await fetchActivity(activityId);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
        throw err;
      }
    },
    [fetchActivity]
  );

  /**
   * Delete an activity
   */
  const deleteActivity = useCallback(
    async (activityId: string) => {
      setError(null);

      try {
        await activitiesService.deleteActivity(activityId);
        removeActivity(activityId);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
        throw err;
      }
    },
    [removeActivity]
  );

  return {
    activities,
    myActivities,
    currentActivity,
    openActivities: activities.filter((a) => a.status === 'open'),
    isLoading: isListLoading,
    isDetailLoading,
    isRefreshing,
    filters,
    error,
    fetchActivities,
    fetchMyActivities,
    fetchActivity,
    createActivity,
    joinActivity,
    leaveActivity,
    respondToParticipant,
    deleteActivity,
    setFilters,
    clearError: () => setError(null),
  };
};

export default useActivities;
