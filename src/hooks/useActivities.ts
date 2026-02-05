/**
 * useActivities Hook
 * Activity discovery and management
 */

import { useState, useCallback } from 'react';
import { useActivityStore } from '../stores/activityStore';
import { activitiesService } from '../services';
import type { Activity, CreateActivityData } from '../types';
import type { ApiError } from '../services/api';

export const useActivities = () => {
  const {
    activities,
    myActivities,
    currentActivity,
    isLoading,
    isRefreshing,
    filters,
    setActivities,
    setMyActivities,
    setCurrentActivity,
    setIsLoading,
    setIsRefreshing,
    setFilters,
    addActivity,
    updateActivity,
    removeActivity,
  } = useActivityStore();

  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch nearby activities
   */
  const fetchActivities = useCallback(
    async (refresh = false) => {
      if (!filters.latitude || !filters.longitude) {
        setError('Location required to fetch activities');
        return;
      }

      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await activitiesService.getActivities({
          lat: filters.latitude,
          lng: filters.longitude,
          radius: filters.radius,
          status: 'open',
        });
        setActivities(result.activities);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [filters, setActivities, setIsLoading, setIsRefreshing]
  );

  /**
   * Fetch my activities
   */
  const fetchMyActivities = useCallback(
    async (type: 'hosting' | 'participating' = 'participating') => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await activitiesService.getMyActivities({ type });
        setMyActivities(result);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
      } finally {
        setIsLoading(false);
      }
    },
    [setMyActivities, setIsLoading]
  );

  /**
   * Fetch activity details
   */
  const fetchActivity = useCallback(
    async (activityId: string) => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    },
    [setCurrentActivity, setIsLoading]
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
    isLoading,
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
