import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, asyncDb, cache } from '../db/index.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createArticleSchema, updateArticleSchema, createRevisionSchema,
  reviewRevisionSchema,
} from '../validators/schemas.js';
import { generateSlug, uniqueSlug } from '../lib/slug.js';
import { sanitizeHTML, hasXSSRisk } from '../lib/sanitize.js';
import { success, error } from '../lib/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(Number(req.query.limit) || 12, 50);
  const offset = (page - 1) * limit;

  let where = "WHERE a.status = 'published'";
  const params: unknown[] = [];

  if (req.query.universeId) { where += ' AND a.universe_id = ?'; params.push(req.query.universeId); }
  if (req.query.authorId) { where += ' AND a.author_id = ?'; params.push(req.query.authorId); }
  if (req.query.categoryId) {
    where += ' AND a.id IN (SELECT article_id FROM article_categories WHERE category_id = ?)';
    params.push(req.query.categoryId);
  }
  if (req.query.tagId) {
    where += ' AND a.id IN (SELECT article_id FROM article_tags WHERE tag_id = ?)';
    params.push(req.query.tagId);
  }
  if (req.query.search) { where += ' AND (a.title LIKE ? OR a.summary LIKE ?)'; params.push(`%${req.query.search}%`, `%${req.query.search}%`); }

  const sortOrder = req.query.sort === 'popular' ? 'a.views DESC' : req.query.sort === 'trending' ? 'a.views DESC, a.created_at DESC' : 'a.created_at DESC';

  const [total, articles] = await Promise.all([
    asyncDb.get(`SELECT COUNT(*) as count FROM articles a ${where}`, ...params),
    asyncDb.all(`
      SELECT a.*, u.id as universe_id, u.name as universe_name, u.slug as universe_slug,
        usr.username as author_username, usr.avatar_url as author_avatar_url
      FROM articles a
      JOIN universes u ON u.id = a.universe_id
      JOIN users usr ON usr.id = a.author_id
      ${where}
      ORDER BY ${sortOrder}
      LIMIT ? OFFSET ?
    `, ...params, limit, offset),
  ]);

  const totalCount = (total as { count: number }).count;

  res.json(success({
    data: (articles as Record<string, unknown>[]).map(mapArticleListItem),
    pagination: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
  }));
}));

router.get('/:slug', optionalAuth, asyncHandler(async (req, res) => {
  const article = await asyncDb.get(`
    SELECT a.*, u.id as universe_id, u.name as universe_name, u.slug as universe_slug,
      usr.username as author_username, usr.display_name as author_display_name, usr.avatar_url as author_avatar_url
    FROM articles a
    JOIN universes u ON u.id = a.universe_id
    JOIN users usr ON usr.id = a.author_id
    WHERE a.slug = ?
  `, req.params.slug) as Record<string, unknown> | undefined;

  if (!article || (article.status !== 'published' && (!req.user || (req.user.role !== 'admin' && req.user.role !== 'moderator' && req.user.id !== article.author_id)))) {
    return res.status(404).json(error('NOT_FOUND', 'Artículo no encontrado'));
  }

  const [categories, tags, related] = await Promise.all([
    asyncDb.all(`
      SELECT c.id, c.name, c.slug FROM categories c
      JOIN article_categories ac ON ac.category_id = c.id
      WHERE ac.article_id = ?
    `, article.id),
    asyncDb.all(`
      SELECT t.id, t.name, t.slug FROM tags t
      JOIN article_tags at ON at.tag_id = t.id
      WHERE at.article_id = ?
    `, article.id),
    asyncDb.all(`
      SELECT a2.id, a2.title, a2.slug, a2.summary, a2.cover_image, a2.views, a2.created_at
      FROM articles a2
      WHERE a2.universe_id = ? AND a2.id != ? AND a2.status = 'published'
      ORDER BY a2.created_at DESC LIMIT 5
    `, article.universe_id, article.id),
  ]);

  if (req.user) {
    article.views = (article.views as number) + 1;
    try {
      getDb().prepare('UPDATE articles SET views = ? WHERE id = ?').run(article.views, article.id);
    } catch (err) {
      console.error(`[articles] view counter write failed for ${article.id}:`, err);
    }
  }

  res.json(success({
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    content: article.content,
    coverImage: article.cover_image || null,
    status: article.status,
    views: article.views,
    universe: { id: article.universe_id, name: article.universe_name, slug: article.universe_slug },
    author: { id: article.author_id, username: article.author_username, displayName: article.author_display_name, avatarUrl: article.author_avatar_url },
    categories: (categories as Record<string, unknown>[]).map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    tags: (tags as Record<string, unknown>[]).map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
    relatedArticles: (related as Record<string, unknown>[]).map((r) => ({
      id: r.id, title: r.title, slug: r.slug, summary: r.summary,
      coverImage: r.cover_image, views: r.views, createdAt: r.created_at,
    })),
    createdAt: article.created_at,
    updatedAt: article.updated_at,
    publishedAt: article.published_at || null,
  }));
}));

router.post('/', authenticate, requirePermission('create:article'), validate(createArticleSchema), (req, res, next) => {
  try {
    const db = getDb();
    const { title, summary, content, coverImage, universeId, categoryIds, tagNames } = req.body;

    if (hasXSSRisk(content)) {
      return res.status(400).json(error('VALIDATION_ERROR', 'El contenido contiene HTML peligroso'));
    }

    const universe = db.prepare('SELECT id FROM universes WHERE id = ?').get(universeId);
    if (!universe) {
      return res.status(400).json(error('VALIDATION_ERROR', 'Universo no encontrado'));
    }

    const usedSlugs = new Set((db.prepare('SELECT slug FROM articles').all() as { slug: string }[]).map((r) => r.slug));
    const slug = uniqueSlug(title, usedSlugs);

    const id = uuidv4();
    const isModOrAdmin = req.user!.role === 'moderator' || req.user!.role === 'admin';
    const status = isModOrAdmin ? 'published' : 'pending_review';

    db.prepare(`
      INSERT INTO articles (id, universe_id, author_id, title, slug, summary, content, cover_image, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, universeId, req.user!.id, title, slug, summary, sanitizeHTML(content), coverImage || null, status,
      status === 'published' ? new Date().toISOString() : null);

    if (categoryIds?.length) {
      const insertCat = db.prepare('INSERT OR IGNORE INTO article_categories (article_id, category_id) VALUES (?, ?)');
      for (const catId of categoryIds) insertCat.run(id, catId);
    }

    if (tagNames?.length) {
      const insertTag = db.prepare('INSERT OR IGNORE INTO tags (id, name, slug) VALUES (?, ?, ?)');
      const linkTag = db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)');
      for (const tagName of tagNames) {
        const tagSlug = generateSlug(tagName);
        let tag = db.prepare('SELECT id FROM tags WHERE slug = ?').get(tagSlug) as { id: string } | undefined;
        if (!tag) {
          const tagId = uuidv4();
          insertTag.run(tagId, tagName, tagSlug);
          tag = { id: tagId };
        }
        linkTag.run(id, tag.id);
      }
    }

    const article = db.prepare(`
      SELECT a.*, u.name as universe_name, u.slug as universe_slug
      FROM articles a JOIN universes u ON u.id = a.universe_id
      WHERE a.id = ?
    `).get(id) as Record<string, unknown>;

    cache.invalidate('articles');
    cache.invalidate('home');
    res.status(201).json(success({
      id: article.id,
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      status: article.status,
      universe: { id: article.universe_id, name: article.universe_name, slug: article.universe_slug },
      createdAt: article.created_at,
    }, 'Artículo creado correctamente'));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, requirePermission('edit:own_article'), validate(updateArticleSchema), (req, res, next) => {
  try {
    const db = getDb();
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!article) {
      return res.status(404).json(error('NOT_FOUND', 'Artículo no encontrado'));
    }

    const isOwner = article.author_id === req.user!.id;
    const canEditAny = req.user!.role === 'admin' || req.user!.role === 'moderator';
    if (!isOwner && !canEditAny) {
      return res.status(403).json(error('FORBIDDEN', 'No puedes editar este artículo'));
    }

    if (req.body.content && hasXSSRisk(req.body.content)) {
      return res.status(400).json(error('VALIDATION_ERROR', 'El contenido contiene HTML peligroso'));
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    if (req.body.title !== undefined) {
      updates.push('title = ?'); values.push(req.body.title);
      const usedSlugs = new Set((db.prepare('SELECT slug FROM articles WHERE id != ?').all(req.params.id) as { slug: string }[]).map((r) => r.slug));
      const newSlug = uniqueSlug(req.body.title, usedSlugs);
      updates.push('slug = ?'); values.push(newSlug);
    }
    if (req.body.summary !== undefined) { updates.push('summary = ?'); values.push(req.body.summary); }
    if (req.body.content !== undefined) { updates.push('content = ?'); values.push(sanitizeHTML(req.body.content)); }
    if (req.body.coverImage !== undefined) { updates.push('cover_image = ?'); values.push(req.body.coverImage); }
    if (req.body.universeId !== undefined) { updates.push('universe_id = ?'); values.push(req.body.universeId); }

    if (!canEditAny && article.status === 'published') {
      updates.push("status = 'pending_review'");
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(req.params.id);
      db.prepare(`UPDATE articles SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    if (req.body.categoryIds) {
      db.prepare('DELETE FROM article_categories WHERE article_id = ?').run(req.params.id);
      const insert = db.prepare('INSERT OR IGNORE INTO article_categories (article_id, category_id) VALUES (?, ?)');
      for (const catId of req.body.categoryIds) insert.run(req.params.id, catId);
    }

    if (req.body.tagNames) {
      db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(req.params.id);
      const insertTag = db.prepare('INSERT OR IGNORE INTO tags (id, name, slug) VALUES (?, ?, ?)');
      const linkTag = db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)');
      for (const tagName of req.body.tagNames) {
        const tagSlug = generateSlug(tagName);
        let tag = db.prepare('SELECT id FROM tags WHERE slug = ?').get(tagSlug) as { id: string } | undefined;
        if (!tag) {
          const tagId = uuidv4();
          insertTag.run(tagId, tagName, tagSlug);
          tag = { id: tagId };
        }
        linkTag.run(req.params.id, tag.id);
      }
    }

    const updated = db.prepare(`
      SELECT a.*, u.name as universe_name, u.slug as universe_slug
      FROM articles a JOIN universes u ON u.id = a.universe_id
      WHERE a.id = ?
    `).get(req.params.id) as Record<string, unknown>;

    cache.invalidate('articles');
    cache.invalidate('home');
    if (article.slug) cache.invalidate(`article:${article.slug}`);
    res.json(success(mapArticleForResponse(updated), 'Artículo actualizado'));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, requirePermission('delete:own_article'), (req, res, next) => {
  try {
    const db = getDb();
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!article) return res.status(404).json(error('NOT_FOUND', 'Artículo no encontrado'));

    const isOwner = article.author_id === req.user!.id;
    const canDeleteAny = req.user!.role === 'admin';
    if (!isOwner && !canDeleteAny) {
      return res.status(403).json(error('FORBIDDEN', 'No puedes eliminar este artículo'));
    }

    db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);

    cache.invalidate('articles');
    cache.invalidate('home');
    if (article.slug) cache.invalidate(`article:${article.slug}`);
    res.json(success(null, 'Artículo eliminado'));
  } catch (err) {
    next(err);
  }
});

router.get('/:id/revisions', authenticate, asyncHandler(async (req, res) => {
  const article = await asyncDb.get('SELECT id FROM articles WHERE id = ?', req.params.id) as { id: string } | undefined;
  if (!article) return res.status(404).json(error('NOT_FOUND', 'Artículo no encontrado'));

  const revisions = await asyncDb.all(`
    SELECT r.*, usr.username as editor_username, usr.avatar_url as editor_avatar_url
    FROM revisions r
    JOIN users usr ON usr.id = r.author_id
    WHERE r.article_id = ?
    ORDER BY r.created_at DESC
  `, req.params.id) as Record<string, unknown>[];

  res.json(success(revisions.map((r) => ({
    id: r.id,
    articleId: r.article_id,
    title: r.title,
    summary: r.summary,
    content: r.content,
    coverImage: r.cover_image,
    changeSummary: r.change_summary,
    status: r.status,
    rejectReason: r.reject_reason,
    editor: { id: r.author_id, username: r.editor_username, avatarUrl: r.editor_avatar_url },
    createdAt: r.created_at,
    reviewedAt: r.reviewed_at,
  }))));
}));

router.post('/:id/revisions', authenticate, requirePermission('edit:own_article'), validate(createRevisionSchema), (req, res, next) => {
  try {
    const db = getDb();
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!article) return res.status(404).json(error('NOT_FOUND', 'Artículo no encontrado'));

    if (article.author_id !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'moderator') {
      return res.status(403).json(error('FORBIDDEN', 'No puedes proponer cambios en este artículo'));
    }

    if (hasXSSRisk(req.body.content)) {
      return res.status(400).json(error('VALIDATION_ERROR', 'Contenido peligroso detectado'));
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO revisions (id, article_id, author_id, title, summary, content, cover_image, change_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.params.id, req.user!.id, req.body.title, req.body.summary,
      sanitizeHTML(req.body.content), req.body.coverImage || null, req.body.changeSummary);

    const revision = db.prepare('SELECT * FROM revisions WHERE id = ?').get(id) as Record<string, unknown>;

    res.status(201).json(success({
      id: revision.id,
      articleId: revision.article_id,
      title: revision.title,
      summary: revision.summary,
      content: revision.content,
      changeSummary: revision.change_summary,
      status: revision.status,
      createdAt: revision.created_at,
    }, 'Revisión creada correctamente'));
  } catch (err) {
    next(err);
  }
});

router.post('/revisions/:revisionId/review', authenticate, requirePermission('moderate:content'), validate(reviewRevisionSchema), (req, res, next) => {
  try {
    const db = getDb();
    const revision = db.prepare('SELECT * FROM revisions WHERE id = ?').get(req.params.revisionId) as Record<string, unknown> | undefined;
    if (!revision) return res.status(404).json(error('NOT_FOUND', 'Revisión no encontrada'));

    if (revision.status !== 'pending') {
      return res.status(400).json(error('VALIDATION_ERROR', 'Esta revisión ya fue procesada'));
    }

    const { status, rejectReason } = req.body;

    db.prepare(`
      UPDATE revisions SET status = ?, reject_reason = ?, reviewed_by = ?, reviewed_at = datetime('now')
      WHERE id = ?
    `).run(status, rejectReason || null, req.user!.id, req.params.revisionId);

    if (status === 'approved') {
      db.prepare(`
        UPDATE articles SET title = ?, summary = ?, content = ?, cover_image = ?,
        status = 'published', published_at = COALESCE(published_at, datetime('now')), updated_at = datetime('now')
        WHERE id = ?
      `).run(revision.title, revision.summary, revision.content, revision.cover_image, revision.article_id);
    }

    res.json(success(null, `Revisión ${status === 'approved' ? 'aprobada' : 'rechazada'}`));
  } catch (err) {
    next(err);
  }
});

function mapArticleListItem(a: Record<string, unknown>) {
  return {
    id: a.id, title: a.title, slug: a.slug, summary: a.summary,
    coverImage: a.cover_image || null, status: a.status, views: a.views,
    universe: { id: a.universe_id, name: a.universe_name, slug: a.universe_slug },
    author: { id: a.author_id, username: a.author_username, avatarUrl: a.author_avatar_url },
    createdAt: a.created_at, updatedAt: a.updated_at, publishedAt: a.published_at || null,
  };
}

function mapArticleForResponse(a: Record<string, unknown>) {
  return {
    id: a.id, title: a.title, slug: a.slug, summary: a.summary,
    content: a.content, coverImage: a.cover_image || null, status: a.status, views: a.views,
    universe: { id: a.universe_id, name: a.universe_name, slug: a.universe_slug },
    createdAt: a.created_at, updatedAt: a.updated_at, publishedAt: a.published_at || null,
  };
}

export default router;
