import { useEffect, useState, type FormEvent } from 'react';
import { AuthProvider, useAuthContext } from '@/app/providers/AuthProvider';
import { Button, Input, Textarea, Card, SkeletonLine } from '@/shared/ui';
import { useEditArticle } from '@/features/edit-article';
import { apiClient } from '@/shared/api';
import { ROUTES } from '@/shared/constants';
import type { Article } from '@/entities/article';

interface EditArticleFormProps {
  slug: string;
}

interface ArticleResponse {
  success: boolean;
  data: Article;
  message?: string;
}

function EditArticleFormInner({ slug }: EditArticleFormProps) {
  const { user, loading: authLoading, isAuthenticated } = useAuthContext();
  const { update, loading: saving, error: saveError } = useEditArticle(user?.token);

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await apiClient.get<ArticleResponse>(`/articles/${slug}`);
        if (cancelled) return;
        const a = res.data;
        setArticle(a);
        setTitle(a.title);
        setSummary(a.summary || '');
        setContent(a.content);
        setCoverImage(a.coverImage || '');
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'No se pudo cargar el articulo');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const canEdit =
    isAuthenticated &&
    user &&
    article &&
    (user.id === article.authorId || user.role === 'admin' || user.role === 'moderator');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!article || !canEdit) return;
    setFormError(null);
    setSuccess(false);
    const result = await update(article.id, {
      title: title.trim(),
      summary: summary.trim(),
      content,
      coverImage: coverImage.trim() || undefined,
    });
    if (result) {
      setSuccess(true);
    } else {
      setFormError(saveError || 'No se pudieron guardar los cambios');
    }
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <SkeletonLine count={4} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-geek-border bg-geek-dark-secondary p-6 text-center">
        <p className="text-geek-danger" role="alert">{loadError}</p>
        <a href={ROUTES.HOME} className="mt-4 inline-block text-sm text-geek-accent">
          Volver al inicio
        </a>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="rounded-lg border border-geek-border bg-geek-dark-secondary p-6 text-center">
        <p className="text-geek-text-secondary">Articulo no encontrado</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-geek-border bg-geek-dark-secondary p-6 text-center">
        <p className="text-geek-text-secondary">
          Necesitas <a href={`/login?redirect=${encodeURIComponent(ROUTES.EDIT_ARTICLE(slug))}`} className="text-geek-accent">iniciar sesion</a> para editar.
        </p>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="rounded-lg border border-geek-border bg-geek-dark-secondary p-6 text-center">
        <p className="text-geek-text-secondary">No tienes permisos para editar este articulo.</p>
        <a href={ROUTES.ARTICLE_DETAIL(article.slug)} className="mt-4 inline-block text-sm text-geek-accent">
          Ver articulo
        </a>
      </div>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Titulo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
        />

        <Textarea
          label="Resumen"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={2}
          maxLength={500}
          helperText="Descripcion corta del articulo (max 500 caracteres)"
        />

        <Input
          label="URL de portada"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          type="url"
          placeholder="https://..."
        />

        <Textarea
          label="Contenido"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          required
          helperText="Usa saltos de linea para parrafos. El contenido se almacena como texto plano."
        />

        {formError && (
          <p role="alert" className="text-sm text-geek-danger">{formError}</p>
        )}
        {success && (
          <div className="rounded-lg border border-geek-success/30 bg-geek-success/10 p-3 text-sm text-geek-success" role="status">
            Cambios guardados.{' '}
            <a href={ROUTES.ARTICLE_DETAIL(article.slug)} className="font-semibold underline">
              Ver articulo
            </a>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <a
            href={ROUTES.ARTICLE_DETAIL(article.slug)}
            className="inline-flex h-10 items-center rounded-lg border border-geek-border bg-geek-dark-tertiary px-4 text-sm font-semibold text-geek-text transition-colors hover:border-geek-accent/60"
          >
            Cancelar
          </a>
          <Button type="submit" loading={saving} disabled={!title.trim() || !content.trim()}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function EditArticleForm(props: EditArticleFormProps) {
  return (
    <AuthProvider>
      <EditArticleFormInner {...props} />
    </AuthProvider>
  );
}

export default EditArticleForm;
