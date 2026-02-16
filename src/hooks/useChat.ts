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
  const {
    rooms,
    isConnected,
    initRoom,
    setMessages,
    addMessage,
    prependMessages,
    setRoomLoading,
    addOptimisticMessage,
    confirmMessage,
    failMessage,
    setUserTyping,
  } = useChatStore();

  const [error, setError] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Get room data
  const room = rooms.get(roomId);
  const messages = room?.messages ?? [];
  const hasMore = room?.hasMore ?? true;
  const isLoading = room?.isLoading ?? false;
  const typingUsers = room?.typingUsers ?? new Map();

  // Initialize room on mount
  useEffect(() => {
    initRoom(roomId, roomType);
    socketService.joinRoom(roomType, roomId);

    return () => {
      socketService.leaveRoom(roomType, roomId);
      // Clear typing indicator on unmount
      if (isTypingRef.current) {
        socketService.sendTyping(roomType, roomId, false);
      }
    };
  }, [roomId, roomType, initRoom]);

  /**
   * Fetch initial messages
   */
  const fetchMessages = useCallback(async () => {
    setRoomLoading(roomId, true);
    setError(null);

    try {
      const result =
        roomType === 'circle'
          ? await circlesService.getMessages({ limit: AppConfig.MESSAGE_PAGE_SIZE })
          : await activitiesService.getMessages(roomId, {
              limit: AppConfig.MESSAGE_PAGE_SIZE,
            });

      setMessages(roomId, result.messages.reverse(), result.hasMore);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setRoomLoading(roomId, false);
    }
  }, [roomId, roomType, setMessages, setRoomLoading]);

  /**
   * Load more (older) messages
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || messages.length === 0) return;

    setRoomLoading(roomId, true);

    try {
      const oldestMessage = messages[0];
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

      prependMessages(roomId, result.messages.reverse(), result.hasMore);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setRoomLoading(roomId, false);
    }
  }, [roomId, roomType, hasMore, isLoading, messages, prependMessages, setRoomLoading]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !user) return;

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

      addOptimisticMessage(roomId, optimisticMessage);

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

        confirmMessage(roomId, tempId, confirmedMessage);
      } catch (err) {
        failMessage(roomId, tempId);
        const apiError = err as ApiError;
        setError(apiError.message);
        throw err;
      }
    },
    [roomId, roomType, user, addOptimisticMessage, confirmMessage, failMessage]
  );

  /**
   * Handle typing indicator
   */
  const handleTyping = useCallback(() => {
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
  const typingUsersList = Array.from(typingUsers.values())
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
