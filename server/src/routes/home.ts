import { Router } from 'express';
import { asyncDb, cache } from '../db/index.js';
import { getQueueStats } from '../db/queue.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../lib/response.js';

const router = Router();
const HOME_TTL = 15_000;

router.get('/', asyncHandler(async (_req, res) => {
  const cached = cache.get<ReturnType<typeof buildHomeData>>('home');
  if (cached) {
    res.json(success(cached));
    return;
  }

  const stats = getQueueStats();
  const degraded = stats.utilization > 0.7;

  if (stats.utilization > 0.9) {
    const stale = cache.get<ReturnType<typeof buildHomeData>>('home:stale');
    if (stale) {
      res.json(success(stale));
      return;
    }
  }

  const data = degraded
    ? await buildHomeDataMinimal()
    : await buildHomeData();

  cache.set('home', data, HOME_TTL);
  cache.set('home:stale', data, HOME_TTL * 4);
  res.json(success(data));
}));

async function buildHomeDataMinimal() {
  const [
    universeCount,
    articleCount,
    characterCount,
    userCount,
    theoryCount,
    featuredUniverses,
  ] = await Promise.all([
    asyncDb.get("SELECT COUNT(*) as count FROM universes WHERE status = 'published'"),
    asyncDb.get("SELECT COUNT(*) as count FROM articles WHERE status = 'published'"),
    asyncDb.get("SELECT COUNT(*) as count FROM characters WHERE status = 'published'"),
    asyncDb.get("SELECT COUNT(*) as count FROM users WHERE status = 'active'"),
    asyncDb.get('SELECT COUNT(*) as count FROM theories'),
    asyncDb.all(`
      SELECT u.*,
        (SELECT COUNT(*) FROM articles WHERE universe_id = u.id AND status = 'published') as article_count
      FROM universes u
      WHERE u.status = 'published'
      ORDER BY u.name ASC LIMIT 6
    `),
  ]);

  return {
    stats: {
      universes: (universeCount as { count: number }).count,
      articles: (articleCount as { count: number }).count,
      characters: (characterCount as { count: number }).count,
      users: (userCount as { count: number }).count,
      theories: (theoryCount as { count: number }).count,
    },
    featuredUniverses: (featuredUniverses as Record<string, unknown>[]).map((u) => ({
      id: u.id, name: u.name, slug: u.slug, description: u.description,
      coverImage: u.cover_image || null, articleCount: u.article_count || 0,
    })),
    trendingArticles: [],
    recentArticles: [],
    topContributors: [],
    degraded: true,
  };
}

async function buildHomeData() {
  const [
    universeCount,
    articleCount,
    characterCount,
    userCount,
    theoryCount,
    featuredUniverses,
    trendingArticles,
    recentArticles,
    topContributors,
  ] = await Promise.all([
    asyncDb.get("SELECT COUNT(*) as count FROM universes WHERE status = 'published'"),
    asyncDb.get("SELECT COUNT(*) as count FROM articles WHERE status = 'published'"),
    asyncDb.get("SELECT COUNT(*) as count FROM characters WHERE status = 'published'"),
    asyncDb.get("SELECT COUNT(*) as count FROM users WHERE status = 'active'"),
    asyncDb.get('SELECT COUNT(*) as count FROM theories'),
    asyncDb.all(`
      SELECT u.*,
        (SELECT COUNT(*) FROM articles WHERE universe_id = u.id AND status = 'published') as article_count
      FROM universes u
      WHERE u.status = 'published'
      ORDER BY u.name ASC LIMIT 6
    `),
    asyncDb.all(`
      SELECT a.id, a.title, a.slug, a.summary, a.cover_image, a.views, a.created_at,
        u.name as universe_name, u.slug as universe_slug
      FROM articles a
      JOIN universes u ON u.id = a.universe_id
      WHERE a.status = 'published'
      ORDER BY a.views DESC LIMIT 5
    `),
    asyncDb.all(`
      SELECT a.id, a.title, a.slug, a.summary, a.cover_image, a.views, a.created_at,
        u.name as universe_name, u.slug as universe_slug
      FROM articles a
      JOIN universes u ON u.id = a.universe_id
      WHERE a.status = 'published'
      ORDER BY a.created_at DESC LIMIT 5
    `),
    asyncDb.all(`
      SELECT u.id, u.username, u.display_name, u.avatar_url, u.xp, u.level,
        COUNT(DISTINCT a.id) as article_count
      FROM users u
      LEFT JOIN articles a ON a.author_id = u.id
      WHERE u.status = 'active'
      GROUP BY u.id
      ORDER BY u.xp DESC LIMIT 5
    `),
  ]);

  return {
    stats: {
      universes: (universeCount as { count: number }).count,
      articles: (articleCount as { count: number }).count,
      characters: (characterCount as { count: number }).count,
      users: (userCount as { count: number }).count,
      theories: (theoryCount as { count: number }).count,
    },
    featuredUniverses: (featuredUniverses as Record<string, unknown>[]).map((u) => ({
      id: u.id, name: u.name, slug: u.slug, description: u.description,
      coverImage: u.cover_image || null, articleCount: u.article_count || 0,
    })),
    trendingArticles: (trendingArticles as Record<string, unknown>[]).map((a) => ({
      id: a.id, title: a.title, slug: a.slug, summary: a.summary,
      coverImage: a.cover_image, views: a.views,
      universe: { id: null, name: a.universe_name, slug: a.universe_slug },
      createdAt: a.created_at,
    })),
    recentArticles: (recentArticles as Record<string, unknown>[]).map((a) => ({
      id: a.id, title: a.title, slug: a.slug, summary: a.summary,
      coverImage: a.cover_image, views: a.views,
      universe: { id: null, name: a.universe_name, slug: a.universe_slug },
      createdAt: a.created_at,
    })),
    topContributors: (topContributors as Record<string, unknown>[]).map((c) => ({
      id: c.id, username: c.username, displayName: c.display_name,
      avatarUrl: c.avatar_url, xp: c.xp, level: c.level, articleCount: c.article_count,
    })),
  };
}

export default router;
