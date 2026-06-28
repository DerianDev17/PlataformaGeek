import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/index.js';
import { UnauthorizedError } from '../lib/errors.js';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  if (IS_PRODUCTION) {
    throw new Error(
      'FATAL: JWT_SECRET and JWT_REFRESH_SECRET must be set in production. ' +
      'Refusing to start with predictable token secrets.'
    );
  }
  console.warn(
    '\n\x1b[33m╔══════════════════════════════════════════════════════════╗\n' +
    '║  ADVERTENCIA: JWT secrets no configurados.              ║\n' +
    '║  Usando valores por defecto SOLO para desarrollo.       ║\n' +
    '║  Define JWT_SECRET y JWT_REFRESH_SECRET en produccion.  ║\n' +
    '╚══════════════════════════════════════════════════════════╝\x1b[0m\n'
  );
}

const JWT_SECRET = process.env.JWT_SECRET || 'nexogeek-dev-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'nexogeek-dev-refresh-secret-change-in-production';

export { JWT_SECRET, JWT_REFRESH_SECRET };

export interface AuthPayload {
  userId: string;
  role: string;
}

export function generateAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

export function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as AuthPayload;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role: string;
        status: string;
      };
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token no proporcionado'));
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    const db = getDb();
    const user = db.prepare('SELECT id, username, email, role, status FROM users WHERE id = ?').get(payload.userId) as
      | { id: string; username: string; email: string; role: string; status: string }
      | undefined;

    if (!user) {
      return next(new UnauthorizedError('Usuario no encontrado'));
    }
    if (user.status !== 'active') {
      return next(new UnauthorizedError('Cuenta suspendida o bloqueada'));
    }

    req.user = user;
    next();
  } catch {
    return next(new UnauthorizedError('Token inválido o expirado'));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    const db = getDb();
    const user = db.prepare('SELECT id, username, email, role, status FROM users WHERE id = ?').get(payload.userId) as
      | { id: string; username: string; email: string; role: string; status: string }
      | undefined;

    if (user && user.status === 'active') {
      req.user = user;
    }
  } catch {
    // Ignore invalid token for optional auth
  }
  next();
}
