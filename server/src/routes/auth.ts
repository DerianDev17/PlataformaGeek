import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, asyncDb, cache } from '../db/index.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';
import { success, error } from '../lib/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError, ConflictError, UnauthorizedError } from '../lib/errors.js';

const router = Router();

router.post('/login', rateLimit(10, 60), validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const db = getDb();

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as Record<string, unknown> | undefined;
  if (!user) {
    return res.status(401).json(error('UNAUTHORIZED', 'Credenciales inválidas'));
  }

  const valid = await verifyPassword(password, user.password_hash as string);
  if (!valid) {
    return res.status(401).json(error('UNAUTHORIZED', 'Credenciales inválidas'));
  }

  if (user.status !== 'active') {
    return res.status(401).json(error('UNAUTHORIZED', 'Cuenta suspendida o bloqueada'));
  }

  const payload = { userId: user.id as string, role: user.role as string };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(refreshToken, user.id);

  const { password_hash, refresh_token, ...safeUser } = user;

  res.json(success({
    user: {
      id: safeUser.id,
      username: safeUser.username,
      email: safeUser.email,
      displayName: safeUser.display_name,
      avatarUrl: safeUser.avatar_url,
      bio: safeUser.bio,
      role: safeUser.role,
      status: safeUser.status,
      xp: safeUser.xp,
      level: safeUser.level,
    },
    token: accessToken,
    refreshToken,
  }, 'Inicio de sesión exitoso'));
}));

router.post('/register', rateLimit(5, 60), validate(registerSchema), asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existing) {
    return res.status(409).json(error('CONFLICT', 'El email o nombre de usuario ya está en uso'));
  }

  const id = uuidv4();
  const passwordHash = await hashPassword(password);

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, display_name, role, status)
    VALUES (?, ?, ?, ?, ?, 'user', 'active')
  `).run(id, username, email, passwordHash, username);

  const user = db.prepare('SELECT id, username, email, display_name, avatar_url, bio, role, status, xp, level FROM users WHERE id = ?').get(id) as Record<string, unknown>;

  const payload = { userId: id, role: 'user' };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(refreshToken, id);

  cache.invalidate('ranking');
  res.status(201).json(success({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      role: user.role,
      status: user.status,
      xp: user.xp,
      level: user.level,
    },
    token: accessToken,
    refreshToken,
  }, 'Registro exitoso'));
}));

router.post('/refresh', rateLimit(10, 60), (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json(error('VALIDATION_ERROR', 'Refresh token requerido'));
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE refresh_token = ?').get(refreshToken) as Record<string, unknown> | undefined;

    if (!user) {
      return res.status(401).json(error('UNAUTHORIZED', 'Refresh token inválido'));
    }

    try {
      verifyRefreshToken(refreshToken as string);
    } catch {
      db.prepare('UPDATE users SET refresh_token = NULL WHERE id = ?').run(user.id);
      return res.status(401).json(error('UNAUTHORIZED', 'Refresh token expirado'));
    }

    const payload = { userId: user.id as string, role: user.role as string };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(newRefreshToken, user.id);

    res.json(success({ token: newAccessToken, refreshToken: newRefreshToken }, 'Token renovado'));
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authenticate, (req, res, next) => {
  try {
    const db = getDb();
    db.prepare('UPDATE users SET refresh_token = NULL WHERE id = ?').run(req.user!.id);
    res.json(success(null, 'Sesión cerrada'));
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await asyncDb.get(`
    SELECT id, username, email, display_name, avatar_url, bio, role, status, xp, level, created_at
    FROM users WHERE id = ?
  `, req.user!.id) as Record<string, unknown>;

  if (!user) {
    return res.status(404).json(error('NOT_FOUND', 'Usuario no encontrado'));
  }

  const [articleCount, commentCount] = await Promise.all([
    asyncDb.get('SELECT COUNT(*) as count FROM articles WHERE author_id = ?', req.user!.id),
    asyncDb.get('SELECT COUNT(*) as count FROM comments WHERE author_id = ?', req.user!.id),
  ]);

  res.json(success({
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    role: user.role,
    status: user.status,
    xp: user.xp,
    level: user.level,
    articleCount: (articleCount as { count: number }).count,
    commentCount: (commentCount as { count: number }).count,
    joinedAt: user.created_at,
  }));
}));

export default router;
