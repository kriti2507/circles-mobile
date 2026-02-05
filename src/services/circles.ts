/**
 * Circles Service
 * Circle and matching queue API calls
 */

import api, { parseApiError } from './api';
import type { Message } from '../types';
import type {
  GetCircleResponse,
  JoinQueueResponse,
  GetMessagesQuery,
  GetMessagesResponse,
  SendMessageRequest,
} from '../types/api.types';

export const circlesService = {
  /**
   * Get user's current circle
   */
  async getMyCircle(): Promise<GetCircleResponse | null> {
    try {
      const response = await api.get<GetCircleResponse | null>('/circles/mine');
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Join the matching queue
   */
  async joinQueue(): Promise<JoinQueueResponse> {
    try {
      const response = await api.post<JoinQueueResponse>('/circles/join-queue');
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Leave the matching queue
   */
  async leaveQueue(): Promise<void> {
    try {
      await api.delete('/circles/leave-queue');
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Leave current circle
   */
  async leaveCircle(): Promise<void> {
    try {
      await api.post('/circles/mine/leave');
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Get circle messages with pagination
   */
  async getMessages(query?: GetMessagesQuery): Promise<GetMessagesResponse> {
    try {
      const response = await api.get<GetMessagesResponse>('/circles/mine/messages', {
        params: query,
      });
      return response.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Send a message to the circle
   */
  async sendMessage(content: string): Promise<Message> {
    try {
      const response = await api.post<{ message: Message }>(
        '/circles/mine/messages',
        { content } as SendMessageRequest
      );
      return response.data.message;
    } catch (error) {
      throw parseApiError(error);
    }
  },
};

export default circlesService;
