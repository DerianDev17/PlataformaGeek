export type UserRole = 'guest' | 'user' | 'contributor' | 'moderator' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'banned';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  role: UserRole;
  status: UserStatus;
  xp: number;
  level: number;
  badges: string[];
  articleCount: number;
  commentCount: number;
  joinedAt: string;
  lastActiveAt: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  token: string;
  refreshToken?: string;
}

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateProfileDTO {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export type Permission =
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

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
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
