/**
 * useChat Hook
 * Chat messages and real-time functionality
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { circlesService, activitiesService } from '../services';
import { socketService } from '../services/socket';
import { AppConfig } from '../constants/config';
import type { Message } from '../types';
import type { ApiError } from '../services/api';

interface UseChatOptions {
  roomType: 'circle' | 'activity';
  roomId: string;
}

export const useChat = ({ roomType, roomId }: UseChatOptions) => {
  const user = useAuthStore((state) => state.user);

  // BUG 10: Only destructure state values needed for rendering — not actions.
  // Actions are accessed via useChatStore.getState() inside callbacks to keep deps stable.
  const room = useChatStore((state) => state.rooms[roomId]);
  const isConnected = useChatStore((state) => state.isConnected);

  const [error, setError] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Derive room data
  const messages = room?.messages ?? [];
  const hasMore = room?.hasMore ?? true;
  const isLoading = room?.isLoading ?? false;
  const typingUsers = room?.typingUsers ?? {};

  // BUG 9: Guard — skip all socket/fetch operations if roomId is empty
  // Initialize room on mount
  useEffect(() => {
    if (!roomId) return;

    useChatStore.getState().initRoom(roomId, roomType);
    socketService.joinRoom(roomType, roomId);

    return () => {
      socketService.leaveRoom(roomType, roomId);
      // BUG 18: Clear typing timeout on unmount
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      // Clear typing indicator on unmount
      if (isTypingRef.current) {
        socketService.sendTyping(roomType, roomId, false);
        isTypingRef.current = false;
      }
    };
  }, [roomId, roomType]);

  /**
   * Fetch initial messages
   * BUG 10: Stable deps — only roomId and roomType. Actions via getState().
   */
  const fetchMessages = useCallback(async () => {
    if (!roomId) return;

    useChatStore.getState().setRoomLoading(roomId, true);
    setError(null);

    try {
      const result =
        roomType === 'circle'
          ? await circlesService.getMessages({ limit: AppConfig.MESSAGE_PAGE_SIZE })
          : await activitiesService.getMessages(roomId, {
              limit: AppConfig.MESSAGE_PAGE_SIZE,
            });

      useChatStore.getState().setMessages(roomId, result.messages, result.hasMore);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      useChatStore.getState().setMessages(roomId, [], false);
    } finally {
      useChatStore.getState().setRoomLoading(roomId, false);
    }
  }, [roomId, roomType]);

  /**
   * Load more (older) messages
   * BUG 29: On error, don't call prependMessages — leave hasMore unchanged so user can retry
   */
  const loadMore = useCallback(async () => {
    const currentRoom = useChatStore.getState().rooms[roomId];
    if (!currentRoom || !currentRoom.hasMore || currentRoom.isLoading || currentRoom.messages.length === 0) return;

    useChatStore.getState().setRoomLoading(roomId, true);

    try {
      const oldestMessage = currentRoom.messages[currentRoom.messages.length - 1];
      const result =
        roomType === 'circle'
          ? await circlesService.getMessages({
              before: oldestMessage.createdAt,
              limit: AppConfig.MESSAGE_PAGE_SIZE,
            })
          : await activitiesService.getMessages(roomId, {
              before: oldestMessage.createdAt,
              limit: AppConfig.MESSAGE_PAGE_SIZE,
            });

      useChatStore.getState().prependMessages(roomId, result.messages, result.hasMore);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      // BUG 29: Don't set hasMore to false on error — just stop loading
      useChatStore.getState().setRoomLoading(roomId, false);
    }
  }, [roomId, roomType]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !user || !roomId) return;

      // Create optimistic message
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        circleId: roomType === 'circle' ? roomId : undefined,
        activityId: roomType === 'activity' ? roomId : undefined,
        senderId: user.id,
        senderName: user.displayName,
        senderAvatar: user.avatarUrl,
        content: content.trim(),
        messageType: 'text',
        createdAt: new Date().toISOString(),
      };

      useChatStore.getState().addOptimisticMessage(roomId, optimisticMessage);

      // Clear typing indicator
      if (isTypingRef.current) {
        socketService.sendTyping(roomType, roomId, false);
        isTypingRef.current = false;
      }

      try {
        const confirmedMessage =
          roomType === 'circle'
            ? await circlesService.sendMessage(content.trim())
            : await activitiesService.sendMessage(roomId, content.trim());

        useChatStore.getState().confirmMessage(roomId, tempId, confirmedMessage);
      } catch (err) {
        useChatStore.getState().failMessage(roomId, tempId);
        const apiError = err as ApiError;
        setError(apiError.message);
        throw err;
      }
    },
    [roomId, roomType, user]
  );

  /**
   * Handle typing indicator
   */
  const handleTyping = useCallback(() => {
    if (!roomId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketService.sendTyping(roomType, roomId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socketService.sendTyping(roomType, roomId, false);
      }
    }, AppConfig.TYPING_INDICATOR_TIMEOUT);
  }, [roomType, roomId]);

  // Get typing users as array
  const typingUsersList = Object.values(typingUsers)
    .filter((u) => Date.now() - u.timestamp < AppConfig.TYPING_INDICATOR_TIMEOUT)
    .map((u) => u.displayName);

  return {
    messages,
    hasMore,
    isLoading,
    isConnected,
    typingUsers: typingUsersList,
    error,
    fetchMessages,
    loadMore,
    sendMessage,
    handleTyping,
    clearError: () => setError(null),
  };
};

export default useChat;
