'use client';

import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { PlaceCardPhoto } from './place-card-photo';
import { PlacePills } from './place-pills';
import { useLanguage } from '@/lib/i18n/language-context';
import { getCategoryLabels, getLandscapeLabels } from '@/lib/places/labels';
import type { Place } from '@/lib/validation/schemas';

export function PlaceCardDesktop({
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
  const landscapeLabels = getLandscapeLabels(language);

  return (
    <div className="rounded-card-lg bg-rail relative flex flex-col overflow-hidden">
      <Link
        href={`/places/${place.id}`}
        className="absolute inset-0 z-0"
        aria-label={place.name}
      />
      <PlaceCardPhoto placeId={place.id} className="h-[152px]" />
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
      <div className="pointer-events-none flex flex-1 flex-col gap-1.5 p-3.5">
        <span className="font-display text-bark text-xl font-medium text-wrap-pretty">{place.name}</span>
        <p className="text-ink-muted text-[12.5px]">
          {[
            place.province,
            categoryLabels[place.category ?? ''] ?? place.category,
            landscapeLabels[place.landscape ?? ''] ?? place.landscape,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1.5">
          <PlacePills place={place} size="md" />
        </div>
      </div>
    </div>
  );
}
