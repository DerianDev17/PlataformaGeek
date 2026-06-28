export const CACHE_TTL = {
  SEARCH: 10_000,
  ADMIN_STATS: 30_000,
  TAGS: 60_000,
} as const;

export const RATE_LIMIT = {
  CLEANUP_INTERVAL_MS: 60_000,
  GENERAL_MAX: 100,
  GENERAL_WINDOW_SEC: 15 * 60,
  AUTH_MAX: 10,
  AUTH_WINDOW_SEC: 15 * 60,
  STRICT_MAX: 5,
  STRICT_WINDOW_SEC: 60 * 60,
} as const;

export const AUTH = {
  ACCESS_TOKEN_EXPIRY: process.env.JWT_EXPIRY || '15m',
  REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
} as const;

export const PORT = Number(process.env.PORT) || 3001;

export const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4321', 'http://localhost:3000'];
