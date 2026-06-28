import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, asyncDb, cache } from '../db/index.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createCharacterSchema, updateCharacterSchema } from '../validators/schemas.js';
import { generateSlug, uniqueSlug } from '../lib/slug.js';
import { success, error } from '../lib/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(Number(req.query.limit) || 12, 50);
  const offset = (page - 1) * limit;

  let where = "WHERE c.status = 'published'";
  const params: unknown[] = [];

  if (req.query.universeId) { where += ' AND c.universe_id = ?'; params.push(req.query.universeId); }
  if (req.query.search) { where += ' AND (c.name LIKE ? OR c.alias LIKE ?)'; params.push(`%${req.query.search}%`, `%${req.query.search}%`); }

  const [total, characters] = await Promise.all([
    asyncDb.get(`SELECT COUNT(*) as count FROM characters c ${where}`, ...params),
    asyncDb.all(`
      SELECT c.*, u.name as universe_name, u.slug as universe_slug
      FROM characters c
      JOIN universes u ON u.id = c.universe_id
      ${where}
      ORDER BY c.name ASC
      LIMIT ? OFFSET ?
    `, ...params, limit, offset),
  ]);

  const totalCount = (total as { count: number }).count;

  res.json(success({
    data: (characters as Record<string, unknown>[]).map(mapCharacter),
    pagination: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
  }));
}));

router.get('/:slug', optionalAuth, asyncHandler(async (req, res) => {
  const character = await asyncDb.get(`
    SELECT c.*, u.name as universe_name, u.slug as universe_slug
    FROM characters c
    JOIN universes u ON u.id = c.universe_id
    WHERE c.slug = ?
  `, req.params.slug) as Record<string, unknown> | undefined;

  if (!character) {
    return res.status(404).json(error('NOT_FOUND', 'Personaje no encontrado'));
  }

  const [relations, articleCount] = await Promise.all([
    asyncDb.all(`
      SELECT cr.*, rc.name as related_name, rc.slug as related_slug, rc.image_url as related_image_url
      FROM character_relations cr
      JOIN characters rc ON rc.id = cr.related_character_id
      WHERE cr.character_id = ?
    `, character.id),
    asyncDb.get("SELECT COUNT(*) as count FROM articles WHERE universe_id = ? AND (title LIKE ? OR content LIKE ?) AND status = 'published'",
      character.universe_id, `%${character.name}%`, `%${character.name}%`),
  ]);

  res.json(success({
    ...mapCharacter(character),
    universe: { id: character.universe_id, name: character.universe_name, slug: character.universe_slug },
    relationships: (relations as Record<string, unknown>[]).map((r) => ({
      id: r.id,
      characterId: r.character_id,
      relatedCharacterId: r.related_character_id,
      relatedCharacter: { id: r.related_character_id, name: r.related_name, slug: r.related_slug, imageUrl: r.related_image_url },
      relationType: r.relation_type,
      description: r.description,
    })),
    articleCount: (articleCount as { count: number }).count,
  }));
}));

router.post('/', authenticate, requirePermission('create:article'), validate(createCharacterSchema), (req, res, next) => {
  try {
    const db = getDb();
    const { name, alias, description, imageUrl, universeId, firstAppearance, powerLevel } = req.body;

    const universe = db.prepare('SELECT id FROM universes WHERE id = ?').get(universeId);
    if (!universe) return res.status(400).json(error('VALIDATION_ERROR', 'Universo no encontrado'));

    const usedSlugs = new Set((db.prepare('SELECT slug FROM characters').all() as { slug: string }[]).map((r) => r.slug));
    const slug = uniqueSlug(name, usedSlugs);

    const id = uuidv4();
    db.prepare(`
      INSERT INTO characters (id, universe_id, name, slug, alias, description, image_url, first_appearance, power_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, universeId, name, slug, alias || null, description, imageUrl || null, firstAppearance || null, powerLevel || null);

    const character = db.prepare(`
      SELECT c.*, u.name as universe_name, u.slug as universe_slug
      FROM characters c JOIN universes u ON u.id = c.universe_id
      WHERE c.id = ?
    `).get(id) as Record<string, unknown>;

    cache.invalidate('characters');
    res.status(201).json(success(mapCharacter(character), 'Personaje creado correctamente'));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, requirePermission('edit:any_article'), validate(updateCharacterSchema), (req, res, next) => {
  try {
    const db = getDb();
    const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!character) return res.status(404).json(error('NOT_FOUND', 'Personaje no encontrado'));

    const updates: string[] = [];
    const values: unknown[] = [];

    if (req.body.name !== undefined) {
      updates.push('name = ?'); values.push(req.body.name);
      const usedSlugs = new Set((db.prepare('SELECT slug FROM characters WHERE id != ?').all(req.params.id) as { slug: string }[]).map((r) => r.slug));
      updates.push('slug = ?'); values.push(uniqueSlug(req.body.name, usedSlugs));
    }
    if (req.body.alias !== undefined) { updates.push('alias = ?'); values.push(req.body.alias); }
    if (req.body.description !== undefined) { updates.push('description = ?'); values.push(req.body.description); }
    if (req.body.imageUrl !== undefined) { updates.push('image_url = ?'); values.push(req.body.imageUrl); }
    if (req.body.universeId !== undefined) { updates.push('universe_id = ?'); values.push(req.body.universeId); }
    if (req.body.firstAppearance !== undefined) { updates.push('first_appearance = ?'); values.push(req.body.firstAppearance); }
    if (req.body.powerLevel !== undefined) { updates.push('power_level = ?'); values.push(req.body.powerLevel); }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(req.params.id);
      db.prepare(`UPDATE characters SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare(`
      SELECT c.*, u.name as universe_name, u.slug as universe_slug
      FROM characters c JOIN universes u ON u.id = c.universe_id WHERE c.id = ?
    `).get(req.params.id) as Record<string, unknown>;

    cache.invalidate('characters');
    if (character.slug) cache.invalidate(`character:${character.slug}`);
    res.json(success(mapCharacter(updated), 'Personaje actualizado'));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, requirePermission('delete:any_article'), (req, res, next) => {
  try {
    const db = getDb();
    const character = db.prepare('SELECT slug FROM characters WHERE id = ?').get(req.params.id) as { slug: string } | undefined;
    const result = db.prepare('DELETE FROM characters WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json(error('NOT_FOUND', 'Personaje no encontrado'));
    cache.invalidate('characters');
    if (character) cache.invalidate(`character:${character.slug}`);
    res.json(success(null, 'Personaje eliminado'));
  } catch (err) {
    next(err);
  }
});

function mapCharacter(c: Record<string, unknown>) {
  return {
    id: c.id, name: c.name, slug: c.slug, alias: c.alias || null,
    description: c.description, imageUrl: c.image_url || null,
    firstAppearance: c.first_appearance || null, powerLevel: c.power_level || null,
    universeId: c.universe_id,
    universe: c.universe_name ? { id: c.universe_id, name: c.universe_name, slug: c.universe_slug } : undefined,
    createdAt: c.created_at, updatedAt: c.updated_at,
  };
}

export default router;
