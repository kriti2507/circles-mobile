/**
 * Chat Store
 * Manages chat messages and real-time state
 */

import { create } from 'zustand';
import type { Message, TypingEvent } from '../types';

interface ChatRoom {
  id: string;
  type: 'circle' | 'activity';
  messages: Message[];
  hasMore: boolean;
  isLoading: boolean;
  typingUsers: Map<string, { displayName: string; timestamp: number }>;
}

interface ChatState {
  // State
  rooms: Map<string, ChatRoom>;
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
  typingUsers: new Map(),
});

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: new Map(),
  activeRoomId: null,
  isConnected: false,

  setActiveRoom: (activeRoomId) => set({ activeRoomId }),

  setIsConnected: (isConnected) => set({ isConnected }),

  initRoom: (roomId, type) => {
    const rooms = new Map(get().rooms);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, createEmptyRoom(roomId, type));
      set({ rooms });
    }
  },

  setMessages: (roomId, messages, hasMore) => {
    const rooms = new Map(get().rooms);
    const room = rooms.get(roomId);
    if (room) {
      rooms.set(roomId, { ...room, messages, hasMore, isLoading: false });
      set({ rooms });
    }
  },

  addMessage: (roomId, message) => {
    const rooms = new Map(get().rooms);
    const room = rooms.get(roomId);
    if (room) {
      // Avoid duplicates
      if (!room.messages.find((m) => m.id === message.id)) {
        rooms.set(roomId, {
          ...room,
          messages: [...room.messages, message],
        });
        set({ rooms });
      }
    }
  },

  prependMessages: (roomId, messages, hasMore) => {
    const rooms = new Map(get().rooms);
    const room = rooms.get(roomId);
    if (room) {
      // Filter out duplicates
      const existingIds = new Set(room.messages.map((m) => m.id));
      const newMessages = messages.filter((m) => !existingIds.has(m.id));
      rooms.set(roomId, {
        ...room,
        messages: [...newMessages, ...room.messages],
        hasMore,
        isLoading: false,
      });
      set({ rooms });
    }
  },

  setRoomLoading: (roomId, loading) => {
    const rooms = new Map(get().rooms);
    const room = rooms.get(roomId);
    if (room) {
      rooms.set(roomId, { ...room, isLoading: loading });
      set({ rooms });
    }
  },

  setUserTyping: (roomId, userId, displayName, isTyping) => {
    const rooms = new Map(get().rooms);
    const room = rooms.get(roomId);
    if (room) {
      const typingUsers = new Map(room.typingUsers);
      if (isTyping) {
        typingUsers.set(userId, { displayName, timestamp: Date.now() });
      } else {
        typingUsers.delete(userId);
      }
      rooms.set(roomId, { ...room, typingUsers });
      set({ rooms });
    }
  },

  clearTypingUsers: (roomId) => {
    const rooms = new Map(get().rooms);
    const room = rooms.get(roomId);
    if (room) {
      rooms.set(roomId, { ...room, typingUsers: new Map() });
      set({ rooms });
    }
  },

  addOptimisticMessage: (roomId, message) => {
    const rooms = new Map(get().rooms);
    const room = rooms.get(roomId);
    if (room) {
      rooms.set(roomId, {
        ...room,
        messages: [...room.messages, { ...message, id: `temp-${Date.now()}` }],
      });
      set({ rooms });
    }
  },

  confirmMessage: (roomId, tempId, confirmedMessage) => {
    const rooms = new Map(get().rooms);
    const room = rooms.get(roomId);
    if (room) {
      rooms.set(roomId, {
        ...room,
        messages: room.messages.map((m) =>
          m.id === tempId ? confirmedMessage : m
        ),
      });
      set({ rooms });
    }
  },

  failMessage: (roomId, tempId) => {
    const rooms = new Map(get().rooms);
    const room = rooms.get(roomId);
    if (room) {
      rooms.set(roomId, {
        ...room,
        messages: room.messages.filter((m) => m.id !== tempId),
      });
      set({ rooms });
    }
  },

  reset: () =>
    set({
      rooms: new Map(),
      activeRoomId: null,
      isConnected: false,
    }),
}));

// Selectors
export const selectRoom = (roomId: string) => (state: ChatState) =>
  state.rooms.get(roomId);
export const selectMessages = (roomId: string) => (state: ChatState) =>
  state.rooms.get(roomId)?.messages ?? [];
export const selectTypingUsers = (roomId: string) => (state: ChatState) =>
  state.rooms.get(roomId)?.typingUsers ?? new Map();

export default useChatStore;
