import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, asyncDb, cache } from '../db/index.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createUniverseSchema, updateUniverseSchema, paginationSchema } from '../validators/schemas.js';
import { generateSlug, uniqueSlug } from '../lib/slug.js';
import { success, error } from '../lib/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../lib/errors.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(Number(req.query.limit) || 12, 50);
  const offset = (page - 1) * limit;

  const cacheKey = `universes:list:${page}:${limit}`;
  const cached = cache.get<Record<string, unknown>>(cacheKey);
  if (cached) {
    res.json(success(cached));
    return;
  }

  const [total, universes] = await Promise.all([
    asyncDb.get("SELECT COUNT(*) as count FROM universes WHERE status = 'published'"),
    asyncDb.all(`
      SELECT u.*,
        (SELECT COUNT(*) FROM articles WHERE universe_id = u.id AND status = 'published') as article_count,
        (SELECT COUNT(*) FROM characters WHERE universe_id = u.id) as character_count,
        (SELECT COUNT(*) FROM theories WHERE universe_id = u.id) as theory_count
      FROM universes u
      WHERE u.status = 'published'
      ORDER BY u.name ASC
      LIMIT ? OFFSET ?
    `, limit, offset),
  ]);

  const data = {
    data: (universes as Record<string, unknown>[]).map(mapUniverse),
    pagination: { page, limit, total: (total as { count: number }).count, totalPages: Math.ceil((total as { count: number }).count / limit) },
  };

  cache.set(cacheKey, data);
  res.json(success(data));
}));

router.get('/:slug', optionalAuth, asyncHandler(async (req, res) => {
  const cacheKey = `universe:${req.params.slug}`;
  const cached = cache.get<Record<string, unknown>>(cacheKey);
  if (cached) {
    res.json(success(cached));
    return;
  }

  const universe = await asyncDb.get(`
    SELECT u.*,
      (SELECT COUNT(*) FROM articles WHERE universe_id = u.id AND status = 'published') as article_count,
      (SELECT COUNT(*) FROM characters WHERE universe_id = u.id) as character_count,
      (SELECT COUNT(*) FROM theories WHERE universe_id = u.id) as theory_count
    FROM universes u WHERE u.slug = ?
  `, req.params.slug) as Record<string, unknown> | undefined;

  if (!universe) {
    return res.status(404).json(error('NOT_FOUND', 'Universo no encontrado'));
  }

  const [recentArticles, featuredCharacters, popularTheories] = await Promise.all([
    asyncDb.all(`
      SELECT id, title, slug, summary, cover_image, views, created_at
      FROM articles WHERE universe_id = ? AND status = 'published'
      ORDER BY created_at DESC LIMIT 6
    `, universe.id),
    asyncDb.all(`
      SELECT id, name, slug, alias, image_url, description
      FROM characters WHERE universe_id = ?
      ORDER BY name ASC LIMIT 8
    `, universe.id),
    asyncDb.all(`
      SELECT t.id, t.title, t.slug, t.content, t.status, t.votes, t.created_at,
        u.username, u.avatar_url
      FROM theories t
      JOIN users u ON u.id = t.author_id
      WHERE t.universe_id = ?
      ORDER BY t.votes DESC LIMIT 5
    `, universe.id),
  ]);

  const data = {
    ...mapUniverse(universe),
    recentArticles: (recentArticles as Record<string, unknown>[]).map((a) => ({
      id: a.id, title: a.title, slug: a.slug, summary: a.summary,
      coverImage: a.cover_image, views: a.views, createdAt: a.created_at,
    })),
    featuredCharacters: (featuredCharacters as Record<string, unknown>[]).map((c) => ({
      id: c.id, name: c.name, slug: c.slug, alias: c.alias,
      imageUrl: c.image_url, description: c.description,
    })),
    popularTheories: (popularTheories as Record<string, unknown>[]).map((t) => ({
      id: t.id, title: t.title, slug: t.slug, content: t.content,
      status: t.status, votes: t.votes, createdAt: t.created_at,
      author: { username: t.username, avatarUrl: t.avatar_url },
    })),
  };

  cache.set(cacheKey, data);
  res.json(success(data));
}));

router.post('/', authenticate, requirePermission('manage:universes'), validate(createUniverseSchema), (req, res, next) => {
  try {
    const db = getDb();
    const { name, description, coverImage, bannerImage } = req.body;

    const usedSlugs = new Set((db.prepare('SELECT slug FROM universes').all() as { slug: string }[]).map((r) => r.slug));
    const slug = uniqueSlug(name, usedSlugs);

    const id = uuidv4();
    db.prepare(`
      INSERT INTO universes (id, name, slug, description, cover_image, banner_image, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, slug, description, coverImage || null, bannerImage || null, req.user!.id);

    const universe = db.prepare('SELECT * FROM universes WHERE id = ?').get(id) as Record<string, unknown>;

    cache.invalidate('universes');
    cache.invalidate('home');
    res.status(201).json(success(mapUniverse(universe), 'Universo creado correctamente'));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, requirePermission('manage:universes'), validate(updateUniverseSchema), (req, res, next) => {
  try {
    const db = getDb();
    const universe = db.prepare('SELECT * FROM universes WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!universe) {
      return res.status(404).json(error('NOT_FOUND', 'Universo no encontrado'));
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    if (req.body.name !== undefined) { updates.push('name = ?'); values.push(req.body.name); }
    if (req.body.description !== undefined) { updates.push('description = ?'); values.push(req.body.description); }
    if (req.body.coverImage !== undefined) { updates.push('cover_image = ?'); values.push(req.body.coverImage); }
    if (req.body.bannerImage !== undefined) { updates.push('banner_image = ?'); values.push(req.body.bannerImage); }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(req.params.id);
      db.prepare(`UPDATE universes SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare(`
      SELECT u.*,
        (SELECT COUNT(*) FROM articles WHERE universe_id = u.id AND status = 'published') as article_count,
        (SELECT COUNT(*) FROM characters WHERE universe_id = u.id) as character_count,
        (SELECT COUNT(*) FROM theories WHERE universe_id = u.id) as theory_count
      FROM universes u WHERE u.id = ?
    `).get(req.params.id) as Record<string, unknown>;

    cache.invalidate('universes');
    cache.invalidate(`universe:${universe.slug}`);
    res.json(success(mapUniverse(updated), 'Universo actualizado'));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, requirePermission('manage:universes'), (req, res, next) => {
  try {
    const db = getDb();
    const universe = db.prepare('SELECT slug FROM universes WHERE id = ?').get(req.params.id) as { slug: string } | undefined;
    const result = db.prepare('DELETE FROM universes WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json(error('NOT_FOUND', 'Universo no encontrado'));
    }
    cache.invalidate('universes');
    if (universe) cache.invalidate(`universe:${universe.slug}`);
    res.json(success(null, 'Universo eliminado'));
  } catch (err) {
    next(err);
  }
});

function mapUniverse(u: Record<string, unknown>) {
  return {
    id: u.id,
    name: u.name,
    slug: u.slug,
    description: u.description,
    coverImage: u.cover_image || null,
    bannerImage: u.banner_image || null,
    articleCount: u.article_count || 0,
    characterCount: u.character_count || 0,
    theoryCount: u.theory_count || 0,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

export default router;
