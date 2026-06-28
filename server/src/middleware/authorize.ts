import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../lib/errors.js';

type Permission =
  | 'read:content'
  | 'create:article'
  | 'edit:own_article'
  | 'edit:any_article'
  | 'delete:own_article'
  | 'delete:any_article'
  | 'create:comment'
  | 'delete:own_comment'
  | 'delete:any_comment'
  | 'create:theory'
  | 'vote:content'
  | 'moderate:content'
  | 'manage:users'
  | 'manage:categories'
  | 'manage:universes'
  | 'access:admin';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  guest: ['read:content'],
  user: ['read:content', 'create:comment', 'delete:own_comment', 'create:theory', 'vote:content'],
  contributor: [
    'read:content', 'create:article', 'edit:own_article', 'delete:own_article',
    'create:comment', 'delete:own_comment', 'create:theory', 'vote:content',
  ],
  moderator: [
    'read:content', 'create:article', 'edit:own_article', 'edit:any_article',
    'delete:any_article', 'create:comment', 'delete:any_comment',
    'create:theory', 'vote:content', 'moderate:content',
  ],
  admin: [
    'read:content', 'create:article', 'edit:own_article', 'edit:any_article',
    'delete:own_article', 'delete:any_article', 'create:comment', 'delete:own_comment',
    'delete:any_comment', 'create:theory', 'vote:content', 'moderate:content',
    'manage:users', 'manage:categories', 'manage:universes', 'access:admin',
  ],
};

export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Autenticación requerida'));
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasPermission = permissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return next(new ForbiddenError(`Se requiere permiso: ${permissions.join(' o ')}`));
    }

    next();
  };
}
