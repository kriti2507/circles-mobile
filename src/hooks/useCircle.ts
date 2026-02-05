/**
 * useCircle Hook
 * Circle state and actions
 */

import { useState, useCallback, useEffect } from 'react';
import { useCircleStore } from '../stores/circleStore';
import { circlesService } from '../services';
import { socketService } from '../services/socket';
import type { ApiError } from '../services/api';

export const useCircle = () => {
  const {
    circle,
    members,
    currentPrompt,
    queueStatus,
    isLoading,
    setCircle,
    setMembers,
    setCurrentPrompt,
    setQueueStatus,
    setIsLoading,
    setError,
    leaveCircle: clearCircle,
  } = useCircleStore();

  const [error, setLocalError] = useState<string | null>(null);

  /**
   * Fetch current circle
   */
  const fetchCircle = useCallback(async () => {
    setIsLoading(true);
    setLocalError(null);

    try {
      const result = await circlesService.getMyCircle();
      if (result) {
        setCircle(result.circle);
        setMembers(result.members);
        setCurrentPrompt(result.prompt);

        // Join circle chat room
        socketService.joinRoom('circle', result.circle.id);
      } else {
        setCircle(null);
        setMembers([]);
        setCurrentPrompt(null);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setLocalError(apiError.message);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, [setCircle, setMembers, setCurrentPrompt, setIsLoading, setError]);

  /**
   * Join matching queue
   */
  const joinQueue = useCallback(async () => {
    setLocalError(null);

    try {
      const result = await circlesService.joinQueue();
      setQueueStatus({
        inQueue: true,
        position: result.position,
        estimatedWait: result.estimatedWait,
        joinedQueueAt: new Date().toISOString(),
      });
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setLocalError(apiError.message);
      throw err;
    }
  }, [setQueueStatus]);

  /**
   * Leave matching queue
   */
  const leaveQueue = useCallback(async () => {
    setLocalError(null);

    try {
      await circlesService.leaveQueue();
      setQueueStatus(null);
    } catch (err) {
      const apiError = err as ApiError;
      setLocalError(apiError.message);
      throw err;
    }
  }, [setQueueStatus]);

  /**
   * Leave current circle
   */
  const leaveCircle = useCallback(async () => {
    setLocalError(null);

    try {
      if (circle) {
        socketService.leaveRoom('circle', circle.id);
      }
      await circlesService.leaveCircle();
      clearCircle();
    } catch (err) {
      const apiError = err as ApiError;
      setLocalError(apiError.message);
      throw err;
    }
  }, [circle, clearCircle]);

  return {
    circle,
    members,
    activeMembers: members.filter((m) => m.status === 'active'),
    currentPrompt,
    queueStatus,
    isLoading,
    error,
    hasCircle: !!circle,
    isInQueue: queueStatus?.inQueue ?? false,
    fetchCircle,
    joinQueue,
    leaveQueue,
    leaveCircle,
    clearError: () => setLocalError(null),
  };
};

export default useCircle;
