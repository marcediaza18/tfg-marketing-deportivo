export function formatEUR(n: number | undefined | null): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(s: string | Date | undefined | null): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('es-ES');
}

export function formatDateTime(s: string | Date | undefined | null): string {
  if (!s) return '—';
  return new Date(s).toLocaleString('es-ES');
}

export function apiError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { data?: { error?: string; details?: unknown } } }).response;
    if (r?.data?.error) return r.data.error;
  }
  if (err instanceof Error) return err.message;
  return 'Error desconocido';
}

export function toDateInput(s: string | Date | undefined | null): string {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}
