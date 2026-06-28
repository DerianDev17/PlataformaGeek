import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, asyncDb } from '../db/index.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { createCommentSchema } from '../validators/schemas.js';
import { sanitizeHTML, hasXSSRisk } from '../lib/sanitize.js';
import { success, error } from '../lib/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/articles/:articleId/comments', optionalAuth, asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);

  const comments = await asyncDb.all(`
    SELECT c.*, u.username, u.avatar_url, u.role
    FROM comments c
    JOIN users u ON u.id = c.author_id
    WHERE c.article_id = ?
    ORDER BY c.created_at ASC
    LIMIT ?
  `, req.params.articleId, limit) as Record<string, unknown>[];

  res.json(success(comments.map((c) => ({
    id: c.id,
    articleId: c.article_id,
    content: c.content,
    author: { id: c.author_id, username: c.username, avatarUrl: c.avatar_url, role: c.role },
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }))));
}));

router.post('/articles/:articleId/comments', authenticate, requirePermission('create:comment'), rateLimit(10, 60), validate(createCommentSchema), (req, res, next) => {
  try {
    const db = getDb();
    const article = db.prepare('SELECT id, author_id FROM articles WHERE id = ? AND status = \'published\'').get(req.params.articleId) as { id: string } | undefined;
    if (!article) return res.status(404).json(error('NOT_FOUND', 'Artículo no encontrado'));

    const { content } = req.body;
    if (hasXSSRisk(content)) {
      return res.status(400).json(error('VALIDATION_ERROR', 'El comentario contiene HTML peligroso'));
    }

    const id = uuidv4();
    db.prepare('INSERT INTO comments (id, article_id, author_id, content) VALUES (?, ?, ?, ?)')
      .run(id, req.params.articleId, req.user!.id, sanitizeHTML(content));

    db.prepare('UPDATE users SET xp = xp + 2 WHERE id = ?').run(req.user!.id);

    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id) as Record<string, unknown>;

    res.status(201).json(success({
      id: comment.id,
      articleId: comment.article_id,
      content: comment.content,
      author: { id: req.user!.id, username: req.user!.username, avatarUrl: null, role: req.user!.role },
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
    }, 'Comentario publicado'));
  } catch (err) {
    next(err);
  }
});

router.delete('/comments/:id', authenticate, requirePermission('delete:own_comment'), (req, res, next) => {
  try {
    const db = getDb();
    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!comment) return res.status(404).json(error('NOT_FOUND', 'Comentario no encontrado'));

    const isOwner = comment.author_id === req.user!.id;
    const canDeleteAny = req.user!.role === 'admin' || req.user!.role === 'moderator';
    if (!isOwner && !canDeleteAny) {
      return res.status(403).json(error('FORBIDDEN', 'No puedes eliminar este comentario'));
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
    res.json(success(null, 'Comentario eliminado'));
  } catch (err) {
    next(err);
  }
});

export default router;
