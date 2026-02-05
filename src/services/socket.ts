/**
 * Socket Service
 * WebSocket connection management with Socket.io
 */

import { io, Socket } from 'socket.io-client';
import { Config, AppConfig } from '../constants/config';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import type { Message, TypingEvent, MemberEvent } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

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

    this.socket = io(Config.SOCKET_URL, {
      auth: {
        token: tokens.accessToken,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: AppConfig.SOCKET_RECONNECT_DELAY,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      useChatStore.getState().setIsConnected(false);
    }
  }

  /**
   * Join a chat room
   */
  joinRoom(roomType: 'circle' | 'activity', roomId: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot join room: Socket not connected');
      return;
    }

    this.socket.emit('chat:join', { room_type: roomType, room_id: roomId });
    useChatStore.getState().initRoom(roomId, roomType);
  }

  /**
   * Leave a chat room
   */
  leaveRoom(roomType: 'circle' | 'activity', roomId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('chat:leave', { room_type: roomType, room_id: roomId });
  }

  /**
   * Send a message to a room
   */
  sendMessage(roomType: 'circle' | 'activity', roomId: string, content: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot send message: Socket not connected');
      return;
    }

    this.socket.emit('chat:message', {
      room_type: roomType,
      room_id: roomId,
      content,
    });
  }

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
   * Set up event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
      useChatStore.getState().setIsConnected(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      useChatStore.getState().setIsConnected(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
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
      // Handle new prompt - this would update the circle store
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
