import type { Language } from '@/lib/i18n/dictionary';

export function formatDistance(meters: number, language: Language): string {
  if (meters < 1000) return `${meters} m`;
  const km = (meters / 1000).toFixed(1);
  return language === 'es' ? `${km.replace('.', ',')} km` : `${km} km`;
}

export function formatDuration(minutes: number, language: Language): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return language === 'es' ? `${minutes} min` : `${minutes} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest}`;
}
