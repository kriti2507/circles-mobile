/**
 * App Configuration
 * Environment-specific settings
 */

type Environment = 'development' | 'staging' | 'production';

interface EnvConfig {
  API_URL: string;
  SOCKET_URL: string;
  DEBUG: boolean;
}

const ENV_CONFIG: Record<Environment, EnvConfig> = {
  development: {
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
    SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000',
    DEBUG: true,
  },
  staging: {
    API_URL: 'https://api.staging.circles.app/api/v1',
    SOCKET_URL: 'https://api.staging.circles.app',
    DEBUG: true,
  },
  production: {
    API_URL: 'https://api.circles.app/api/v1',
    SOCKET_URL: 'https://api.circles.app',
    DEBUG: false,
  },
};

// Get current environment from env variable or default to development
const getEnvironment = (): Environment => {
  const env = process.env.EXPO_PUBLIC_APP_ENV;
  if (env === 'staging' || env === 'production') {
    return env;
  }
  return 'development';
};

const currentEnv = getEnvironment();

export const Config = ENV_CONFIG[currentEnv];

// Development-only: Skip authentication
export const DEV_SKIP_AUTH = currentEnv === 'development';

// Mock data for development login (only used when DEV_SKIP_AUTH is true)
export const DEV_MOCK_USER = {
  id: 'dev-user-001',
  email: 'dev@circles.app',
  emailVerified: true,
  phone: '+1234567890',
  phoneVerified: true,
  displayName: 'Dev User',
  bio: 'Development test user',
  city: 'San Francisco',
  countryCode: 'US',
  languages: ['en'],
  interests: ['coding', 'testing', 'debugging'],
  status: 'active' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEV_MOCK_TOKENS = {
  accessToken: 'dev-access-token',
  refreshToken: 'dev-refresh-token',
};

export const DEV_MOCK_SETTINGS = {
  userId: 'dev-user-001',
  language: 'en',
  notificationsEnabled: true,
  notificationsMessages: true,
  notificationsPrompts: true,
  notificationsActivities: true,
  distanceUnit: 'km' as const,
  updatedAt: new Date().toISOString(),
};

// App-wide constants
export const AppConfig = {
  // App info
  APP_NAME: 'Circles',
  APP_VERSION: '1.0.0',

  // Circle settings
  MIN_CIRCLE_SIZE: 4,
  MAX_CIRCLE_SIZE: 6,

  // Profile settings
  MIN_INTERESTS: 3,
  MAX_INTERESTS: 10,
  MAX_BIO_LENGTH: 160,
  MAX_DISPLAY_NAME_LENGTH: 50,

  // Activity settings
  MIN_ACTIVITY_PARTICIPANTS: 2,
  MAX_ACTIVITY_PARTICIPANTS: 8,

  // Chat settings
  MESSAGE_PAGE_SIZE: 50,
  TYPING_INDICATOR_TIMEOUT: 3000, // ms

  // Location
  DEFAULT_SEARCH_RADIUS_KM: 10,
  MAX_SEARCH_RADIUS_KM: 50,

  // Timeouts
  API_TIMEOUT: 30000, // ms
  SOCKET_RECONNECT_DELAY: 1000, // ms

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
} as const;

export default Config;
