export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Sin fecha';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function timeAgo(dateStr: string): string {
  if (!dateStr) return 'Sin fecha';
  const now = new Date();
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Sin fecha';
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: [number, string][] = [
    [31536000, 'año'],
    [2592000, 'mes'],
    [604800, 'semana'],
    [86400, 'día'],
    [3600, 'hora'],
    [60, 'minuto'],
  ];

  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) {
      return `Hace ${count} ${label}${count > 1 ? 's' : ''}`;
    }
  }
  return 'Ahora mismo';
}
