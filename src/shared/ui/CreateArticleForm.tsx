import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Badge } from './Badge';
import { Card } from './Card';
import { Modal } from './Modal';
import { useCreateArticle } from '@/features/create-article';
import { AuthProvider, useAuthContext } from '@/app/providers/AuthProvider';
import { sanitizeHTML, hasXSSRisk } from '@/shared/lib';
import { ROUTES, getLoginRedirectPath, getUniverseIcon } from '@/shared/constants';

interface UniverseOption { id: string; name: string; slug: string; description: string; coverImage: string | null; articleCount: number; }
interface CategoryOption { id: string; name: string; slug: string; }
interface TagOption { id: string; name: string; slug: string; articleCount: number; }

type Step = 1 | 2 | 3;

const DRAFT_KEY = 'nexogeek_article_draft';

export default function CreateArticleForm() {
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();
  const { create, loading, error } = useCreateArticle(user?.token);
  const loginRedirectPath = getLoginRedirectPath(ROUTES.CREATE_ARTICLE);

  // Form state
  const [step, setStep] = useState<Step>(1);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [selectedUniverse, setSelectedUniverse] = useState<UniverseOption | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<CategoryOption[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<{ slug: string; title: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Fetched data
  const [universes, setUniverses] = useState<UniverseOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<TagOption[]>([]);
  const [fetching, setFetching] = useState(true);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.replace(loginRedirectPath);
    }
  }, [authLoading, isAuthenticated, loginRedirectPath]);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.title) setTitle(draft.title);
        if (draft.summary) setSummary(draft.summary);
        if (draft.content) setContent(draft.content);
        if (draft.coverImage) setCoverImage(draft.coverImage);
        if (draft.selectedTags) setSelectedTags(draft.selectedTags);
        if (draft.selectedUniverse) setSelectedUniverse(draft.selectedUniverse);
        if (draft.selectedCategories) setSelectedCategories(draft.selectedCategories);
      }
    } catch { /* ignore */ }
  }, []);

  // Fetch universes, categories, and tags
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
      } catch { /* use empty */ }
      finally { setFetching(false); }
    }
    fetchData();
  }, []);

  // Auto-save draft debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      const draft = { title, summary, content, coverImage, selectedUniverse, selectedCategories, selectedTags };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      if (title || summary || content) setDraftSaved(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, summary, content, coverImage, selectedUniverse, selectedCategories, selectedTags]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }
      if (previewMode && e.key === 'Escape') {
        setPreviewMode(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [previewMode]);

  if (authLoading) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-geek-accent border-t-transparent" aria-hidden="true" />
        <p className="text-sm text-geek-text-secondary">Verificando sesion...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-geek-accent/20" aria-hidden="true" />
        <h2 className="mb-2 text-xl font-bold text-geek-text">Redirigiendo a iniciar sesion</h2>
        <p className="mb-6 text-geek-text-secondary">Necesitas una cuenta para contribuir a la wiki.</p>
        <a href={loginRedirectPath}><Button>Ir a iniciar sesion</Button></a>
      </div>
    );
  }

  if (!user || (user.role !== 'contributor' && user.role !== 'moderator' && user.role !== 'admin')) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">⭐</div>
        <h2 className="text-xl font-bold text-geek-text mb-2">Rol de Contributor requerido</h2>
        <p className="text-geek-text-secondary mb-6">
          Tu rol actual es <Badge variant="info">{user?.role || 'user'}</Badge>. Necesitas ser Contributor, Moderator o Admin para crear artículos.
        </p>
        <p className="text-geek-text-secondary text-sm">Contribuye comentando y participando para subir de nivel.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-geek-success/10 border border-geek-success/30 mb-6">
          <svg className="w-10 h-10 text-geek-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-geek-text font-heading mb-2">¡Artículo creado!</h2>
        <p className="text-geek-text-secondary mb-2">{success.title}</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge variant={user?.role === 'moderator' || user?.role === 'admin' ? 'success' : 'warning'} size="md">
            {user?.role === 'moderator' || user?.role === 'admin' ? 'Publicado' : 'Pendiente de revisión'}
          </Badge>
        </div>
        <div className="flex gap-3 justify-center">
          <a href={ROUTES.ARTICLE_DETAIL(success.slug)}><Button>Ver artículo</Button></a>
          <a href={ROUTES.HOME}><Button variant="secondary">Ir al inicio</Button></a>
          <Button variant="ghost" onClick={() => { setSuccess(null); setTitle(''); setSummary(''); setContent(''); setSelectedUniverse(null); setSelectedCategories([]); setSelectedTags([]); setCoverImage(''); setStep(1); localStorage.removeItem(DRAFT_KEY); }}>
            Crear otro
          </Button>
        </div>
      </div>
    );
  }

  // ── Helper functions ──

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
    } else if (e.key === 'ArrowDown' && tagDropdownOpen) {
      e.preventDefault();
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

  const validateStep = (s: Step): boolean => {
    const errors: Record<string, string> = {};
    if (s === 1) {
      if (!title.trim()) errors.title = 'El título es obligatorio';
      else if (title.length < 3) errors.title = 'Mínimo 3 caracteres';
      else if (hasXSSRisk(title)) errors.title = 'El título contiene código no permitido';
      if (!selectedUniverse) errors.universe = 'Selecciona un universo';
    }
    if (s === 2) {
      if (!content.trim()) errors.content = 'El contenido es obligatorio';
      else if (content.length < 50) errors.content = 'Mínimo 50 caracteres';
      else if (hasXSSRisk(content)) errors.content = 'El contenido contiene HTML peligroso';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3) as Step);
    if (step === 2 && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    setFormError('');
    if (!validateStep(1) || !validateStep(2)) return;

    const result = await create({
      title: sanitizeHTML(title),
      summary: summary || title,
      content,
      universeId: selectedUniverse!.id,
      coverImage: coverImage || undefined,
      categoryIds: selectedCategories.map((c) => c.id),
      tagNames: selectedTags,
    });

    if (result) {
      localStorage.removeItem(DRAFT_KEY);
      setSuccess({ slug: result.slug, title: result.title });
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setTitle(''); setSummary(''); setContent(''); setCoverImage('');
    setSelectedUniverse(null); setSelectedCategories([]); setSelectedTags([]);
    setShowDiscardConfirm(false);
    setStep(1);
  };

  const progressPercent = (() => {
    let filled = 0;
    const total = 4;
    if (title.trim()) filled++;
    if (selectedUniverse) filled++;
    if (content.trim().length >= 50) filled++;
    if (summary.trim() || selectedTags.length > 0 || selectedCategories.length > 0) filled++;
    return Math.round((filled / total) * 100);
  })();

  // ── Render ──
  return (
    <div>
      {/* Progress & Draft indicators */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s as Step)}
                aria-label={`Paso ${s} de 3: ${s === 1 ? 'Información básica' : s === 2 ? 'Contenido' : 'Revisar'}`}
                aria-current={step === s ? 'step' : undefined}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-geek-accent text-white shadow-lg shadow-geek-accent/30'
                    : step > s
                      ? 'bg-geek-accent/20 text-geek-accent'
                      : 'bg-geek-dark-secondary border border-geek-border text-geek-text-secondary'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <span className="text-xs text-geek-text-secondary font-medium hidden sm:inline">
            {step === 1 ? 'Información básica' : step === 2 ? 'Contenido' : 'Revisar y publicar'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full bg-geek-dark-secondary overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-geek-accent to-geek-accent-secondary rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-geek-text-secondary font-mono tabular-nums">{progressPercent}%</span>
          </div>

          {/* Draft saved indicator */}
          {draftSaved && (
            <span className="text-xs text-geek-success/70 flex items-center gap-1 animate-pulse">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Borrador guardado
            </span>
          )}
        </div>
      </div>

      {/* Error banner */}
      {(error || formError) && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-geek-danger/30 text-geek-danger text-sm flex items-start gap-3" role="alert">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium">{error || formError}</p>
            {error?.includes('API') && <p className="text-xs mt-1 opacity-80">Verifica que el servidor API esté corriendo en el puerto 3001</p>}
          </div>
        </div>
      )}

      {/* Step 1: Basic info */}
      {step === 1 && (
        <fieldset className="space-y-6 animate-fade-in border-0 p-0 m-0">
          <legend className="sr-only">Paso 1: Información básica del artículo - título, universo, categorías y tags</legend>
          <Card className="p-6">
            <h3 className="text-lg font-bold text-geek-text font-heading mb-1">Información del artículo</h3>
            <p className="text-sm text-geek-text-secondary mb-5">Define el título y selecciona el universo al que pertenece</p>

            <Input
              label="Título del artículo"
              value={title}
              onChange={(e) => { setTitle(e.target.value); clearFieldError('title'); }}
              placeholder="Ej: La historia completa de los Saiyajin"
              error={fieldErrors.title}
              required
              autoFocus
            />

            <div className="mt-4">
              <Input
                label="Resumen (opcional)"
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
              {coverImage && coverImage.startsWith('http') && (
                <div className="mt-2 rounded-lg overflow-hidden border border-geek-border w-48">
                  <img
                    src={coverImage}
                    alt="Preview"
                    className="w-full h-24 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Universe selector */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-geek-text font-heading mb-1">Selecciona un universo</h3>
            <p className="text-sm text-geek-text-secondary mb-1">¿A qué universo pertenece este artículo?</p>
            {fieldErrors.universe && (
              <p className="text-sm text-geek-danger mb-3">{fieldErrors.universe}</p>
            )}

            {fetching ? (
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
                    <div className="text-lg mb-1">
                      {getUniverseIcon(u.name)}
                    </div>
                    <p className="text-sm font-medium text-geek-text truncate">{u.name}</p>
                    <p className="text-xs text-geek-text-secondary">{u.articleCount} artículos</p>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Category selector */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-geek-text font-heading mb-1">Categorías</h3>
            <p className="text-sm text-geek-text-secondary mb-3">Selecciona una o más categorías para tu artículo</p>
            {fetching ? (
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
            {selectedCategories.length > 0 && (
              <p className="text-xs text-geek-text-secondary mt-2">{selectedCategories.length} categoría(s) seleccionada(s)</p>
            )}
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDiscardConfirm(true)} type="button">
              Descartar
            </Button>
            <Button onClick={nextStep} type="button">
              Continuar →
            </Button>
          </div>
        </fieldset>
      )}

      {/* Step 2: Content */}
      {step === 2 && (
        <fieldset className="space-y-6 animate-fade-in border-0 p-0 m-0">
          <legend className="sr-only">Paso 2: Contenido del artículo y etiquetas</legend>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-geek-text font-heading">Contenido del artículo</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-geek-text-secondary">Markdown / HTML</span>
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
            </div>
            <p className="text-sm text-geek-text-secondary mb-4">
              Escribe el contenido usando HTML o Markdown. Mínimo 50 caracteres.
            </p>

            {previewMode ? (
              <div className="min-h-[300px] rounded-lg bg-geek-dark border border-geek-border p-4 prose prose-invert prose-sm max-w-none text-geek-text">
                {content ? (
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <p className="text-geek-text-secondary italic">El contenido aparecerá aquí...</p>
                )}
              </div>
            ) : (
              <div>
                <Textarea
                  ref={contentRef}
                  value={content}
                  onChange={(e) => { setContent(e.target.value); clearFieldError('content'); }}
                  placeholder="Escribe el contenido del artículo aquí...&#10;&#10;Puedes usar HTML: <p>, <h2>, <ul>, <li>, <strong>, etc."
                  error={fieldErrors.content}
                  required
                  className="min-h-[350px] font-mono text-sm"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-geek-text-secondary">
                    {content.length} caracteres {content.length < 50 && '(mín. 50)'}
                  </span>
                  <span className="text-xs text-geek-text-secondary">
                    <kbd className="px-1.5 py-0.5 rounded bg-geek-dark-tertiary border border-geek-border text-[10px] font-mono">Ctrl+S</kbd> guardar borrador
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Tag input */}
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
                ref={tagInputRef}
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
                      Crear tag "<strong>{tagInput}</strong>"
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

          <div className="flex justify-between gap-3">
            <Button variant="secondary" onClick={prevStep} type="button">
              ← Volver
            </Button>
            <Button onClick={nextStep} type="button">
              Continuar →
            </Button>
          </div>
        </fieldset>
      )}

      {/* Step 3: Review & submit */}
      {step === 3 && (
        <fieldset className="space-y-6 animate-fade-in border-0 p-0 m-0">
          <legend className="sr-only">Paso 3: Revisar y publicar el artículo</legend>
          <Card className="p-6">
            <h3 className="text-lg font-bold text-geek-text font-heading mb-1">Revisar artículo</h3>
            <p className="text-sm text-geek-text-secondary mb-5">Verifica que todo esté correcto antes de publicar</p>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-geek-dark border border-geek-border">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-xl font-bold text-geek-text font-heading">{title || '(Sin título)'}</h4>
                  <Badge variant={user?.role === 'moderator' || user?.role === 'admin' ? 'success' : 'warning'}>
                    {user?.role === 'moderator' || user?.role === 'admin' ? 'Se publicará directamente' : 'Quedará en revisión'}
                  </Badge>
                </div>

                {coverImage && (
                  <img src={coverImage} alt={`Portada de ${title || 'artículo'}`} className="w-full h-48 object-cover rounded-lg mb-3" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedUniverse && (
                    <Badge variant="info">{selectedUniverse.name}</Badge>
                  )}
                  {selectedCategories.map((c) => (
                    <Badge key={c.id} variant="default">{c.name}</Badge>
                  ))}
                  {selectedTags.map((t) => (
                    <Badge key={t} variant="xp">{t}</Badge>
                  ))}
                </div>

                {summary && <p className="text-sm text-geek-text-secondary mb-3 italic">{summary}</p>}

                <div className="rounded-lg bg-geek-dark-tertiary p-4 max-h-48 overflow-y-auto text-sm text-geek-text leading-relaxed">
                  {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content.slice(0, 500) + (content.length > 500 ? '...' : '') }} />
                  ) : (
                    <span className="text-geek-text-secondary italic">Sin contenido</span>
                  )}
                </div>

                <p className="text-xs text-geek-text-secondary mt-2">
                  {content.length} caracteres · {selectedCategories.length} categorías · {selectedTags.length} tags
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-geek-accent/5 border border-geek-accent/10">
                <svg className="w-5 h-5 text-geek-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-geek-text-secondary">
                  {user?.role === 'moderator' || user?.role === 'admin'
                    ? 'Tu artículo se publicará inmediatamente por tu rol de moderador/admin.'
                    : 'Tu artículo será enviado a revisión. Un moderador lo revisará y publicará.'}
                </p>
              </div>
            </div>
          </Card>

          <div className="flex justify-between gap-3">
            <Button variant="secondary" onClick={prevStep} type="button">
              ← Volver
            </Button>
            <Button onClick={(e) => handleSubmit(e)} loading={loading} size="lg" type="submit">
              {user?.role === 'moderator' || user?.role === 'admin' ? 'Publicar artículo' : 'Enviar a revisión'}
            </Button>
          </div>

          <p className="text-xs text-geek-text-secondary text-center">
            Al publicar, aceptas que tu contenido sea visible para toda la comunidad.
          </p>
        </fieldset>
      )}

      {/* Discard confirmation modal */}
      <Modal
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        title="¿Descartar borrador?"
        size="sm"
      >
        <p className="text-sm text-geek-text-secondary mb-5">Perderás todo el progreso actual. Esta acción no se puede deshacer.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" type="button" onClick={() => setShowDiscardConfirm(false)}>Cancelar</Button>
          <Button variant="danger" type="button" onClick={clearDraft}>Descartar todo</Button>
        </div>
      </Modal>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.35s ease-out; }
      `}</style>
    </div>
  );
}

export function CreateArticleFormWithAuth() {
  return (
    <AuthProvider>
      <CreateArticleForm />
    </AuthProvider>
  );
}
