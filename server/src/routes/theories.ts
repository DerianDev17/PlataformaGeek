import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, asyncDb } from '../db/index.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createTheorySchema, voteSchema } from '../validators/schemas.js';
import { uniqueSlug } from '../lib/slug.js';
import { success, error } from '../lib/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(Number(req.query.limit) || 12, 50);
  const offset = (page - 1) * limit;

  let where = '';
  const params: unknown[] = [];

  if (req.query.universeId) { where += ' AND t.universe_id = ?'; params.push(req.query.universeId); }
  if (req.query.status) { where += ' AND t.status = ?'; params.push(req.query.status); }

  const [total, theories] = await Promise.all([
    asyncDb.get(`SELECT COUNT(*) as count FROM theories t WHERE 1=1 ${where}`, ...params),
    asyncDb.all(`
      SELECT t.*, u.name as universe_name, u.slug as universe_slug,
        usr.username as author_username, usr.avatar_url as author_avatar_url
      FROM theories t
      JOIN universes u ON u.id = t.universe_id
      JOIN users usr ON usr.id = t.author_id
      WHERE 1=1 ${where}
      ORDER BY t.votes DESC, t.created_at DESC
      LIMIT ? OFFSET ?
    `, ...params, limit, offset),
  ]);

  const totalCount = (total as { count: number }).count;

  res.json(success({
    data: (theories as Record<string, unknown>[]).map(mapTheory),
    pagination: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
  }));
}));

router.get('/:slug', optionalAuth, asyncHandler(async (req, res) => {
  const theory = await asyncDb.get(`
    SELECT t.*, u.name as universe_name, u.slug as universe_slug,
      usr.username as author_username, usr.avatar_url as author_avatar_url
    FROM theories t
    JOIN universes u ON u.id = t.universe_id
    JOIN users usr ON usr.id = t.author_id
    WHERE t.slug = ?
  `, req.params.slug) as Record<string, unknown> | undefined;

  if (!theory) return res.status(404).json(error('NOT_FOUND', 'Teoría no encontrada'));

  res.json(success(mapTheory(theory)));
}));

router.post('/', authenticate, requirePermission('create:theory'), validate(createTheorySchema), (req, res, next) => {
  try {
    const db = getDb();
    const { title, content, universeId, characterId } = req.body;

    const universe = db.prepare('SELECT id FROM universes WHERE id = ?').get(universeId);
    if (!universe) return res.status(400).json(error('VALIDATION_ERROR', 'Universo no encontrado'));

    const usedSlugs = new Set((db.prepare('SELECT slug FROM theories').all() as { slug: string }[]).map((r) => r.slug));
    const slug = uniqueSlug(title, usedSlugs);

    const id = uuidv4();
    db.prepare(`
      INSERT INTO theories (id, title, slug, content, universe_id, character_id, author_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, slug, content, universeId, characterId || null, req.user!.id);

    const theory = db.prepare(`
      SELECT t.*, u.name as universe_name, u.slug as universe_slug
      FROM theories t JOIN universes u ON u.id = t.universe_id WHERE t.id = ?
    `).get(id) as Record<string, unknown>;

    res.status(201).json(success(mapTheory(theory), 'Teoría creada correctamente'));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/vote', authenticate, requirePermission('vote:content'), validate(voteSchema), (req, res, next) => {
  try {
    const db = getDb();
    const { voteType } = req.body;

    const theory = db.prepare('SELECT * FROM theories WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!theory) return res.status(404).json(error('NOT_FOUND', 'Teoría no encontrada'));

    const existing = db.prepare('SELECT * FROM theory_votes WHERE theory_id = ? AND user_id = ?')
      .get(req.params.id, req.user!.id) as Record<string, unknown> | undefined;

    if (existing) {
      if (existing.vote_type === voteType) {
        db.prepare('DELETE FROM theory_votes WHERE id = ?').run(existing.id);
        const adjust = voteType === 'up' ? -1 : 1;
        db.prepare('UPDATE theories SET votes = votes + ? WHERE id = ?').run(adjust, req.params.id);
      } else {
        db.prepare('UPDATE theory_votes SET vote_type = ? WHERE id = ?').run(voteType, existing.id);
        const adjust = voteType === 'up' ? 2 : -2;
        db.prepare('UPDATE theories SET votes = votes + ? WHERE id = ?').run(adjust, req.params.id);
      }
    } else {
      db.prepare('INSERT INTO theory_votes (id, theory_id, user_id, vote_type) VALUES (?, ?, ?, ?)')
        .run(uuidv4(), req.params.id, req.user!.id, voteType);
      const adjust = voteType === 'up' ? 1 : -1;
      db.prepare('UPDATE theories SET votes = votes + ? WHERE id = ?').run(adjust, req.params.id);
    }

    const updated = db.prepare('SELECT votes, status FROM theories WHERE id = ?').get(req.params.id) as { votes: number; status: string };

    if (updated.votes >= 3 && theory.status === 'open') {
      db.prepare("UPDATE theories SET status = 'debated' WHERE id = ?").run(req.params.id);
      updated.status = 'debated';
    }

    res.json(success({ votes: updated.votes, status: updated.status }, 'Voto registrado'));
  } catch (err) {
    next(err);
  }
});

function mapTheory(t: Record<string, unknown>) {
  return {
    id: t.id, title: t.title, slug: t.slug, content: t.content,
    status: t.status, votes: t.votes,
    universe: { id: t.universe_id, name: t.universe_name, slug: t.universe_slug },
    author: t.author_id ? { id: t.author_id, username: t.author_username, avatarUrl: t.author_avatar_url } : undefined,
    characterId: t.character_id || null,
    createdAt: t.created_at, updatedAt: t.updated_at,
  };
}

export default router;
