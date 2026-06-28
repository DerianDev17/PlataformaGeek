import { Router } from 'express';
import { asyncDb, cache } from '../db/index.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { userQuerySchema, usernameParamSchema } from '../validators/schemas.js';
import { success, error } from '../lib/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/ranking', validate(userQuerySchema, 'query'), asyncHandler(async (req, res) => {
  const { limit } = (req as any).validatedQuery;

  const cacheKey = `ranking:${limit}`;
  const cached = cache.get<Record<string, unknown>[]>(cacheKey);
  if (cached) {
    res.json(success(cached));
    return;
  }

  const users = await asyncDb.all(`
    SELECT u.id, u.username, u.display_name, u.avatar_url, u.role, u.xp, u.level,
      COUNT(DISTINCT a.id) as article_count,
      COUNT(DISTINCT c.id) as comment_count,
      u.created_at as joined_at
    FROM users u
    LEFT JOIN articles a ON a.author_id = u.id AND a.status = 'published'
    LEFT JOIN comments c ON c.author_id = u.id
    WHERE u.status = 'active'
    GROUP BY u.id
    ORDER BY u.xp DESC
    LIMIT ?
  `, limit) as Record<string, unknown>[];

  const data = users.map((u) => ({
    id: u.id,
    username: u.username,
    displayName: u.display_name,
    avatarUrl: u.avatar_url,
    role: u.role,
    xp: u.xp,
    level: u.level,
    articleCount: u.article_count,
    commentCount: u.comment_count,
    joinedAt: u.joined_at,
  }));

  cache.set(cacheKey, data, 60_000);
  res.json(success(data));
}));

router.get('/:username', validate(usernameParamSchema, 'params'), optionalAuth, asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await asyncDb.get(`
    SELECT id, username, email, display_name, avatar_url, bio, role, status, xp, level, created_at
    FROM users WHERE username = ?
  `, username) as Record<string, unknown> | undefined;

  if (!user) {
    return res.status(404).json(error('NOT_FOUND', 'Usuario no encontrado'));
  }

  const [articleCount, commentCount, badges] = await Promise.all([
    asyncDb.get("SELECT COUNT(*) as count FROM articles WHERE author_id = ? AND status = 'published'", user.id),
    asyncDb.get('SELECT COUNT(*) as count FROM comments WHERE author_id = ?', user.id),
    asyncDb.all(`
      SELECT b.id, b.name, b.slug, b.description, b.icon, ub.earned_at
      FROM user_badges ub JOIN badges b ON b.id = ub.badge_id
      WHERE ub.user_id = ?
    `, user.id),
  ]);

  res.json(success({
    id: user.id,
    username: user.username,
    email: req.user?.id === user.id || req.user?.role === 'admin' ? user.email : undefined,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    role: user.role,
    status: user.status,
    xp: user.xp,
    level: user.level,
    articleCount: (articleCount as { count: number }).count,
    commentCount: (commentCount as { count: number }).count,
    badges: (badges as Record<string, unknown>[]).map((b) => ({ id: b.id, name: b.name, slug: b.slug, description: b.description, icon: b.icon, earnedAt: b.earned_at })),
    joinedAt: user.created_at,
    lastActiveAt: user.created_at,
  }));
}));

router.get('/:username/articles', validate(usernameParamSchema, 'params'), validate(userQuerySchema, 'query'), asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { limit } = (req as any).validatedQuery;

  const user = await asyncDb.get('SELECT id FROM users WHERE username = ?', username) as { id: string } | undefined;
  if (!user) {
    return res.status(404).json(error('NOT_FOUND', 'Usuario no encontrado'));
  }

  const articles = await asyncDb.all(`
    SELECT a.id, a.title, a.slug, a.summary, a.cover_image, a.status, a.views, a.published_at, a.created_at, a.updated_at,
      u.id as universe_id, u.name as universe_name, u.slug as universe_slug
    FROM articles a
    JOIN universes u ON u.id = a.universe_id
    WHERE a.author_id = ? AND a.status = 'published'
    ORDER BY a.created_at DESC
    LIMIT ?
  `, user.id, limit) as Record<string, unknown>[];

  res.json(success(articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    summary: a.summary,
    coverImage: a.cover_image,
    status: a.status,
    views: a.views,
    universe: { id: a.universe_id, name: a.universe_name, slug: a.universe_slug },
    publishedAt: a.published_at,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  }))));
}));

router.get('/:username/contributions', validate(usernameParamSchema, 'params'), validate(userQuerySchema, 'query'), asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { limit } = (req as any).validatedQuery;

  const user = await asyncDb.get('SELECT id FROM users WHERE username = ?', username) as { id: string } | undefined;
  if (!user) {
    return res.status(404).json(error('NOT_FOUND', 'Usuario no encontrado'));
  }

  const revisions = await asyncDb.all(`
    SELECT r.id, r.article_id, r.title, r.change_summary, r.status,
      r.created_at, r.reviewed_at,
      a.slug as article_slug, a.title as article_title
    FROM revisions r
    JOIN articles a ON a.id = r.article_id
    WHERE r.author_id = ?
    ORDER BY r.created_at DESC
    LIMIT ?
  `, user.id, limit) as Record<string, unknown>[];

  res.json(success(revisions.map((r) => ({
    id: r.id,
    articleId: r.article_id,
    articleSlug: r.article_slug,
    articleTitle: r.article_title,
    title: r.title,
    changeSummary: r.change_summary,
    status: r.status,
    createdAt: r.created_at,
    reviewedAt: r.reviewed_at,
  }))));
}));

export default router;
