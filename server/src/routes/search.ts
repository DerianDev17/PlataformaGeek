import { Router } from 'express';
import type { z } from 'zod';
import { asyncDb, cache } from '../db/index.js';
import { validate } from '../middleware/validate.js';
import { searchQuerySchema } from '../validators/schemas.js';
import { success } from '../lib/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
type SearchQuery = z.infer<typeof searchQuerySchema>;
type SearchResultRow = Record<string, unknown>;

router.get('/', validate(searchQuerySchema, 'query'), asyncHandler(async (req, res) => {
  const { q, type, limit } = req.validatedQuery as SearchQuery;
  const cacheKey = `search:${q}:${type || 'all'}:${limit}`;
  const cached = cache.get<Record<string, unknown>>(cacheKey);
  if (cached) {
    res.json(success(cached));
    return;
  }

  const results: Record<string, SearchResultRow[]> = {};
  const promises: Promise<unknown>[] = [];

  if (!type || type === 'universe') {
    promises.push(
      asyncDb.all(`
        SELECT id, name, slug, description, cover_image, 'universe' as _type
        FROM universes
        WHERE status = 'published' AND (name LIKE ? OR description LIKE ?)
        LIMIT ?
      `, `%${q}%`, `%${q}%`, limit).then((universes) => {
        results.universes = (universes as Record<string, unknown>[]).map((u) => ({
          id: u.id, title: u.name, slug: u.slug, description: u.description,
          coverImage: u.cover_image, type: 'universe',
        }));
      }),
    );
  }

  if (!type || type === 'article') {
    promises.push(
      asyncDb.all(`
        SELECT a.id, a.title, a.slug, a.summary, a.cover_image, a.views, 'article' as _type,
          u.slug as universe_slug
        FROM articles a
        JOIN universes u ON u.id = a.universe_id
        WHERE a.status = 'published' AND (a.title LIKE ? OR a.summary LIKE ?)
        ORDER BY a.views DESC
        LIMIT ?
      `, `%${q}%`, `%${q}%`, limit).then((articles) => {
        results.articles = (articles as Record<string, unknown>[]).map((a) => ({
          id: a.id, title: a.title, slug: a.slug, summary: a.summary,
          coverImage: a.cover_image, views: a.views, type: 'article',
          universeSlug: a.universe_slug,
        }));
      }),
    );
  }

  if (!type || type === 'character') {
    promises.push(
      asyncDb.all(`
        SELECT c.id, c.name, c.slug, c.alias, c.description, c.image_url, 'character' as _type,
          u.slug as universe_slug
        FROM characters c
        JOIN universes u ON u.id = c.universe_id
        WHERE c.status = 'published' AND (c.name LIKE ? OR c.alias LIKE ? OR c.description LIKE ?)
        LIMIT ?
      `, `%${q}%`, `%${q}%`, `%${q}%`, limit).then((characters) => {
        results.characters = (characters as Record<string, unknown>[]).map((c) => ({
          id: c.id, title: c.name, slug: c.slug, alias: c.alias, description: c.description,
          imageUrl: c.image_url, type: 'character', universeSlug: c.universe_slug,
        }));
      }),
    );
  }

  if (!type || type === 'theory') {
    promises.push(
      asyncDb.all(`
        SELECT t.id, t.title, t.slug, t.content, t.votes, 'theory' as _type
        FROM theories t
        WHERE t.title LIKE ? OR t.content LIKE ?
        ORDER BY t.votes DESC
        LIMIT ?
      `, `%${q}%`, `%${q}%`, limit).then((theories) => {
        results.theories = (theories as Record<string, unknown>[]).map((t) => ({
          id: t.id, title: t.title, slug: t.slug, content: t.content,
          votes: t.votes, type: 'theory',
        }));
      }),
    );
  }

  if (!type || type === 'user') {
    promises.push(
      asyncDb.all(`
        SELECT id, username, display_name, avatar_url, role, xp, level, 'user' as _type
        FROM users
        WHERE status = 'active' AND (username LIKE ? OR display_name LIKE ?)
        LIMIT ?
      `, `%${q}%`, `%${q}%`, limit).then((users) => {
        results.users = (users as Record<string, unknown>[]).map((u) => ({
          id: u.id, username: u.username, displayName: u.display_name,
          avatarUrl: u.avatar_url, role: u.role, xp: u.xp, level: u.level, type: 'user',
        }));
      }),
    );
  }

  await Promise.all(promises);

  const flat = [
    ...(type ? [] : (results.universes || []).map((r) => ({ ...r, type: 'universe' }))),
    ...(results.articles || []),
    ...(results.characters || []),
    ...(results.theories || []),
    ...(results.users || []),
  ];

  const data = type ? results[`${type}s`] || [] : { results: flat };
  cache.set(cacheKey, data, 10_000);
  res.json(success(data));
}));

export default router;
