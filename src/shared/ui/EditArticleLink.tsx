import { AuthProvider, useAuthContext } from '@/app/providers/AuthProvider';
import { ROUTES } from '@/shared/constants';

interface EditArticleLinkProps {
  slug: string;
  authorId: string;
}

function EditArticleLinkInner({ slug, authorId }: EditArticleLinkProps) {
  const { user, loading } = useAuthContext();

  if (loading || !user) return null;

  const canEdit = user.id === authorId || user.role === 'admin' || user.role === 'moderator';
  if (!canEdit) return null;

  return (
    <a
      href={ROUTES.EDIT_ARTICLE(slug)}
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-geek-border bg-geek-dark-secondary/80 px-4 text-sm font-semibold text-geek-text transition-colors hover:border-geek-accent/70 hover:bg-geek-dark-tertiary focus-visible:ring-2 focus-visible:ring-geek-accent"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
      </svg>
      Editar artículo
    </a>
  );
}

export function EditArticleLink(props: EditArticleLinkProps) {
  return (
    <AuthProvider>
      <EditArticleLinkInner {...props} />
    </AuthProvider>
  );
}
