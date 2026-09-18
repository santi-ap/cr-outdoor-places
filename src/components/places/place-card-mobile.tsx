'use client';

import Link from 'next/link';
import { TierBadge, type Tier } from '@/components/ui/tier-badge';
import { useLanguage } from '@/lib/i18n/language-context';
import { getCategoryLabels, getDifficultyLabels } from '@/lib/places/labels';
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

  const badges: { label: string; tier: Tier }[] = [];
  if (place.difficulty) {
    badges.push({ label: difficultyLabels[place.difficulty], tier: DIFFICULTY_TIER[place.difficulty] });
  }
  badges.push({ label: categoryLabels[place.category] ?? place.category, tier: 'neutral' });

  return (
    <div className="rounded-card border-line bg-cream flex items-center gap-3 border p-3">
      <Link
        href={`/places/${place.id}`}
        className="h-[92px] w-[92px] shrink-0 overflow-hidden rounded-2xl"
        style={PHOTO_PLACEHOLDER_STYLE}
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Link href={`/places/${place.id}`} className="text-bark truncate font-display text-[19px] font-medium">
          {place.name}
        </Link>
        <p className="text-ink-muted truncate text-[12.5px]">
          {[place.province, categoryLabels[place.category] ?? place.category].filter(Boolean).join(' · ')}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {badges.slice(0, 2).map((b) => (
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
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors ' +
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
