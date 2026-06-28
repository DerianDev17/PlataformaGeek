import type { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../lib/errors.js';

const store = new Map<string, { count: number; resetAt: number }>();

// Rate limiting enabled
const BYPASS_FOR_LOAD_TEST = false;

export function rateLimit(maxRequests: number, windowSeconds: number) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (BYPASS_FOR_LOAD_TEST) return next();

    const key = req.ip || '127.0.0.1';
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      return next();
    }

    if (entry.count >= maxRequests) {
      return next(new RateLimitError());
    }

    entry.count++;
    next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);
