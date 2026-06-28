import { describe, it, expect } from 'vitest';
import { ROLE_PERMISSIONS, type Permission, type UserRole } from '@/entities/user';

describe('ROLE_PERMISSIONS', () => {
  it('guest solo puede leer contenido', () => {
    const guestPerms = ROLE_PERMISSIONS.guest;
    expect(guestPerms).toHaveLength(1);
    expect(guestPerms).toContain('read:content');
    expect(guestPerms).not.toContain('create:article');
    expect(guestPerms).not.toContain('access:admin');
  });

  it('user puede comentar y votar pero no crear artículos', () => {
    const userPerms = ROLE_PERMISSIONS.user;
    expect(userPerms).toContain('read:content');
    expect(userPerms).toContain('create:comment');
    expect(userPerms).toContain('vote:content');
    expect(userPerms).not.toContain('create:article');
    expect(userPerms).not.toContain('access:admin');
  });

  it('contributor puede crear y editar artículos propios', () => {
    const contributorPerms = ROLE_PERMISSIONS.contributor;
    expect(contributorPerms).toContain('create:article');
    expect(contributorPerms).toContain('edit:own_article');
    expect(contributorPerms).toContain('delete:own_article');
    expect(contributorPerms).not.toContain('edit:any_article');
    expect(contributorPerms).not.toContain('moderate:content');
  });

  it('moderator puede moderar contenido', () => {
    const moderatorPerms = ROLE_PERMISSIONS.moderator;
    expect(moderatorPerms).toContain('moderate:content');
    expect(moderatorPerms).toContain('edit:any_article');
    expect(moderatorPerms).toContain('delete:any_comment');
    expect(moderatorPerms).not.toContain('manage:users');
  });

  it('admin tiene control total', () => {
    const adminPerms = ROLE_PERMISSIONS.admin;
    expect(adminPerms).toContain('manage:users');
    expect(adminPerms).toContain('manage:categories');
    expect(adminPerms).toContain('manage:universes');
    expect(adminPerms).toContain('access:admin');
  });

  it('todos los roles tienen permisos únicos', () => {
    const roles: UserRole[] = ['guest', 'user', 'contributor', 'moderator', 'admin'];
    for (const role of roles) {
      const perms = ROLE_PERMISSIONS[role];
      const unique = new Set(perms);
      expect(unique.size).toBe(perms.length);
    }
  });

  it('los permisos son acumulativos: admin incluye todos', () => {
    const adminPerms = new Set(ROLE_PERMISSIONS.admin);
    const allOtherPerms = new Set([
      ...ROLE_PERMISSIONS.guest,
      ...ROLE_PERMISSIONS.user,
      ...ROLE_PERMISSIONS.contributor,
      ...ROLE_PERMISSIONS.moderator,
    ]);
    for (const perm of allOtherPerms) {
      expect(adminPerms.has(perm)).toBe(true);
    }
  });
});
