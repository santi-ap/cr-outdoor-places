'use client';

import { StarIcon, FootprintsIcon, RulerIcon, ClockIcon, DollarSignIcon } from 'lucide-react';
import { TierBadge, type Tier } from '@/components/ui/tier-badge';
import { useLanguage } from '@/lib/i18n/language-context';
import {
  getCategoryLabels,
  getLandscapeLabels,
  getDifficultyLabels,
  getCostTypeLabels,
  getPetFriendlyLabels,
} from '@/lib/places/labels';
import { formatDistance, formatDuration } from '@/lib/places/format';
import type { Place } from '@/lib/validation/schemas';

const DIFFICULTY_TIER: Record<string, Tier> = {
  easy: 'facil',
  moderate: 'moderado',
  hard: 'dificil',
};

// The at-a-glance info row (rating, difficulty, distance, duration, cost,
// category) — shown identically on the list-view cards (#47) and the
// map's selected-place preview, so the field/icon set lives in one place
// instead of drifting across separate copies.
export function PlacePills({ place, size = 'sm' }: { place: Place; size?: 'sm' | 'md' }) {
  const { language } = useLanguage();
  const categoryLabels = getCategoryLabels(language);
  const landscapeLabels = getLandscapeLabels(language);
  const difficultyLabels = getDifficultyLabels(language);
  const costTypeLabels = getCostTypeLabels(language);
  const petFriendlyLabels = getPetFriendlyLabels(language);

  const pills: { key: string; label: string; tier: Tier; icon?: typeof FootprintsIcon }[] = [];
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
  pills.push({ key: 'pet_friendly', label: petFriendlyLabels[place.pet_friendly], tier: 'neutral' });
  if (place.category) {
    pills.push({ key: 'category', label: categoryLabels[place.category] ?? place.category, tier: 'neutral' });
  }
  for (const value of place.landscape) {
    pills.push({ key: `landscape:${value}`, label: landscapeLabels[value] ?? value, tier: 'neutral' });
  }

  const starSize = size === 'md' ? 'size-3' : 'size-2.5';
  const starPadding = size === 'md' ? 'px-[9px] py-1 text-[11.5px]' : 'px-[7px] py-0.5 text-[10px]';

  return (
    <>
      {place.rating != null && (
        <span
          className={`border-clay text-bark rounded-pill inline-flex items-center gap-1 border font-semibold whitespace-nowrap ${starPadding}`}
        >
          <StarIcon className={`fill-clay text-clay ${starSize}`} />
          {place.rating.toFixed(1)}
        </span>
      )}
      {pills.map((pill) => (
        <TierBadge key={pill.key} label={pill.label} tier={pill.tier} icon={pill.icon} size={size} />
      ))}
    </>
  );
}
