import { apiUrl } from '@/shared/constants/api';

type SlugRecord = {
  slug?: string | null;
};

type ApiCollectionEnvelope<T> = {
  data?: {
    data?: T[];
  };
};

export function fallbackSlugPaths(slugs: string[]) {
  return slugs.map((slug) => ({ params: { slug } }));
}

export async function getSlugPaths<T extends SlugRecord>(endpoint: string, fallbackSlugs: string[]) {
  const fallbackPaths = fallbackSlugPaths(fallbackSlugs);

  try {
    const response = await fetch(apiUrl(endpoint));
    const json = response.ok ? ((await response.json()) as ApiCollectionEnvelope<T>) : null;
    const records = Array.isArray(json?.data?.data) ? json.data.data : [];
    const apiPaths = records
      .filter((record): record is T & { slug: string } => Boolean(record.slug))
      .map((record) => ({ params: { slug: record.slug } }));

    return [...new Map([...fallbackPaths, ...apiPaths].map((path) => [path.params.slug, path])).values()];
  } catch {
    return fallbackPaths;
  }
}
