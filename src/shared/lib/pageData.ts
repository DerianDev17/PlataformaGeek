import { fetchApi } from '@/shared/constants/api';

type CollectionEnvelope<T> = {
  data?: T[] | null;
};

function hasDataArray<T>(value: unknown): value is CollectionEnvelope<T> {
  return typeof value === 'object' && value !== null && Array.isArray((value as CollectionEnvelope<T>).data);
}

export async function loadPageData<T>(path: string, fallback: T): Promise<T> {
  const response = await fetchApi<T>(path);
  return response?.data ?? fallback;
}

export async function loadPageCollection<T>(path: string, fallback: T[] = []): Promise<T[]> {
  const data = await loadPageData<T[] | CollectionEnvelope<T>>(path, fallback);

  if (Array.isArray(data)) return data;
  if (hasDataArray<T>(data)) return data.data || fallback;
  return fallback;
}
