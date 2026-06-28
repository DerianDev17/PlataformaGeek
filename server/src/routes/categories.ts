import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, asyncDb, cache } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema } from '../validators/schemas.js';
import { uniqueSlug } from '../lib/slug.js';
import { success, error } from '../lib/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
  const cached = cache.get<Record<string, unknown>[]>('categories');
  if (cached) {
    res.json(success(cached));
    return;
  }

  const categories = await asyncDb.all(`
    SELECT c.*,
      (SELECT COUNT(*) FROM article_categories WHERE category_id = c.id) as article_count
    FROM categories c
    ORDER BY c.name ASC
  `) as Record<string, unknown>[];

  const data = categories.map(mapCategory);
  cache.set('categories', data, 60_000);
  res.json(success(data));
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const category = await asyncDb.get(`
    SELECT c.*,
      (SELECT COUNT(*) FROM article_categories WHERE category_id = c.id) as article_count
    FROM categories c WHERE c.slug = ?
  `, req.params.slug) as Record<string, unknown> | undefined;

  if (!category) return res.status(404).json(error('NOT_FOUND', 'Categoría no encontrada'));

  const children = await asyncDb.all('SELECT * FROM categories WHERE parent_id = ?', category.id) as Record<string, unknown>[];

  res.json(success({
    ...mapCategory(category),
    children: children.length ? children.map(mapCategory) : undefined,
  }));
}));

router.post('/', authenticate, requirePermission('manage:categories'), validate(createCategorySchema), (req, res, next) => {
  try {
    const db = getDb();
    const { name, description, parentId } = req.body;

    if (parentId) {
      const parent = db.prepare('SELECT id FROM categories WHERE id = ?').get(parentId);
      if (!parent) return res.status(400).json(error('VALIDATION_ERROR', 'Categoría padre no encontrada'));
    }

    const usedSlugs = new Set((db.prepare('SELECT slug FROM categories').all() as { slug: string }[]).map((r) => r.slug));
    const id = uuidv4();

    db.prepare('INSERT INTO categories (id, name, slug, description, parent_id) VALUES (?, ?, ?, ?, ?)')
      .run(id, name, uniqueSlug(name, usedSlugs), description || null, parentId || null);

    const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Record<string, unknown>;

    cache.invalidate('categories');
    res.status(201).json(success(mapCategory(created), 'Categoría creada'));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, requirePermission('manage:categories'), (req, res, next) => {
  try {
    const db = getDb();
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json(error('NOT_FOUND', 'Categoría no encontrada'));
    cache.invalidate('categories');
    res.json(success(null, 'Categoría eliminada'));
  } catch (err) {
    next(err);
  }
});

function mapCategory(c: Record<string, unknown>) {
  return {
    id: c.id, name: c.name, slug: c.slug,
    description: c.description || null, parentId: c.parent_id || null,
    articleCount: c.article_count || 0,
    createdAt: c.created_at,
  };
}

export default router;
