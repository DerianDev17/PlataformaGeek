import { Router } from 'express';
import { getDb, asyncDb, cache } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { roleUpdateSchema } from '../validators/schemas.js';
import { success, error } from '../lib/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/stats', authenticate, requirePermission('access:admin'), asyncHandler(async (_req, res) => {
  const cached = cache.get<Record<string, unknown>>('admin:stats');
  if (cached) {
    res.json(success(cached));
    return;
  }

  const [
    totalUsers,
    activeUsers,
    totalArticles,
    publishedArticles,
    pendingArticles,
    totalUniverses,
    totalComments,
    totalTheories,
    pendingRevisions,
    usersByRole,
    articlesByUniverse,
    recentArticles,
  ] = await Promise.all([
    asyncDb.get('SELECT COUNT(*) as count FROM users'),
    asyncDb.get("SELECT COUNT(*) as count FROM users WHERE status = 'active'"),
    asyncDb.get('SELECT COUNT(*) as count FROM articles'),
    asyncDb.get("SELECT COUNT(*) as count FROM articles WHERE status = 'published'"),
    asyncDb.get("SELECT COUNT(*) as count FROM articles WHERE status = 'pending_review'"),
    asyncDb.get('SELECT COUNT(*) as count FROM universes'),
    asyncDb.get('SELECT COUNT(*) as count FROM comments'),
    asyncDb.get('SELECT COUNT(*) as count FROM theories'),
    asyncDb.get("SELECT COUNT(*) as count FROM revisions WHERE status = 'pending'"),
    asyncDb.all('SELECT role, COUNT(*) as count FROM users GROUP BY role'),
    asyncDb.all(`
      SELECT u.name, u.slug, COUNT(a.id) as count
      FROM universes u
      LEFT JOIN articles a ON a.universe_id = u.id AND a.status = 'published'
      GROUP BY u.id
      ORDER BY count DESC LIMIT 10
    `),
    asyncDb.all(`
      SELECT a.id, a.title, a.slug, a.status, a.views, a.created_at,
        usr.username as author_username
      FROM articles a
      JOIN users usr ON usr.id = a.author_id
      ORDER BY a.created_at DESC LIMIT 10
    `),
  ]);

  const data = {
    counts: {
      users: (totalUsers as { count: number }).count,
      activeUsers: (activeUsers as { count: number }).count,
      articles: (totalArticles as { count: number }).count,
      publishedArticles: (publishedArticles as { count: number }).count,
      pendingArticles: (pendingArticles as { count: number }).count,
      universes: (totalUniverses as { count: number }).count,
      comments: (totalComments as { count: number }).count,
      theories: (totalTheories as { count: number }).count,
      pendingRevisions: (pendingRevisions as { count: number }).count,
    },
    usersByRole: Object.fromEntries(
      (usersByRole as { role: string; count: number }[]).map((r) => [r.role, r.count]),
    ),
    articlesByUniverse,
    recentArticles: (recentArticles as Record<string, unknown>[]).map((a) => ({
      id: a.id, title: a.title, slug: a.slug, status: a.status,
      views: a.views, authorUsername: a.author_username, createdAt: a.created_at,
    })),
  };

  cache.set('admin:stats', data, 30_000);
  res.json(success(data));
}));

router.get('/pending-revisions', authenticate, requirePermission('moderate:content'), asyncHandler(async (_req, res) => {
  const revisions = await asyncDb.all(`
    SELECT r.*, a.title as article_title, a.slug as article_slug,
      usr.username as author_username
    FROM revisions r
    JOIN articles a ON a.id = r.article_id
    JOIN users usr ON usr.id = r.author_id
    WHERE r.status = 'pending'
    ORDER BY r.created_at ASC
  `) as Record<string, unknown>[];

  res.json(success(revisions.map((r) => ({
    id: r.id,
    articleId: r.article_id,
    articleTitle: r.article_title,
    articleSlug: r.article_slug,
    title: r.title,
    changeSummary: r.change_summary,
    authorUsername: r.author_username,
    createdAt: r.created_at,
  }))));
}));

router.patch('/users/:id/role', authenticate, requirePermission('manage:users'), validate(roleUpdateSchema), (req, res, next) => {
  try {
    const db = getDb();
    const { role } = req.body;

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json(error('NOT_FOUND', 'Usuario no encontrado'));

    db.prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?").run(role, req.params.id);

    cache.invalidate('users');
    cache.invalidate('ranking');
    cache.invalidate('admin');
    res.json(success(null, 'Rol actualizado'));
  } catch (err) {
    next(err);
  }
});

export default router;
