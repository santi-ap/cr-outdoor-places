'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PlaceFilters } from './place-filters';
import { useLanguage } from '@/lib/i18n/language-context';
import type { PlacesFilter } from '@/lib/validation/schemas';

export function FilterSheetMobile({
  open,
  onOpenChange,
  filter,
  onChange,
  matchCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: PlacesFilter;
  onChange: (filter: PlacesFilter) => void;
  matchCount: number;
}) {
  const { t } = useLanguage();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-sheet border-line bg-cream max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl font-medium">{t.browse.filters}</SheetTitle>
          <p className="text-ink-muted text-sm">
            {matchCount} {t.filters.resultsCount}
          </p>
        </SheetHeader>
        <div className="px-4 pb-6">
          <PlaceFilters filter={filter} onChange={onChange} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
