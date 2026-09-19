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

// Placeholder art for places without a stored photo (this prototype has no
// image storage) — reuses the same diagonal-stripe treatment the design
// project itself uses for its own photo placeholders.
const PHOTO_PLACEHOLDER_STYLE = {
  backgroundColor: '#E3D6C1',
  backgroundImage:
    'repeating-linear-gradient(118deg, rgba(143,168,118,0.4) 0 6px, rgba(143,168,118,0) 6px 13px)',
};

export function PlaceCardMobile({
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
  badges.push({ label: costTypeLabels[place.cost_type], tier: 'neutral' });
  if (place.duration_min) {
    badges.push({ label: formatDuration(place.duration_min, language), tier: 'neutral' });
  }
  badges.push({ label: categoryLabels[place.category] ?? place.category, tier: 'neutral' });

  return (
    <div className="rounded-card border-line bg-cream relative flex items-center gap-3 border p-3">
      <Link href={`/places/${place.id}`} className="rounded-card absolute inset-0" aria-label={place.name} />
      <div
        className="pointer-events-none h-[92px] w-[92px] shrink-0 overflow-hidden rounded-2xl"
        style={PHOTO_PLACEHOLDER_STYLE}
      />
      <div className="pointer-events-none flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-bark font-display text-[19px] leading-snug font-medium text-wrap-pretty">
          {place.name}
        </span>
        <p className="text-ink-muted truncate text-[12.5px]">
          {[place.province, categoryLabels[place.category] ?? place.category].filter(Boolean).join(' · ')}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {place.rating != null && (
            <span className="border-clay text-bark rounded-pill inline-flex items-center gap-1 border px-[9px] py-1 text-[11.5px] font-semibold whitespace-nowrap">
              <StarIcon className="fill-clay text-clay size-3" />
              {place.rating.toFixed(1)}
            </span>
          )}
          {badges.map((b) => (
            <TierBadge key={b.label} label={b.label} tier={b.tier} size="sm" />
          ))}
        </div>
      </div>
      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? t.placeActions.saved : t.placeActions.save}
        onClick={onToggleSave}
        className={
          'relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors ' +
          (saved ? 'border-forest bg-forest text-cream' : 'border-line bg-cream text-clay')
        }
      >
        <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor" aria-hidden="true">
          <path d="M0 0h14v18l-7-5-7 5V0z" />
        </svg>
      </button>
    </div>
  );
}
