'use client';

import { PlaceFilters } from './place-filters';
import { useLanguage } from '@/lib/i18n/language-context';
import type { PlacesFilter } from '@/lib/validation/schemas';

export function FilterPanelDesktop({
  filter,
  onChange,
  matchCount,
}: {
  filter: PlacesFilter;
  onChange: (filter: PlacesFilter) => void;
  matchCount: number;
}) {
  const { t } = useLanguage();

  return (
    <div className="border-line bg-cream w-[296px] shrink-0 rounded-2xl border p-5">
      <h2 className="font-display text-bark mb-1 text-xl font-medium">{t.browse.filters}</h2>
      <p className="text-ink-muted mb-4 text-sm">
        {matchCount} {t.filters.resultsCount}
      </p>
      <PlaceFilters filter={filter} onChange={onChange} />
    </div>
  );
}
