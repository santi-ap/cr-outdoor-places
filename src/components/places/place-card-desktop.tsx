'use client';

import Link from 'next/link';
import { StarIcon } from 'lucide-react';
import { TierBadge, type Tier } from '@/components/ui/tier-badge';
import { useLanguage } from '@/lib/i18n/language-context';
import { getCategoryLabels, getDifficultyLabels, getCostTypeLabels } from '@/lib/places/labels';
import { formatDuration } from '@/lib/places/format';
import type { Place } from '@/lib/validation/schemas';

const DIFFICULTY_TIER: Record<string, Tier> = {
  easy: 'facil',
  moderate: 'moderado',
  hard: 'dificil',
};

const PHOTO_PLACEHOLDER_STYLE = {
  backgroundColor: '#E3D6C1',
  backgroundImage:
    'repeating-linear-gradient(118deg, rgba(143,168,118,0.4) 0 9px, rgba(143,168,118,0) 9px 20px)',
};

export function PlaceCardDesktop({
  place,
  saved,
  onToggleSave,
}: {
  place: Place;
  saved: boolean;
  onToggleSave?: () => void;
}) {
  const { t, language } = useLanguage();
  const categoryLabels = getCategoryLabels(language);
  const difficultyLabels = getDifficultyLabels(language);
  const costTypeLabels = getCostTypeLabels(language);

  const badges: { label: string; tier: Tier }[] = [];
  if (place.difficulty) {
    badges.push({ label: difficultyLabels[place.difficulty], tier: DIFFICULTY_TIER[place.difficulty] });
  }
  badges.push({ label: categoryLabels[place.category] ?? place.category, tier: 'neutral' });
  badges.push({ label: costTypeLabels[place.cost_type], tier: 'neutral' });
  if (place.duration_min) {
    badges.push({ label: formatDuration(place.duration_min, language), tier: 'neutral' });
  }

  return (
    <div className="rounded-card-lg border-line bg-cream relative flex flex-col overflow-hidden border">
      <Link
        href={`/places/${place.id}`}
        className="absolute inset-0 z-0"
        aria-label={place.name}
      />
      <div className="pointer-events-none h-[172px] shrink-0" style={PHOTO_PLACEHOLDER_STYLE} />
      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? t.placeActions.saved : t.placeActions.save}
        onClick={onToggleSave}
        className={
          'absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ' +
          (saved ? 'border-forest bg-forest text-cream' : 'border-line bg-cream text-clay')
        }
      >
        <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor" aria-hidden="true">
          <path d="M0 0h14v18l-7-5-7 5V0z" />
        </svg>
      </button>
      <div className="pointer-events-none flex flex-1 flex-col gap-2 p-4">
        <span className="font-display text-bark text-2xl font-medium text-wrap-pretty">{place.name}</span>
        <p className="text-ink-muted text-sm">
          {[place.province, categoryLabels[place.category] ?? place.category].filter(Boolean).join(' · ')}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {place.rating != null && (
            <span className="border-clay text-bark rounded-pill inline-flex items-center gap-1 border px-[11px] py-1.5 text-[12.5px] font-semibold whitespace-nowrap">
              <StarIcon className="fill-clay text-clay size-3.5" />
              {place.rating.toFixed(1)}
            </span>
          )}
          {badges.map((b) => (
            <TierBadge key={b.label} label={b.label} tier={b.tier} size="md" />
          ))}
        </div>
      </div>
    </div>
  );
}
