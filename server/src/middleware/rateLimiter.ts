import { rateLimit } from './rateLimit.js';

export const generalLimiter = rateLimit(100, 15 * 60);

export const authLimiter = rateLimit(10, 15 * 60);

export const strictLimiter = rateLimit(5, 60 * 60);
