import { useState, type FormEvent } from 'react';
import { Avatar, Button, SkeletonLine, EmptyState } from '@/shared/ui';
import { timeAgo } from '@/shared/lib';
import { useComments, type Comment } from '@/features/comment-article';
import { AuthProvider, useAuthContext } from '@/app/providers/AuthProvider';

interface CommentSectionProps {
  articleId: string;
  initialCount?: number;
}

function CommentSectionInner({ articleId }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuthContext();
  const { comments, loading, error, addComment, deleteComment } = useComments(articleId, user?.token);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim() || submitting) return;
    setSubmitting(true);
    setLocalError(null);
    const result = await addComment(draft.trim());
    if (result) {
      setDraft('');
    } else {
      setLocalError(error || 'No se pudo publicar el comentario');
    }
    setSubmitting(false);
  }

  async function handleDelete(comment: Comment) {
    if (!confirm('Eliminar este comentario?')) return;
    await deleteComment(comment.id);
  }

  const canDelete = (c: Comment) =>
    isAuthenticated && user && (user.id === c.author.id || user.role === 'admin' || user.role === 'moderator');

  return (
    <section aria-labelledby="comments-heading" className="mt-12 border-t border-geek-border pt-8">
      <h2 id="comments-heading" className="font-heading text-xl font-bold text-white mb-2">
        Comentarios
        <span className="ml-2 text-sm font-normal text-geek-text-secondary">
          ({comments.length})
        </span>
      </h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-geek-border bg-geek-dark-secondary p-4">
          <div className="flex items-start gap-3">
            <Avatar src={user?.avatarUrl ?? null} alt={user?.username ?? 'Tu avatar'} size="sm" />
            <div className="flex-1">
              <label htmlFor="comment-draft" className="sr-only">
                Escribe un comentario
              </label>
              <textarea
                id="comment-draft"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Comparte tu opinion sobre este articulo..."
                rows={3}
                maxLength={1000}
                required
                aria-describedby="comment-helper"
                className="w-full rounded-lg border border-geek-border bg-geek-dark-tertiary px-3 py-2 text-sm text-geek-text placeholder:text-geek-text-secondary focus:border-geek-accent focus:outline-none focus:ring-2 focus:ring-geek-accent/40"
              />
              <p id="comment-helper" className="mt-1 text-xs text-geek-text-secondary">
                {draft.length}/1000 caracteres
              </p>
            </div>
          </div>
          {(localError || error) && (
            <p role="alert" className="mt-2 text-sm text-geek-danger">
              {localError || error}
            </p>
          )}
          <div className="mt-3 flex justify-end">
            <Button type="submit" loading={submitting} disabled={!draft.trim() || submitting}>
              Publicar comentario
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-lg border border-geek-border bg-geek-dark-secondary p-4 text-center">
          <p className="text-sm text-geek-text-secondary">
            <a href="/login" className="text-geek-accent hover:text-geek-accent-secondary font-medium">
              Inicia sesion
            </a>{' '}
            para unirte a la conversacion.
          </p>
        </div>
      )}

      {loading && comments.length === 0 ? (
        <div className="space-y-3">
          <SkeletonLine count={3} />
        </div>
      ) : comments.length === 0 ? (
        <EmptyState
          title="Aun no hay comentarios"
          description="Se el primero en compartir tu opinion."
        />
      ) : (
        <ul className="space-y-4" role="list">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg border border-geek-border bg-geek-dark-secondary p-4">
              <div className="flex items-start gap-3">
                <Avatar src={c.author.avatarUrl} alt={c.author.username} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-geek-text">{c.author.username}</span>
                    {c.author.role !== 'user' && (
                      <span className="rounded bg-geek-accent/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-geek-accent">
                        {c.author.role}
                      </span>
                    )}
                    <time className="text-xs text-geek-text-secondary" dateTime={c.createdAt}>
                      {timeAgo(c.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1.5 text-sm text-geek-text leading-relaxed whitespace-pre-wrap break-words">
                    {c.content}
                  </p>
                </div>
                {canDelete(c) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    aria-label="Eliminar comentario"
                    className="text-xs text-geek-text-secondary hover:text-geek-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-geek-accent rounded px-2 py-1"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function CommentSection(props: CommentSectionProps) {
  return (
    <AuthProvider>
      <CommentSectionInner {...props} />
    </AuthProvider>
  );
}

export default CommentSection;
