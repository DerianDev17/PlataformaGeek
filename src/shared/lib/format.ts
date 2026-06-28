export function formatCompact(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return value.toString();
}

export function formatNumber(value: number): string {
  return value.toLocaleString('es-ES');
}
