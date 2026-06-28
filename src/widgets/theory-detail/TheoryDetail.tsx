import { useState, useEffect, useCallback } from 'react';
import { Badge, Avatar, Button, Card, CardTitle, CardDescription } from '@/shared/ui';
import { AuthProvider, useAuthContext } from '@/app/providers/AuthProvider';
import { useVote } from '@/features/vote-content';
import { formatDate } from '@/shared/lib';
import { ROUTES, getLoginRedirectPath } from '@/shared/constants';
import type { Theory } from '@/entities/theory';

interface TheoryDetailProps {
  theory: Theory | null;
  loading?: boolean;
}

const statusLabels: Record<string, string> = {
  open: 'Abierta',
  debated: 'En debate',
  confirmed: 'Confirmada',
  rejected: 'Descartada',
};

function TheoryDetailInner({ theory, loading }: TheoryDetailProps) {
  const { user, isAuthenticated } = useAuthContext();
  const { voteTheory, loading: voting } = useVote(user?.token);
  const [related, setRelated] = useState<Theory[]>([]);
  const [fetchingRelated, setFetchingRelated] = useState(false);
  const [voteCount, setVoteCount] = useState(theory?.votes ?? 0);
  const [theoryStatus, setTheoryStatus] = useState(theory?.status ?? 'open');

  useEffect(() => {
    if (theory) {
      setVoteCount(theory.votes);
      setTheoryStatus(theory.status);
    }
  }, [theory]);

  useEffect(() => {
    if (!theory?.universe?.id) return;
    setFetchingRelated(true);
    fetch(`/api/theories?universeId=${theory.universe.id}&limit=4`)
      .then((res) => res.json())
      .then((json) => {
        const data = json?.data?.data || [];
        setRelated(data.filter((t: Theory) => t.id !== theory.id).slice(0, 3));
      })
      .catch(() => setRelated([]))
      .finally(() => setFetchingRelated(false));
  }, [theory?.universe?.id, theory?.id]);

  const handleVote = useCallback(async () => {
    if (!theory || !isAuthenticated) return;
    const result = await voteTheory(theory.id, 'up');
    if (result) {
      setVoteCount(result.votes);
      setTheoryStatus(result.status);
    }
  }, [theory, isAuthenticated, voteTheory]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-64 animate-pulse rounded-lg border border-geek-border bg-geek-dark-secondary" />
        <div className="h-48 animate-pulse rounded-lg border border-geek-border bg-geek-dark-secondary" />
      </div>
    );
  }

  if (!theory) {
    return (
      <div className="rounded-lg border border-geek-border bg-geek-dark-secondary px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-geek-text">Teoría no encontrada</h1>
        <p className="mt-2 text-geek-text-secondary">La teoría que buscas no existe o fue eliminada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-lg border border-geek-border bg-geek-dark-secondary">
        <div className="absolute inset-0 bg-gradient-to-r from-geek-dark via-geek-dark/90 to-geek-dark/70" aria-hidden="true" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="info">Teoría</Badge>
            <Badge variant={theoryStatus === 'confirmed' ? 'success' : theoryStatus === 'rejected' ? 'danger' : 'warning'}>
              {statusLabels[theoryStatus] || theoryStatus}
            </Badge>
            {theory.universe && (
              <a href={ROUTES.UNIVERSE_DETAIL(theory.universe.slug)}>
                <Badge variant="default">{theory.universe.name}</Badge>
              </a>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading leading-tight">
            {theory.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-5 text-sm text-geek-text-secondary">
            {theory.author && (
              <a href={ROUTES.PROFILE(theory.author.username)} className="flex items-center gap-2 hover:text-geek-text">
                <Avatar src={theory.author.avatarUrl} alt={theory.author.username} size="sm" />
                <span>{theory.author.username}</span>
              </a>
            )}
            <span>·</span>
            <time dateTime={theory.createdAt}>
              {formatDate(theory.createdAt)}
            </time>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button
              onClick={handleVote}
              loading={voting}
              disabled={!isAuthenticated || voting}
              className="inline-flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              {voteCount} votos
            </Button>
            {!isAuthenticated && (
              <span className="text-xs text-geek-text-secondary">
                <a href={getLoginRedirectPath(ROUTES.ARTICLE_DETAIL(theory.slug))} className="text-geek-accent hover:underline">
                  Inicia sesión
                </a>{' '}
                para votar
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <Card className="p-6 md:p-8">
            <div className="prose prose-invert max-w-none text-geek-text leading-relaxed" dangerouslySetInnerHTML={{ __html: theory.content }} />
          </Card>
        </article>

        <aside className="space-y-4">
          <section className="rounded-lg border border-geek-border bg-geek-dark-secondary/70 p-4">
            <h2 className="text-base font-bold text-geek-text">Sobre esta teoría</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-geek-text-secondary">Estado</span>
                <span className="font-medium text-geek-text">{statusLabels[theoryStatus] || theoryStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-geek-text-secondary">Votos</span>
                <span className="font-medium text-geek-text">{voteCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-geek-text-secondary">Creada</span>
                <span className="font-medium text-geek-text">{formatDate(theory.createdAt)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-geek-border bg-geek-dark-secondary/70 p-4">
            <h2 className="text-base font-bold text-geek-text">Más teorías</h2>
            <div className="mt-4 space-y-3">
              {fetchingRelated ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg bg-geek-dark animate-pulse" />
                ))
              ) : related.length === 0 ? (
                <p className="text-sm text-geek-text-secondary">No hay más teorías en este universo.</p>
              ) : (
                related.map((t) => (
                  <a
                    key={t.id}
                    href={`/teorias/${t.slug}`}
                    className="block rounded-lg border border-geek-border bg-geek-dark p-3 transition-colors hover:border-geek-accent/60"
                  >
                    <CardTitle className="text-sm">{t.title}</CardTitle>
                    <CardDescription className="text-xs mt-1 line-clamp-2">{t.content}</CardDescription>
                    <div className="text-xs text-geek-text-secondary mt-2">{t.votes} votos</div>
                  </a>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export function TheoryDetail(props: TheoryDetailProps) {
  return (
    <AuthProvider>
      <TheoryDetailInner {...props} />
    </AuthProvider>
  );
}
