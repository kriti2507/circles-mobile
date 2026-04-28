/**
 * Socket Service
 * WebSocket connection management with Socket.io
 */

import { io, Socket } from 'socket.io-client';
import { Config, AppConfig } from '../constants/config';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { onTokenRefreshed } from './api';
import type { Message, TypingEvent, MemberEvent } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private joinedRooms = new Set<string>();
  private unsubTokenRefresh: (() => void) | null = null;

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    const tokens = useAuthStore.getState().tokens;
    if (!tokens?.accessToken) {
      console.warn('Cannot connect socket: No auth token');
      return;
    }

    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    // Clean up previous socket instance if it exists but is disconnected
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket = null;
    }

    this.socket = io(Config.SOCKET_URL, {
      auth: {
        token: tokens.accessToken,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: AppConfig.SOCKET_RECONNECT_DELAY,
      reconnectionAttempts: 5,
    });

    this.setupEventHandlers();

    // BUG 2: Subscribe to token refresh so socket auth stays current
    this.unsubTokenRefresh = onTokenRefreshed((newTokens) => {
      if (this.socket) {
        this.socket.auth = { token: newTokens.accessToken };
        // If disconnected, the next reconnect will use the fresh token.
        // If connected, disconnect and reconnect with new token.
        if (this.socket.connected) {
          this.socket.disconnect().connect();
        }
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.unsubTokenRefresh) {
      this.unsubTokenRefresh();
      this.unsubTokenRefresh = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.joinedRooms.clear();
      useChatStore.getState().setIsConnected(false);
    }
  }

  /**
   * Join a chat room (BUG 8: dedup with Set)
   */
  joinRoom(roomType: 'circle' | 'activity', roomId: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot join room: Socket not connected');
      return;
    }

    const roomKey = `${roomType}:${roomId}`;
    if (this.joinedRooms.has(roomKey)) {
      return;
    }

    this.socket.emit('chat:join', { room_type: roomType, room_id: roomId });
    this.joinedRooms.add(roomKey);
    useChatStore.getState().initRoom(roomId, roomType);
  }

  /**
   * Leave a chat room
   */
  leaveRoom(roomType: 'circle' | 'activity', roomId: string): void {
    if (!this.socket?.connected) return;

    const roomKey = `${roomType}:${roomId}`;
    this.joinedRooms.delete(roomKey);
    this.socket.emit('chat:leave', { room_type: roomType, room_id: roomId });
  }

  // BUG 15/22: sendMessage removed — messages go through REST, server broadcasts via socket

  /**
   * Send typing indicator
   */
  sendTyping(roomType: 'circle' | 'activity', roomId: string, isTyping: boolean): void {
    if (!this.socket?.connected) return;

    this.socket.emit('chat:typing', {
      room_type: roomType,
      room_id: roomId,
      is_typing: isTyping,
    });
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Register an event listener on the socket
   */
  on(event: string, handler: (...args: any[]) => void): void {
    this.socket?.on(event, handler);
  }

  /**
   * Remove an event listener from the socket
   */
  off(event: string, handler: (...args: any[]) => void): void {
    this.socket?.off(event, handler);
  }

  /**
   * Set up event handlers
   * BUG 3: Removed manual reconnect counter — socket.io handles reconnection internally
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      useChatStore.getState().setIsConnected(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      useChatStore.getState().setIsConnected(false);
    });

    // BUG 3: Use reconnect_failed instead of manual counter on connect_error
    this.socket.io.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after max attempts');
      useChatStore.getState().setIsConnected(false);
    });

    this.socket.on('error', (data: { message: string }) => {
      console.error('Socket server error:', data.message);
    });

    // Chat events
    this.socket.on('chat:message', (data: { message: Message }) => {
      const roomId = data.message.circleId || data.message.activityId;
      if (roomId) {
        useChatStore.getState().addMessage(roomId, data.message);
      }
    });

    this.socket.on('chat:typing', (data: TypingEvent & { room_id: string }) => {
      useChatStore
        .getState()
        .setUserTyping(data.room_id, data.userId, data.displayName, data.isTyping);
    });

    // Circle events
    this.socket.on('circle:prompt', (data: { prompt: any }) => {
      console.log('New prompt received:', data.prompt);
    });

    this.socket.on('circle:member_joined', (data: MemberEvent & { room_id: string }) => {
      console.log('Member joined:', data.user);
    });

    this.socket.on('circle:member_left', (data: { user_id: string; display_name: string }) => {
      console.log('Member left:', data.display_name);
    });

    // Activity events
    this.socket.on(
      'activity:participant_update',
      (data: { activity_id: string; user: any; status: string }) => {
        console.log('Participant update:', data);
      }
    );

    this.socket.on(
      'activity:status_change',
      (data: { activity_id: string; status: string }) => {
        console.log('Activity status change:', data);
      }
    );
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
