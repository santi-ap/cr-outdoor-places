'use client';

import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { PlaceCardPhoto } from './place-card-photo';
import { PlacePills } from './place-pills';
import { useLanguage } from '@/lib/i18n/language-context';
import { getCategoryLabels } from '@/lib/places/labels';
import type { Place } from '@/lib/validation/schemas';

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

  return (
    <div className="rounded-card bg-rail relative flex flex-col overflow-hidden">
      <Link href={`/places/${place.id}`} className="absolute inset-0 z-0" aria-label={place.name} />

      <PlaceCardPhoto placeId={place.id} className="h-[148px]" />

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

      <div className="pointer-events-none flex flex-col gap-1 p-3">
        <span className="text-bark font-display text-base leading-snug font-medium text-wrap-pretty">
          {place.name}
        </span>
        <p className="text-ink-muted truncate text-[11.5px]">
          {[place.province, categoryLabels[place.category] ?? place.category].filter(Boolean).join(' · ')}
        </p>
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          <PlacePills place={place} size="sm" />
        </div>
      </div>
    </div>
  );
}
