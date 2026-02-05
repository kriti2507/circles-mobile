/**
 * Activities Service
 * Activity API calls
 */

import api, { parseApiError } from './api';
import type { Activity, Message } from '../types';
import type {
  GetActivitiesQuery,
  GetActivitiesResponse,
  GetActivityResponse,
  CreateActivityRequest,
  UpdateActivityRequest,
  UpdateParticipantRequest,
  GetMyActivitiesQuery,
  GetMessagesResponse,
} from '../types/api.types';

export const activitiesService = {
  /**
   * Get nearby activities
   */
  async getActivities(query: GetActivitiesQuery): Promise<GetActivitiesResponse> {
    try {
      const response = await api.get<GetActivitiesResponse>('/activities', {
        params: query,
      });
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Get activity by ID
   */
  async getActivity(activityId: string): Promise<GetActivityResponse> {
    try {
      const response = await api.get<GetActivityResponse>(`/activities/${activityId}`);
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Create a new activity
   */
  async createActivity(data: CreateActivityRequest): Promise<Activity> {
    try {
      const response = await api.post<{ activity: Activity }>('/activities', data);
      return response.data.activity;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Update an activity
   */
  async updateActivity(
    activityId: string,
    data: UpdateActivityRequest
  ): Promise<Activity> {
    try {
      const response = await api.put<{ activity: Activity }>(
        `/activities/${activityId}`,
        data
      );
      return response.data.activity;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Delete an activity
   */
  async deleteActivity(activityId: string): Promise<void> {
    try {
      await api.delete(`/activities/${activityId}`);
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Request to join an activity
   */
  async joinActivity(activityId: string): Promise<{ status: string }> {
    try {
      const response = await api.post<{ status: string }>(
        `/activities/${activityId}/join`
      );
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Cancel join request or leave activity
   */
  async leaveActivity(activityId: string): Promise<void> {
    try {
      await api.delete(`/activities/${activityId}/join`);
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Approve or decline a participant (host only)
   */
  async updateParticipant(
    activityId: string,
    userId: string,
    data: UpdateParticipantRequest
  ): Promise<void> {
    try {
      await api.put(`/activities/${activityId}/participants/${userId}`, data);
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Get activity messages
   */
  async getMessages(
    activityId: string,
    query?: { before?: string; limit?: number }
  ): Promise<GetMessagesResponse> {
    try {
      const response = await api.get<GetMessagesResponse>(
        `/activities/${activityId}/messages`,
        { params: query }
      );
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Send message to activity chat
   */
  async sendMessage(activityId: string, content: string): Promise<Message> {
    try {
      const response = await api.post<{ message: Message }>(
        `/activities/${activityId}/messages`,
        { content }
      );
      return response.data.message;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Get my activities (hosting or participating)
   */
  async getMyActivities(query: GetMyActivitiesQuery): Promise<Activity[]> {
    try {
      const response = await api.get<{ activities: Activity[] }>(
        '/activities/mine',
        { params: query }
      );
      return response.data.activities;
    } catch (error) {
      throw parseApiError(error);
    }
  },
};

export default activitiesService;
