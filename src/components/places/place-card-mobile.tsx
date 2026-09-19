'use client';

import Link from 'next/link';
import { StarIcon, FootprintsIcon, RulerIcon, ClockIcon, DollarSignIcon } from 'lucide-react';
import { TierBadge, type Tier } from '@/components/ui/tier-badge';
import { useLanguage } from '@/lib/i18n/language-context';
import { getCategoryLabels, getDifficultyLabels, getCostTypeLabels } from '@/lib/places/labels';
import { formatDistance, formatDuration } from '@/lib/places/format';
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

// Static hint that a place has multiple photos, matching PhotoCarousel's
// own dot styling — decorative only (a real per-card interactive carousel
// would fight the card's own full-card-click-through from #40 and add
// overhead across a whole list of cards; that level of interaction lives
// on the detail page's PhotoCarousel).
const PHOTO_DOT_COUNT = 4;

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
    <div className="rounded-card bg-sand relative flex flex-col overflow-hidden">
      <Link href={`/places/${place.id}`} className="absolute inset-0 z-0" aria-label={place.name} />

      <div className="pointer-events-none relative h-[172px] shrink-0" style={PHOTO_PLACEHOLDER_STYLE}>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {Array.from({ length: PHOTO_DOT_COUNT }).map((_, i) => (
            <span key={i} className={i === 0 ? 'bg-cream h-1.5 w-1.5 rounded-full' : 'bg-cream/50 h-1.5 w-1.5 rounded-full'} />
          ))}
        </div>
      </div>

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
