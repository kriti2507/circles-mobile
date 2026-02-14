/**
 * API Request/Response Types
 * These should be kept in sync with the backend
 */

// ============== Auth Endpoints ==============

export interface RequestCodeRequest {
  phone: string;
}

export interface RequestCodeResponse {
  success: boolean;
  expiresIn: number;
}

export interface VerifyCodeRequest {
  phone: string;
  code: string;
}

export interface VerifyCodeResponse {
  token: string;
  refreshToken: string;
  user: import('./index').User;
  isNewUser: boolean;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// ============== User Endpoints ==============

export interface GetMeResponse {
  user: import('./index').User;
  settings: import('./index').UserSettings;
  circle: import('./index').CircleWithMembers | null;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  city?: string;
  countryCode?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  languages?: string[];
  interests?: string[];
}

export interface UpdateSettingsRequest {
  language?: string;
  notificationsEnabled?: boolean;
  notificationsMessages?: boolean;
  notificationsPrompts?: boolean;
  notificationsActivities?: boolean;
  distanceUnit?: 'km' | 'miles';
}

export interface ReportUserRequest {
  reason: 'harassment' | 'spam' | 'inappropriate' | 'no_show' | 'other';
  details?: string;
}

// ============== Circle Endpoints ==============

export interface GetCircleResponse {
  circle: import('./index').Circle;
  members: import('./index').CircleMember[];
  prompt: import('./index').Prompt | null;
}

export interface JoinQueueResponse {
  position: number;
  estimatedWait: string;
}

export interface GetMessagesQuery {
  before?: string;
  limit?: number;
}

export interface GetMessagesResponse {
  messages: import('./index').Message[];
  hasMore: boolean;
}

export interface SendMessageRequest {
  content: string;
}

// ============== Activity Endpoints ==============

export interface GetActivitiesQuery {
  lat: number;
  lng: number;
  radius?: number;
  status?: 'open' | 'full' | 'completed' | 'cancelled';
}

export interface GetActivitiesResponse {
  activities: import('./index').Activity[];
}

export interface GetActivityResponse {
  activity: import('./index').Activity;
  participants: import('./index').ActivityParticipant[];
  isParticipating: boolean;
}

export interface CreateActivityRequest {
  title: string;
  description?: string;
  locationName: string;
  lat: number;
  lng: number;
  scheduledAt: string;
  maxParticipants?: number;
}

export interface UpdateActivityRequest {
  title?: string;
  description?: string;
  locationName?: string;
  scheduledAt?: string;
  status?: 'open' | 'full' | 'completed' | 'cancelled';
}

export interface UpdateParticipantRequest {
  status: 'approved' | 'declined';
}

export interface GetMyActivitiesQuery {
  type: 'hosting' | 'participating';
}
