/**
 * Core Type Definitions
 * These types mirror the backend API types
 */

// ============== User Types ==============

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified?: boolean;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  city?: string;
  countryCode?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  languages: string[];
  interests: string[];
  status: 'active' | 'suspended' | 'deleted';
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  userId: string;
  language: string;
  notificationsEnabled: boolean;
  notificationsMessages: boolean;
  notificationsPrompts: boolean;
  notificationsActivities: boolean;
  distanceUnit: 'km' | 'miles';
  updatedAt: string;
}

export interface UserProfile extends User {
  settings?: UserSettings;
  circle?: Circle | null;
}

// ============== Circle Types ==============

export interface Circle {
  id: string;
  name: string;
  status: 'active' | 'dissolved';
  currentPromptId?: string;
  promptDeliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CircleMembership {
  id: string;
  circleId: string;
  userId: string;
  role: 'member';
  status: 'active' | 'left' | 'removed';
  joinedAt: string;
  leftAt?: string;
}

export interface CircleWithMembers extends Circle {
  members: CircleMember[];
  prompt?: Prompt | null;
}

export interface CircleMember {
  id: string;
  displayName: string;
  avatarUrl?: string;
  status: 'active' | 'left' | 'removed';
  joinedAt: string;
}

// ============== Prompt Types ==============

export interface Prompt {
  id: string;
  textEn: string;
  textJa?: string;
  textZh?: string;
  category: 'social' | 'exploration' | 'creative' | 'conversation';
  isActive: boolean;
  createdAt: string;
}

// ============== Message Types ==============

export interface Message {
  id: string;
  circleId?: string;
  activityId?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: 'text' | 'system' | 'prompt';
  createdAt: string;
}

// ============== Activity Types ==============

export interface Activity {
  id: string;
  hostId: string;
  host: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  title: string;
  description?: string;
  locationName?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  scheduledAt: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'open' | 'full' | 'completed' | 'cancelled' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface ActivityParticipant {
  id: string;
  activityId: string;
  userId: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  requestedAt: string;
  respondedAt?: string;
}

export interface ActivityWithDetails extends Activity {
  participants: ActivityParticipant[];
  isParticipating: boolean;
  userParticipantStatus?: 'pending' | 'approved' | 'declined' | 'cancelled';
}

// ============== Matching Queue Types ==============

export interface MatchingQueueStatus {
  inQueue: boolean;
  position?: number;
  estimatedWait?: string;
  joinedQueueAt?: string;
}

// ============== Auth Types ==============

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;
}

// ============== API Response Types ==============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  nextCursor?: string;
}

// ============== Form Types ==============

export interface OnboardingData {
  displayName: string;
  city: string;
  countryCode: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  languages: string[];
  interests: string[];
  bio?: string;
}

export interface CreateActivityData {
  title: string;
  description?: string;
  locationName: string;
  latitude: number;
  longitude: number;
  scheduledAt: string;
  maxParticipants: number;
}

// ============== Socket Event Types ==============

export interface SocketMessage {
  roomType: 'circle' | 'activity';
  roomId: string;
  content: string;
}

export interface TypingEvent {
  userId: string;
  displayName: string;
  isTyping: boolean;
}

export interface MemberEvent {
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
}
