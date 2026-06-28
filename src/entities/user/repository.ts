import type { AuthUser, LoginDTO, RegisterDTO, UpdateProfileDTO, User } from './types';

export interface AuthRepository {
  register(data: RegisterDTO): Promise<AuthUser>;
  login(data: LoginDTO): Promise<AuthUser>;
  logout(): Promise<void>;
  me(): Promise<AuthUser | null>;
  refreshToken(token: string): Promise<AuthUser>;
}

export interface UserRepository {
  findByUsername(username: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(params?: { page?: number; limit?: number; sort?: string }): Promise<User[]>;
  updateProfile(userId: string, data: UpdateProfileDTO): Promise<User>;
  updateRole(userId: string, role: string): Promise<User>;
  suspend(userId: string): Promise<User>;
  unsuspend(userId: string): Promise<User>;
  addXp(userId: string, amount: number): Promise<User>;
}
