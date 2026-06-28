import { useEffect, useState } from 'react';
import { AuthProvider, useAuthContext } from '@/app/providers/AuthProvider';
import { Card, Button, SkeletonLine, Badge, useToast } from '@/shared/ui';
import { apiClient } from '@/shared/api';
import { ROUTES } from '@/shared/constants';
import { timeAgo } from '@/shared/lib';
import type { UserRole } from '@/entities/user';

interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: string;
  xp: number;
  level: number;
  articleCount: number;
  commentCount: number;
  joinedAt: string;
}

interface Revision {
  id: string;
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  title: string;
  changeSummary: string;
  authorUsername: string;
  createdAt: string;
}

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

const ROLE_OPTIONS: UserRole[] = ['user', 'contributor', 'moderator', 'admin'];
const ROLE_LABELS: Record<UserRole, string> = {
  guest: 'Invitado',
  user: 'Usuario',
  contributor: 'Contributor',
  moderator: 'Moderador',
  admin: 'Admin',
};

function AdminPanelInner() {
  const { user, loading: authLoading, isAuthenticated } = useAuthContext();
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'users' | 'revisions'>('users');

  const isAdmin = isAuthenticated && user?.role === 'admin';
  const canModerate = isAuthenticated && (user?.role === 'admin' || user?.role === 'moderator');

  async function loadUsers() {
    try {
      const response = await apiClient.get<ApiEnvelope<{ data: UserSummary[] }>>('/users/ranking?limit=50', user?.token);
      const list = (response.data?.data || []) as unknown as UserSummary[];
      setUsers(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios');
    }
  }

  async function loadRevisions() {
    try {
      const response = await apiClient.get<ApiEnvelope<Revision[]>>('/admin/pending-revisions', user?.token);
      setRevisions(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las revisiones');
    }
  }

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let cancelled = false;
    async function init() {
      if (!cancelled) {
        setLoading(true);
        await Promise.all([loadUsers(), canModerate ? loadRevisions() : Promise.resolve()]);
        setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, canModerate]);

  async function changeRole(u: UserSummary, newRole: UserRole) {
    if (!isAdmin || actingId) return;
    if (u.id === user?.id && newRole !== 'admin') {
      showToast('No puedes quitarte el rol de admin a ti mismo', 'error');
      return;
    }
    if (!confirm(`Cambiar el rol de ${u.username} a ${ROLE_LABELS[newRole]}?`)) return;
    setActingId(u.id);
    try {
      await apiClient.patch(`/admin/users/${u.id}/role`, { role: newRole }, user?.token);
      showToast(`Rol de ${u.username} actualizado a ${ROLE_LABELS[newRole]}`, 'success');
      await loadUsers();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo cambiar el rol', 'error');
    } finally {
      setActingId(null);
    }
  }

  async function review(rev: Revision, status: 'approved' | 'rejected') {
    if (!canModerate || actingId) return;
    let rejectReason = '';
    if (status === 'rejected') {
      rejectReason = prompt('Motivo del rechazo (opcional, max 500 caracteres):', '') || '';
    }
    if (!confirm(`${status === 'approved' ? 'Aprobar' : 'Rechazar'} la revision de "${rev.title}"?`)) return;
    setActingId(rev.id);
    try {
      await apiClient.post(
        `/articles/revisions/${rev.id}/review`,
        { status, rejectReason: rejectReason || undefined },
        user?.token
      );
      showToast(`Revision ${status === 'approved' ? 'aprobada' : 'rechazada'}`, 'success');
      await loadRevisions();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo procesar la revision', 'error');
    } finally {
      setActingId(null);
    }
  }

  if (authLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLine count={4} />
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(ROUTES.ADMIN);
    return (
      <Card>
        <p className="text-geek-text-secondary">
          Necesitas <a href={`/login?redirect=${redirect}`} className="text-geek-accent">iniciar sesion</a> como administrador.
        </p>
      </Card>
    );
  }

  if (!canModerate) {
    return (
      <Card>
        <p className="text-geek-text-secondary">Tu rol ({user?.role}) no tiene acceso al panel de administracion.</p>
        <a href={ROUTES.HOME} className="mt-4 inline-block text-sm text-geek-accent">Volver al inicio</a>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Secciones de administracion" className="flex gap-2 border-b border-geek-border">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'users'}
          onClick={() => setTab('users')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'users' ? 'border-geek-accent text-geek-text' : 'border-transparent text-geek-text-secondary hover:text-geek-text'
          }`}
        >
          Usuarios {users.length > 0 && <span className="ml-1 text-xs">({users.length})</span>}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'revisions'}
          onClick={() => setTab('revisions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'revisions' ? 'border-geek-accent text-geek-text' : 'border-transparent text-geek-text-secondary hover:text-geek-text'
          }`}
        >
          Cola de revision {revisions.length > 0 && <Badge variant="warning" size="sm">{revisions.length}</Badge>}
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-geek-danger/40 bg-geek-danger/10 p-3 text-sm text-geek-danger">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonLine count={6} />
      ) : tab === 'users' ? (
        <Card>
          {!isAdmin ? (
            <p className="text-sm text-geek-text-secondary">Solo los administradores pueden cambiar roles. Inicia sesion como admin para editar.</p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-geek-border text-left text-xs uppercase text-geek-text-secondary">
                  <th className="py-2 pr-4">Usuario</th>
                  <th className="py-2 pr-4">Rol</th>
                  <th className="py-2 pr-4">XP</th>
                  <th className="py-2 pr-4">Articulos</th>
                  <th className="py-2 pr-4">Comentarios</th>
                  <th className="py-2 pr-4">Estado</th>
                  {isAdmin && <th className="py-2">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-geek-border/50 last:border-0">
                    <td className="py-2 pr-4">
                      <a href={ROUTES.PROFILE(u.username)} className="font-medium text-geek-text hover:text-geek-accent">
                        {u.displayName || u.username}
                      </a>
                      <p className="text-xs text-geek-text-secondary">@{u.username}</p>
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'moderator' ? 'warning' : u.role === 'contributor' ? 'info' : 'default'} size="sm">
                        {ROLE_LABELS[u.role]}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 font-mono text-geek-text-secondary">{Number(u.xp).toLocaleString('es-ES')}</td>
                    <td className="py-2 pr-4 text-geek-text-secondary">{u.articleCount}</td>
                    <td className="py-2 pr-4 text-geek-text-secondary">{u.commentCount}</td>
                    <td className="py-2 pr-4 text-geek-text-secondary">{u.status}</td>
                    {isAdmin && (
                      <td className="py-2">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u, e.target.value as UserRole)}
                          disabled={actingId === u.id || u.id === user?.id}
                          aria-label={`Cambiar rol de ${u.username}`}
                          className="rounded border border-geek-border bg-geek-dark-tertiary px-2 py-1 text-xs text-geek-text focus:border-geek-accent focus:outline-none disabled:opacity-50"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          {revisions.length === 0 ? (
            <p className="text-sm text-geek-text-secondary">No hay revisiones pendientes.</p>
          ) : (
            <ul className="space-y-4" role="list">
              {revisions.map((r) => (
                <li key={r.id} className="rounded-lg border border-geek-border bg-geek-dark-tertiary/50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <a href={ROUTES.ARTICLE_DETAIL(r.articleSlug)} className="font-semibold text-geek-text hover:text-geek-accent">
                        {r.title}
                      </a>
                      <p className="text-xs text-geek-text-secondary mt-0.5">
                        Articulo: {r.articleTitle} · Por {r.authorUsername} · {timeAgo(r.createdAt)}
                      </p>
                      <p className="mt-2 text-sm text-geek-text">{r.changeSummary}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => review(r, 'approved')}
                        disabled={actingId === r.id}
                        loading={actingId === r.id}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => review(r, 'rejected')}
                        disabled={actingId === r.id}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}

export function AdminPanel() {
  return (
    <AuthProvider>
      <AdminPanelInner />
    </AuthProvider>
  );
}

export default AdminPanel;
