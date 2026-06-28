import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, asyncDb, cache } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createTagSchema } from '../validators/schemas.js';
import { generateSlug } from '../lib/slug.js';
import { success, error } from '../lib/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
  const cached = cache.get<Record<string, unknown>[]>('tags');
  if (cached) {
    res.json(success(cached));
    return;
  }

  const tags = await asyncDb.all(`
    SELECT t.*,
      (SELECT COUNT(*) FROM article_tags WHERE tag_id = t.id) as article_count
    FROM tags t
    ORDER BY t.name ASC
  `) as Record<string, unknown>[];

  const data = tags.map((t) => ({
    id: t.id, name: t.name, slug: t.slug,
    articleCount: t.article_count || 0,
    createdAt: t.created_at,
  }));

  cache.set('tags', data, 60_000);
  res.json(success(data));
}));

router.post('/', authenticate, requirePermission('create:article'), validate(createTagSchema), (req, res, next) => {
  try {
    const db = getDb();
    const { name } = req.body;
    const slug = generateSlug(name);

    const existing = db.prepare('SELECT id FROM tags WHERE slug = ?').get(slug);
    if (existing) {
      return res.status(409).json(error('CONFLICT', 'El tag ya existe'));
    }

    const id = uuidv4();
    db.prepare('INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)').run(id, name, slug);

    const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(id) as Record<string, unknown>;

    cache.invalidate('tags');
    res.status(201).json(success({
      id: tag.id, name: tag.name, slug: tag.slug,
      articleCount: 0, createdAt: tag.created_at,
    }, 'Tag creado'));
  } catch (err) {
    next(err);
  }
});

export default router;
