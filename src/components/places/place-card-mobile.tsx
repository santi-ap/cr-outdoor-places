'use client';

import Link from 'next/link';
import { StarIcon, FootprintsIcon, RulerIcon, ClockIcon, DollarSignIcon } from 'lucide-react';
import { TierBadge, type Tier } from '@/components/ui/tier-badge';
import { Spinner } from '@/components/ui/spinner';
import { PlaceCardPhoto } from './place-card-photo';
import { useLanguage } from '@/lib/i18n/language-context';
import { getCategoryLabels, getDifficultyLabels, getCostTypeLabels } from '@/lib/places/labels';
import { formatDistance, formatDuration } from '@/lib/places/format';
import type { Place } from '@/lib/validation/schemas';

const DIFFICULTY_TIER: Record<string, Tier> = {
  easy: 'facil',
  moderate: 'moderado',
  hard: 'dificil',
};

export function PlaceCardMobile({
  place,
  saved,
  saving,
  onToggleSave,
}: {
  place: Place;
  saved: boolean;
  saving?: boolean;
  onToggleSave?: () => void;
}) {
  const { t, language } = useLanguage();
  const categoryLabels = getCategoryLabels(language);
  const difficultyLabels = getDifficultyLabels(language);
  const costTypeLabels = getCostTypeLabels(language);

  const pills: { key: string; label: string; tier: Tier; icon: typeof FootprintsIcon }[] = [];
  if (place.difficulty) {
    pills.push({
      key: 'difficulty',
      label: difficultyLabels[place.difficulty],
      tier: DIFFICULTY_TIER[place.difficulty],
      icon: FootprintsIcon,
    });
  }
  if (place.distance_m) {
    pills.push({
      key: 'distance',
      label: formatDistance(place.distance_m, language),
      tier: 'neutral',
      icon: RulerIcon,
    });
  }
  if (place.duration_min) {
    pills.push({
      key: 'duration',
      label: formatDuration(place.duration_min, language),
      tier: 'neutral',
      icon: ClockIcon,
    });
  }
  pills.push({ key: 'cost', label: costTypeLabels[place.cost_type], tier: 'neutral', icon: DollarSignIcon });

  return (
    <div className="rounded-card bg-rail relative flex flex-col overflow-hidden">
      <Link href={`/places/${place.id}`} className="absolute inset-0 z-0" aria-label={place.name} />

      <PlaceCardPhoto placeId={place.id} className="h-[172px]" />

      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? t.placeActions.saved : t.placeActions.save}
        onClick={onToggleSave}
        disabled={saving}
        className={
          'absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ' +
          (saved ? 'border-forest bg-forest text-cream' : 'border-line bg-cream text-clay')
        }
      >
        {saving ? (
          <Spinner className="size-4 border-2" />
        ) : (
          <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor" aria-hidden="true">
            <path d="M0 0h14v18l-7-5-7 5V0z" />
          </svg>
        )}
      </button>

      <div className="pointer-events-none flex flex-col gap-1.5 p-3.5">
        <span className="text-bark font-display text-[19px] leading-snug font-medium text-wrap-pretty">
          {place.name}
        </span>
        <p className="text-ink-muted truncate text-[12.5px]">
          {[place.province, categoryLabels[place.category] ?? place.category].filter(Boolean).join(' · ')}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {place.rating != null && (
            <span className="border-clay text-bark rounded-pill inline-flex items-center gap-1 border px-[9px] py-1 text-[11.5px] font-semibold whitespace-nowrap">
              <StarIcon className="fill-clay text-clay size-3" />
              {place.rating.toFixed(1)}
            </span>
          )}
          {pills.map((pill) => (
            <TierBadge key={pill.key} label={pill.label} tier={pill.tier} icon={pill.icon} size="sm" />
          ))}
          <TierBadge label={categoryLabels[place.category] ?? place.category} tier="neutral" size="sm" />
        </div>
      </div>
    </div>
  );
}
