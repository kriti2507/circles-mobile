/**
 * Chat Store
 * Manages chat messages and real-time state
 */

import { create } from 'zustand';
import type { Message } from '../types';

interface ChatRoom {
  id: string;
  type: 'circle' | 'activity';
  messages: Message[];
  hasMore: boolean;
  isLoading: boolean;
  typingUsers: Record<string, { displayName: string; timestamp: number }>;
}

interface ChatState {
  // State
  rooms: Record<string, ChatRoom>;
  activeRoomId: string | null;
  isConnected: boolean;

  // Actions
  setActiveRoom: (roomId: string | null) => void;
  setIsConnected: (connected: boolean) => void;

  // Room actions
  initRoom: (roomId: string, type: 'circle' | 'activity') => void;
  setMessages: (roomId: string, messages: Message[], hasMore: boolean) => void;
  addMessage: (roomId: string, message: Message) => void;
  prependMessages: (roomId: string, messages: Message[], hasMore: boolean) => void;
  setRoomLoading: (roomId: string, loading: boolean) => void;

  // Typing indicators
  setUserTyping: (roomId: string, userId: string, displayName: string, isTyping: boolean) => void;
  clearTypingUsers: (roomId: string) => void;

  // Optimistic updates
  addOptimisticMessage: (roomId: string, message: Message) => void;
  confirmMessage: (roomId: string, tempId: string, confirmedMessage: Message) => void;
  failMessage: (roomId: string, tempId: string) => void;

  reset: () => void;
}

const createEmptyRoom = (id: string, type: 'circle' | 'activity'): ChatRoom => ({
  id,
  type,
  messages: [],
  hasMore: true,
  isLoading: false,
  typingUsers: {},
});

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: {},
  activeRoomId: null,
  isConnected: false,

  setActiveRoom: (activeRoomId) => set({ activeRoomId }),

  setIsConnected: (isConnected) => set({ isConnected }),

  initRoom: (roomId, type) => {
    const rooms = get().rooms;
    if (!rooms[roomId]) {
      set({ rooms: { ...rooms, [roomId]: createEmptyRoom(roomId, type) } });
    }
  },

  setMessages: (roomId, messages, hasMore) => {
    const room = get().rooms[roomId];
    if (room) {
      set({
        rooms: {
          ...get().rooms,
          [roomId]: { ...room, messages, hasMore, isLoading: false },
        },
      });
    }
  },

  addMessage: (roomId, message) => {
    const room = get().rooms[roomId];
    if (room) {
      // Avoid duplicates
      if (!room.messages.find((m) => m.id === message.id)) {
        set({
          rooms: {
            ...get().rooms,
            [roomId]: { ...room, messages: [message, ...room.messages] },
          },
        });
      }
    }
  },

  prependMessages: (roomId, messages, hasMore) => {
    const room = get().rooms[roomId];
    if (room) {
      // Filter out duplicates
      const existingIds = new Set(room.messages.map((m) => m.id));
      const newMessages = messages.filter((m) => !existingIds.has(m.id));
      set({
        rooms: {
          ...get().rooms,
          [roomId]: {
            ...room,
            messages: [...room.messages, ...newMessages],
            hasMore,
            isLoading: false,
          },
        },
      });
    }
  },

  setRoomLoading: (roomId, loading) => {
    const room = get().rooms[roomId];
    if (room) {
      set({
        rooms: {
          ...get().rooms,
          [roomId]: { ...room, isLoading: loading },
        },
      });
    }
  },

  setUserTyping: (roomId, userId, displayName, isTyping) => {
    const room = get().rooms[roomId];
    if (room) {
      const typingUsers = { ...room.typingUsers };
      if (isTyping) {
        typingUsers[userId] = { displayName, timestamp: Date.now() };
      } else {
        delete typingUsers[userId];
      }
      set({
        rooms: {
          ...get().rooms,
          [roomId]: { ...room, typingUsers },
        },
      });
    }
  },

  clearTypingUsers: (roomId) => {
    const room = get().rooms[roomId];
    if (room) {
      set({
        rooms: {
          ...get().rooms,
          [roomId]: { ...room, typingUsers: {} },
        },
      });
    }
  },

  addOptimisticMessage: (roomId, message) => {
    const room = get().rooms[roomId];
    if (room) {
      set({
        rooms: {
          ...get().rooms,
          [roomId]: { ...room, messages: [message, ...room.messages] },
        },
      });
    }
  },

  confirmMessage: (roomId, tempId, confirmedMessage) => {
    const room = get().rooms[roomId];
    if (room) {
      // If the socket handler already added the real message, just remove the optimistic one
      const alreadyExists = room.messages.some((m) => m.id === confirmedMessage.id);

      const messages = alreadyExists
        ? room.messages.filter((m) => m.id !== tempId)
        : room.messages.map((m) => (m.id === tempId ? confirmedMessage : m));

      set({
        rooms: {
          ...get().rooms,
          [roomId]: { ...room, messages },
        },
      });
    }
  },

  failMessage: (roomId, tempId) => {
    const room = get().rooms[roomId];
    if (room) {
      set({
        rooms: {
          ...get().rooms,
          [roomId]: {
            ...room,
            messages: room.messages.map((m) =>
              m.id === tempId ? { ...m, failed: true } : m
            ),
          },
        },
      });
    }
  },

  reset: () =>
    set({
      rooms: {},
      activeRoomId: null,
      isConnected: false,
    }),
}));

// Selectors
export const selectRoom = (roomId: string) => (state: ChatState) =>
  state.rooms[roomId];
export const selectMessages = (roomId: string) => (state: ChatState) =>
  state.rooms[roomId]?.messages ?? [];
export const selectTypingUsers = (roomId: string) => (state: ChatState) =>
  state.rooms[roomId]?.typingUsers ?? {};

export default useChatStore;
