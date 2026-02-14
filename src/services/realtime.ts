/**
 * Realtime Service
 * Supabase Realtime subscription management
 * Provides typed subscription helpers for circle and activity events
 */

import type { Message, CircleMember, Prompt } from '../types';

type UnsubscribeFn = () => void;

interface CircleSubscriptionHandlers {
  onMessage?: (message: Message) => void;
  onMemberJoined?: (member: CircleMember) => void;
  onMemberLeft?: (userId: string) => void;
  onPromptDelivered?: (prompt: Prompt) => void;
}

interface ActivitySubscriptionHandlers {
  onMessage?: (message: Message) => void;
  onParticipantUpdate?: (data: { userId: string; status: string }) => void;
  onStatusChange?: (status: string) => void;
}

/**
 * Realtime subscription manager
 * This wraps the socket service to provide a higher-level API
 * that mirrors what Supabase Realtime provides
 */
class RealtimeService {
  private subscriptions = new Map<string, UnsubscribeFn>();

  /**
   * Subscribe to circle events
   */
  subscribeToCircle(
    circleId: string,
    handlers: CircleSubscriptionHandlers
  ): UnsubscribeFn {
    const channelKey = `circle-${circleId}`;

    const { socketService } = require('./socket');
    socketService.joinRoom('circle', circleId);

    // Wire handler callbacks to socket events
    const messageHandler = handlers.onMessage
      ? (data: { message: Message }) => handlers.onMessage!(data.message)
      : undefined;
    const memberJoinedHandler = handlers.onMemberJoined
      ? (data: { user: any; room_id: string }) =>
          handlers.onMemberJoined!({
            id: data.user.id,
            displayName: data.user.displayName,
            avatarUrl: data.user.avatarUrl,
          } as CircleMember)
      : undefined;
    const memberLeftHandler = handlers.onMemberLeft
      ? (data: { user_id: string }) => handlers.onMemberLeft!(data.user_id)
      : undefined;
    const promptHandler = handlers.onPromptDelivered
      ? (data: { prompt: Prompt }) => handlers.onPromptDelivered!(data.prompt)
      : undefined;

    if (messageHandler) socketService.on('chat:message', messageHandler);
    if (memberJoinedHandler) socketService.on('circle:member_joined', memberJoinedHandler);
    if (memberLeftHandler) socketService.on('circle:member_left', memberLeftHandler);
    if (promptHandler) socketService.on('circle:prompt', promptHandler);

    const unsubscribe = () => {
      if (messageHandler) socketService.off('chat:message', messageHandler);
      if (memberJoinedHandler) socketService.off('circle:member_joined', memberJoinedHandler);
      if (memberLeftHandler) socketService.off('circle:member_left', memberLeftHandler);
      if (promptHandler) socketService.off('circle:prompt', promptHandler);
      socketService.leaveRoom('circle', circleId);
      this.subscriptions.delete(channelKey);
    };

    this.subscriptions.set(channelKey, unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to activity events
   */
  subscribeToActivity(
    activityId: string,
    handlers: ActivitySubscriptionHandlers
  ): UnsubscribeFn {
    const channelKey = `activity-${activityId}`;

    const { socketService } = require('./socket');
    socketService.joinRoom('activity', activityId);

    // Wire handler callbacks to socket events
    const messageHandler = handlers.onMessage
      ? (data: { message: Message }) => handlers.onMessage!(data.message)
      : undefined;
    const participantHandler = handlers.onParticipantUpdate
      ? (data: { activity_id: string; user: any; status: string }) =>
          handlers.onParticipantUpdate!({ userId: data.user.id, status: data.status })
      : undefined;
    const statusHandler = handlers.onStatusChange
      ? (data: { activity_id: string; status: string }) =>
          handlers.onStatusChange!(data.status)
      : undefined;

    if (messageHandler) socketService.on('chat:message', messageHandler);
    if (participantHandler) socketService.on('activity:participant_update', participantHandler);
    if (statusHandler) socketService.on('activity:status_change', statusHandler);

    const unsubscribe = () => {
      if (messageHandler) socketService.off('chat:message', messageHandler);
      if (participantHandler) socketService.off('activity:participant_update', participantHandler);
      if (statusHandler) socketService.off('activity:status_change', statusHandler);
      socketService.leaveRoom('activity', activityId);
      this.subscriptions.delete(channelKey);
    };

    this.subscriptions.set(channelKey, unsubscribe);
    return unsubscribe;
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    for (const unsubscribe of this.subscriptions.values()) {
      unsubscribe();
    }
    this.subscriptions.clear();
  }
}

export const realtimeService = new RealtimeService();
export default realtimeService;
