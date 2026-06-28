import { useState, useEffect, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Badge } from './Badge';
import { Card } from './Card';
import { Modal } from './Modal';
import { useEditArticle } from '@/features/edit-article';
import { AuthProvider, useAuthContext } from '@/app/providers/AuthProvider';
import { sanitizeHTML, hasXSSRisk } from '@/shared/lib';
import { ROUTES, getLoginRedirectPath, getUniverseIcon } from '@/shared/constants';
import type { Article } from '@/entities/article';

interface UniverseOption { id: string; name: string; slug: string; description: string; coverImage: string | null; articleCount: number; }
interface CategoryOption { id: string; name: string; slug: string; }
interface TagOption { id: string; name: string; slug: string; articleCount: number; }

interface EditArticleFormProps {
  slug: string;
}

export default function EditArticleForm({ slug }: EditArticleFormProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();
  const { update, loading: saving, error } = useEditArticle(user?.token);
  const loginRedirectPath = getLoginRedirectPath(ROUTES.EDIT_ARTICLE(slug));

  const [article, setArticle] = useState<Article | null>(null);
  const [fetchingArticle, setFetchingArticle] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [selectedUniverse, setSelectedUniverse] = useState<UniverseOption | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<CategoryOption[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const [universes, setUniverses] = useState<UniverseOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<TagOption[]>([]);
  const [fetchingMeta, setFetchingMeta] = useState(true);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.replace(loginRedirectPath);
    }
  }, [authLoading, isAuthenticated, loginRedirectPath]);

  useEffect(() => {
    async function fetchArticle() {
      if (!user?.token) return;
      try {
        const res = await fetch(`/api/articles/${slug}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.data) {
          setFetchError(json?.message || 'No se pudo cargar el artículo');
          return;
        }
        const a: Article = json.data;
        setArticle(a);
        setTitle(a.title);
        setSummary(a.summary || '');
        setContent(a.content);
        setCoverImage(a.coverImage || '');
        setSelectedCategories(a.categories || []);
        setSelectedTags(a.tags?.map((t) => t.name) || []);
        if (a.universe) {
          setSelectedUniverse({
            id: a.universe.id,
            name: a.universe.name,
            slug: a.universe.slug,
            description: '',
            coverImage: null,
            articleCount: 0,
          });
        }
      } catch {
        setFetchError('Error de red al cargar el artículo');
      } finally {
        setFetchingArticle(false);
      }
    }

    if (!authLoading && isAuthenticated) {
      fetchArticle();
    }
  }, [slug, authLoading, isAuthenticated, user?.token]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [uniRes, catRes, tagRes] = await Promise.all([
          fetch('/api/universes?limit=50'),
          fetch('/api/categories'),
          fetch('/api/tags'),
        ]);
        const [uniJson, catJson, tagJson] = await Promise.all([
          uniRes.json(), catRes.json(), tagRes.json(),
        ]);
        setUniverses(uniJson?.data?.data || []);
        setCategories(catJson?.data || []);
        setTagSuggestions(tagJson?.data || []);
      } catch { /* ignore */ }
      finally { setFetchingMeta(false); }
    }
    fetchData();
  }, []);

  const canEdit = !!article && !!user && (
    article.authorId === user.id ||
    user.role === 'admin' ||
    user.role === 'moderator'
  );

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const addTag = (name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (trimmed && !selectedTags.includes(trimmed) && selectedTags.length < 10) {
      setSelectedTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
    setTagDropdownOpen(false);
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && selectedTags.length > 0) {
      setSelectedTags((prev) => prev.slice(0, -1));
    }
  };

  const filteredTags = tagSuggestions.filter(
    (t) => tagInput && t.name.toLowerCase().includes(tagInput.toLowerCase()) && !selectedTags.includes(t.name)
  ).slice(0, 5);

  const toggleCategory = (cat: CategoryOption) => {
    setSelectedCategories((prev) =>
      prev.find((c) => c.id === cat.id)
        ? prev.filter((c) => c.id !== cat.id)
        : [...prev, cat]
    );
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'El título es obligatorio';
    else if (title.length < 3) errors.title = 'Mínimo 3 caracteres';
    else if (hasXSSRisk(title)) errors.title = 'El título contiene código no permitido';
    if (!selectedUniverse) errors.universe = 'Selecciona un universo';
    if (!content.trim()) errors.content = 'El contenido es obligatorio';
    else if (content.length < 50) errors.content = 'Mínimo 50 caracteres';
    else if (hasXSSRisk(content)) errors.content = 'El contenido contiene HTML peligroso';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!article || !validate()) return;

    const result = await update(article.id, {
      title: sanitizeHTML(title),
      summary,
      content,
      universeId: selectedUniverse!.id,
      coverImage: coverImage || undefined,
      categoryIds: selectedCategories.map((c) => c.id),
      tagNames: selectedTags,
    });

    if (result) {
      setSaved(true);
      setTimeout(() => {
        window.location.replace(ROUTES.ARTICLE_DETAIL(result.slug));
      }, 1200);
    }
  };

  const handleDiscard = () => {
    if (!article) return;
    setTitle(article.title);
    setSummary(article.summary || '');
    setContent(article.content);
    setCoverImage(article.coverImage || '');
    setSelectedCategories(article.categories || []);
    setSelectedTags(article.tags?.map((t) => t.name) || []);
    setSelectedUniverse(article.universe ? {
      id: article.universe.id,
      name: article.universe.name,
      slug: article.universe.slug,
      description: '',
      coverImage: null,
      articleCount: 0,
    } : null);
    setShowDiscardConfirm(false);
  };

  if (authLoading || fetchingArticle) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-geek-accent border-t-transparent" aria-hidden="true" />
        <p className="text-sm text-geek-text-secondary">Cargando artículo...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-geek-accent/20" aria-hidden="true" />
        <h2 className="mb-2 text-xl font-bold text-geek-text">Redirigiendo a iniciar sesión</h2>
        <p className="mb-6 text-geek-text-secondary">Necesitas una cuenta para editar artículos.</p>
        <a href={loginRedirectPath}><Button>Ir a iniciar sesión</Button></a>
      </div>
    );
  }

  if (fetchError || !article) {
    return (
      <div className="rounded-lg border border-geek-border bg-geek-dark-secondary px-6 py-16 text-center">
        <h2 className="text-xl font-bold text-geek-text">Artículo no encontrado</h2>
        <p className="mt-2 text-geek-text-secondary">{fetchError || 'No se pudo cargar el artículo.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <a href={ROUTES.ARTICLES}><Button variant="secondary">Ver artículos</Button></a>
          <a href={ROUTES.HOME}><Button variant="ghost">Ir al inicio</Button></a>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-geek-text mb-2">No puedes editar este artículo</h2>
        <p className="text-geek-text-secondary mb-6">
          Solo el autor, moderadores o administradores pueden editar este contenido.
        </p>
        <a href={ROUTES.ARTICLE_DETAIL(article.slug)}><Button>Ver artículo</Button></a>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-geek-success/10 border border-geek-success/30 mb-6">
          <svg className="w-10 h-10 text-geek-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-geek-text font-heading mb-2">¡Cambios guardados!</h2>
        <p className="text-geek-text-secondary mb-6">Redirigiendo al artículo...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(error) && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-geek-danger/30 text-geek-danger text-sm flex items-start gap-3" role="alert">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">{error}</p>
        </div>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-bold text-geek-text font-heading mb-1">Información del artículo</h3>
        <p className="text-sm text-geek-text-secondary mb-5">Edita el título, resumen y portada</p>

        <Input
          label="Título del artículo"
          value={title}
          onChange={(e) => { setTitle(e.target.value); clearFieldError('title'); }}
          placeholder="Ej: La historia completa de los Saiyajin"
          error={fieldErrors.title}
          required
        />

        <div className="mt-4">
          <Input
            label="Resumen"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Un breve resumen de qué trata el artículo"
            helperText={`${summary.length}/500 caracteres`}
          />
        </div>

        <div className="mt-4">
          <Input
            label="Imagen de portada (URL)"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            type="url"
          />
          {coverImage && (
            <div className="mt-3 rounded-lg overflow-hidden border border-geek-border w-full max-w-xs">
              <img
                src={coverImage}
                alt="Preview"
                className="w-full h-32 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-geek-text font-heading mb-1">Universo</h3>
        {fieldErrors.universe && (
          <p className="text-sm text-geek-danger mb-3">{fieldErrors.universe}</p>
        )}

        {fetchingMeta ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-geek-dark-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {universes.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => { setSelectedUniverse(u); clearFieldError('universe'); }}
                aria-pressed={selectedUniverse?.id === u.id}
                aria-label={`Seleccionar universo ${u.name}`}
                className={`relative p-3 rounded-lg border text-left transition-all duration-200 group ${
                  selectedUniverse?.id === u.id
                    ? 'border-geek-accent bg-geek-accent/10 ring-1 ring-geek-accent/30'
                    : 'border-geek-border hover:border-geek-accent/50 hover:bg-geek-dark-tertiary'
                }`}
              >
                {selectedUniverse?.id === u.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-geek-accent flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="text-lg mb-1">{getUniverseIcon(u.name)}</div>
                <p className="text-sm font-medium text-geek-text truncate">{u.name}</p>
                <p className="text-xs text-geek-text-secondary">{u.articleCount} artículos</p>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-geek-text font-heading mb-3">Categorías</h3>
        {fetchingMeta ? (
          <div className="flex flex-wrap gap-2">{Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-geek-dark-secondary animate-pulse" />
          ))}</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat)}
                aria-pressed={!!selectedCategories.find((c) => c.id === cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategories.find((c) => c.id === cat.id)
                    ? 'bg-geek-accent text-white'
                    : 'bg-geek-dark-secondary border border-geek-border text-geek-text-secondary hover:text-geek-text hover:border-geek-accent/50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-geek-text font-heading mb-1">Tags</h3>
        <p className="text-sm text-geek-text-secondary mb-3">Añade tags para ayudar a encontrar tu artículo (máx. 10)</p>

        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-geek-accent/10 border border-geek-accent/20 text-geek-accent text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Eliminar tag ${tag}`}
                className="w-4 h-4 rounded-full hover:bg-geek-accent/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>

        <div className="relative">
          <Input
            value={tagInput}
            onChange={(e) => { setTagInput(e.target.value); setTagDropdownOpen(true); }}
            onKeyDown={handleTagKeyDown}
            onFocus={() => setTagDropdownOpen(true)}
            onBlur={() => setTimeout(() => setTagDropdownOpen(false), 200)}
            placeholder="Escribe un tag y presiona Enter..."
            disabled={selectedTags.length >= 10}
          />

          {tagDropdownOpen && (tagInput || filteredTags.length > 0) && (
            <div className="absolute z-20 top-full mt-1 w-full rounded-lg bg-geek-dark-secondary border border-geek-border shadow-xl overflow-hidden">
              {tagInput && !filteredTags.find((t) => t.name === tagInput.toLowerCase()) && (
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); addTag(tagInput); }}
                  className="w-full px-3 py-2 text-left text-sm text-geek-text hover:bg-geek-dark-tertiary flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4 text-geek-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear tag &quot;<strong>{tagInput}</strong>&quot;
                </button>
              )}
              {filteredTags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); addTag(t.name); }}
                  className="w-full px-3 py-2 text-left text-sm text-geek-text hover:bg-geek-dark-tertiary flex items-center justify-between transition-colors"
                >
                  <span>{t.name}</span>
                  <span className="text-xs text-geek-text-secondary">{t.articleCount} arts.</span>
                </button>
              ))}
              {!tagInput && filteredTags.length === 0 && (
                <p className="px-3 py-3 text-sm text-geek-text-secondary text-center">Escribe para buscar o crear tags</p>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-geek-text font-heading">Contenido del artículo</h3>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              previewMode
                ? 'bg-geek-accent text-white'
                : 'bg-geek-dark-secondary border border-geek-border text-geek-text-secondary hover:text-geek-text'
            }`}
          >
            {previewMode ? 'Editar' : 'Vista previa'}
          </button>
        </div>
        {fieldErrors.content && (
          <p className="text-sm text-geek-danger mb-3">{fieldErrors.content}</p>
        )}

        {previewMode ? (
          <div className="min-h-[300px] rounded-lg bg-geek-dark border border-geek-border p-4 prose prose-invert prose-sm max-w-none text-geek-text">
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <p className="text-geek-text-secondary italic">El contenido aparecerá aquí...</p>
            )}
          </div>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); clearFieldError('content'); }}
            placeholder="Escribe el contenido del artículo aquí..."
            className="min-h-[350px] font-mono text-sm"
          />
        )}
        <div className="flex justify-between mt-2">
          <span className="text-xs text-geek-text-secondary">
            {content.length} caracteres {content.length < 50 && '(mín. 50)'}
          </span>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <Button variant="secondary" type="button" onClick={() => setShowDiscardConfirm(true)}>
          Descartar cambios
        </Button>
        <div className="flex gap-3">
          <a href={ROUTES.ARTICLE_DETAIL(article.slug)}>
            <Button variant="ghost" type="button">Cancelar</Button>
          </a>
          <Button type="submit" loading={saving}>
            Guardar cambios
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        title="¿Descartar cambios?"
        size="sm"
      >
        <p className="text-sm text-geek-text-secondary mb-5">Se restaurarán los valores originales del artículo.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" type="button" onClick={() => setShowDiscardConfirm(false)}>Cancelar</Button>
          <Button variant="danger" type="button" onClick={handleDiscard}>Descartar</Button>
        </div>
      </Modal>
    </form>
  );
}

export function EditArticleFormWithAuth({ slug }: EditArticleFormProps) {
  return (
    <AuthProvider>
      <EditArticleForm slug={slug} />
    </AuthProvider>
  );
}
