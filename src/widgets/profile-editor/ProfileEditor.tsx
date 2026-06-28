import { useEffect, useState, type FormEvent } from 'react';
import { AuthProvider, useAuthContext } from '@/app/providers/AuthProvider';
import { Avatar, Button, Card, Input, Textarea, SkeletonLine, useToast } from '@/shared/ui';
import { apiClient } from '@/shared/api';
import { useAuth } from '@/features/auth-login';
import { ROUTES } from '@/shared/constants';

interface MeResponse {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  role: string;
  status: string;
  xp: number;
  level: number;
  joinedAt: string;
}

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

function ProfileEditorInner() {
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();
  const { refreshSession } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [original, setOriginal] = useState({ displayName: '', bio: '', avatarUrl: '' });

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await apiClient.get<ApiEnvelope<MeResponse>>('/auth/me', user?.token);
        if (cancelled) return;
        const d = res.data;
        setDisplayName(d.displayName || '');
        setBio(d.bio || '');
        setAvatarUrl(d.avatarUrl || '');
        setOriginal({
          displayName: d.displayName || '',
          bio: d.bio || '',
          avatarUrl: d.avatarUrl || '',
        });
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'No se pudo cargar el perfil', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, user?.token, showToast]);

  const dirty =
    displayName !== original.displayName ||
    bio !== original.bio ||
    avatarUrl !== original.avatarUrl;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    try {
      const body: Record<string, string | null> = {};
      if (displayName !== original.displayName) body.displayName = displayName;
      if (bio !== original.bio) body.bio = bio;
      if (avatarUrl !== original.avatarUrl) body.avatarUrl = avatarUrl || null;
      await apiClient.patch('/auth/me', body, user?.token);
      await refreshSession();
      setOriginal({ displayName, bio, avatarUrl });
      showToast('Perfil actualizado', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo guardar', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setDisplayName(original.displayName);
    setBio(original.bio);
    setAvatarUrl(original.avatarUrl);
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <SkeletonLine count={4} />
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(ROUTES.ACCOUNT || '/cuenta');
    return (
      <Card>
        <p className="text-geek-text-secondary">
          Necesitas <a href={`/login?redirect=${redirect}`} className="text-geek-accent">iniciar sesion</a> para editar tu perfil.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar
            src={avatarUrl || user?.avatarUrl || null}
            alt={displayName || user?.username || 'Tu avatar'}
            size="lg"
          />
          <div>
            <p className="font-semibold text-geek-text">{user?.displayName || user?.username}</p>
            <p className="text-xs text-geek-text-secondary">@{user?.username} · {user?.role}</p>
          </div>
        </div>

        <Input
          label="Nombre a mostrar"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
          helperText="Como otros usuarios veran tu nombre (max 50 caracteres)"
        />

        <Textarea
          label="Biografia"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={500}
          helperText="Cuentanos sobre ti (max 500 caracteres)"
        />

        <Input
          label="URL del avatar"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          type="url"
          placeholder="https://..."
          helperText="Link publico a una imagen (opcional)"
        />

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={!dirty || saving}
          >
            Descartar cambios
          </Button>
          <Button type="submit" loading={saving} disabled={!dirty}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function ProfileEditor() {
  return (
    <AuthProvider>
      <ProfileEditorInner />
    </AuthProvider>
  );
}

export default ProfileEditor;
