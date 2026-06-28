export type UserRole = 'guest' | 'user' | 'contributor' | 'moderator' | 'admin';
type UserStatus = 'active' | 'suspended' | 'banned';

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
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  role: UserRole;
  status: UserStatus;
  xp: number;
  level: number;
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
