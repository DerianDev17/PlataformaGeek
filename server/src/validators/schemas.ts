import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, guiones y guiones bajos'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const createArticleSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(200),
  summary: z.string().min(1, 'Resumen requerido').max(500),
  content: z.string().min(1, 'Contenido requerido'),
  coverImage: z.string().url().nullable().optional(),
  universeId: z.string().uuid('Universo inválido'),
  categoryIds: z.array(z.string().uuid()).optional(),
  tagNames: z.array(z.string().min(1).max(50)).optional(),
});

export const updateArticleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  summary: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  coverImage: z.string().url().nullable().optional(),
  universeId: z.string().uuid().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  tagNames: z.array(z.string().min(1).max(50)).optional(),
});

export const createUniverseSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  description: z.string().min(1, 'Descripción requerida').max(2000),
  coverImage: z.string().url().nullable().optional(),
  bannerImage: z.string().url().nullable().optional(),
});

export const updateUniverseSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(2000).optional(),
  coverImage: z.string().url().nullable().optional(),
  bannerImage: z.string().url().nullable().optional(),
});

export const createCharacterSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  alias: z.string().max(100).nullable().optional(),
  description: z.string().min(1, 'Descripción requerida').max(3000),
  imageUrl: z.string().url().nullable().optional(),
  universeId: z.string().uuid('Universo inválido'),
  firstAppearance: z.string().max(200).nullable().optional(),
  powerLevel: z.number().int().positive().nullable().optional(),
});

export const updateCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  alias: z.string().max(100).nullable().optional(),
  description: z.string().min(1).max(3000).optional(),
  imageUrl: z.string().url().nullable().optional(),
  universeId: z.string().uuid().optional(),
  firstAppearance: z.string().max(200).nullable().optional(),
  powerLevel: z.number().int().positive().nullable().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  description: z.string().max(500).nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(50),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comentario requerido').max(2000),
});

export const createTheorySchema = z.object({
  title: z.string().min(1, 'Título requerido').max(200),
  content: z.string().min(1, 'Contenido requerido').max(5000),
  universeId: z.string().uuid('Universo inválido'),
  characterId: z.string().uuid().nullable().optional(),
});

export const voteSchema = z.object({
  voteType: z.enum(['up', 'down']),
});

export const createRevisionSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  content: z.string().min(1),
  coverImage: z.string().url().nullable().optional(),
  changeSummary: z.string().min(1, 'Resumen del cambio requerido').max(500),
});

export const reviewRevisionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectReason: z.string().max(500).optional(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(['article', 'universe', 'character', 'theory', 'user']).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  sort: z.enum(['recent', 'popular', 'trending']).optional(),
  status: z.string().optional(),
  universeId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export const usernameParamSchema = z.object({
  username: z.string().min(1).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Nombre de usuario inválido'),
});

export const userQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const roleUpdateSchema = z.object({
  role: z.enum(['guest', 'user', 'contributor', 'moderator', 'admin']),
});
