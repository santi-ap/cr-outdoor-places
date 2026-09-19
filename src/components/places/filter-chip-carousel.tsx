'use client';

import { useState } from 'react';
import { cn } from 'cn';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FilterSelect, DistanceFilterField } from './filter-field';
import {
  getCategoryLabels,
  getDifficultyLabels,
  getPetFriendlyLabels,
  getCostTypeLabels,
} from '@/lib/places/labels';
import { useLanguage } from '@/lib/i18n/language-context';
import type { PlacesFilter } from '@/lib/validation/schemas';

type FilterKey = 'category' | 'difficulty' | 'pet_friendly' | 'cost_type' | 'max_distance_m';

// A horizontally-scrollable row of single-filter chips, each opening a
// compact drawer for just that field — an alternative, faster path to the
// same `filter` state the full "All filters" sheet (PlaceFilters) edits,
// so the two stay in sync without any separate state of their own.
export function FilterChipCarousel({
  filter,
  onChange,
}: {
  filter: PlacesFilter;
  onChange: (filter: PlacesFilter) => void;
}) {
  const { t, language } = useLanguage();
  const [openField, setOpenField] = useState<FilterKey | null>(null);

  const categoryLabels = getCategoryLabels(language);
  const difficultyLabels = getDifficultyLabels(language);
  const petFriendlyLabels = getPetFriendlyLabels(language);
  const costTypeLabels = getCostTypeLabels(language);

  function setField<K extends keyof PlacesFilter>(key: K, value: PlacesFilter[K] | undefined) {
    const next = { ...filter };
    if (value === undefined) {
      delete next[key];
    } else {
      next[key] = value;
    }
    onChange(next);
  }

  const chips: { key: FilterKey; label: string; valueText: string; isActive: boolean }[] = [
    {
      key: 'category',
      label: t.filters.category,
      valueText: filter.category ? (categoryLabels[filter.category] ?? filter.category) : t.filters.any,
      isActive: !!filter.category,
    },
    {
      key: 'difficulty',
      label: t.filters.difficulty,
      valueText: filter.difficulty ? (difficultyLabels[filter.difficulty] ?? filter.difficulty) : t.filters.any,
      isActive: !!filter.difficulty,
    },
    {
      key: 'pet_friendly',
      label: t.filters.pets,
      valueText: filter.pet_friendly ? (petFriendlyLabels[filter.pet_friendly] ?? filter.pet_friendly) : t.filters.any,
      isActive: !!filter.pet_friendly,
    },
    {
      key: 'cost_type',
      label: t.filters.cost,
      valueText: filter.cost_type ? (costTypeLabels[filter.cost_type] ?? filter.cost_type) : t.filters.any,
      isActive: !!filter.cost_type,
    },
    {
      key: 'max_distance_m',
      label: t.filters.maxDistance,
      valueText: filter.max_distance_m ? `${(filter.max_distance_m / 1000).toFixed(1)} km` : t.filters.any,
      isActive: !!filter.max_distance_m,
    },
  ];

  const activeChip = chips.find((c) => c.key === openField);

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => setOpenField(chip.key)}
            className={cn(
              'shrink-0 rounded-pill border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors',
              chip.isActive
                ? 'border-forest bg-forest/10 text-forest'
                : 'border-line-strong bg-cream text-ink-muted',
            )}
          >
            {chip.label}: {chip.valueText}
          </button>
        ))}
      </div>

      <Sheet open={openField !== null} onOpenChange={(open) => !open && setOpenField(null)}>
        <SheetContent side="bottom" className="rounded-t-sheet border-line bg-cream">
          <SheetHeader>
            <SheetTitle className="font-display text-xl font-medium">{activeChip?.label}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            {openField === 'category' && (
              <FilterSelect
                label={t.filters.category}
                value={filter.category}
                options={categoryLabels}
                onChange={(v) => setField('category', v as PlacesFilter['category'])}
                hideLabel
              />
            )}
            {openField === 'difficulty' && (
              <FilterSelect
                label={t.filters.difficulty}
                value={filter.difficulty}
                options={difficultyLabels}
                onChange={(v) => setField('difficulty', v as PlacesFilter['difficulty'])}
                hideLabel
              />
            )}
            {openField === 'pet_friendly' && (
              <FilterSelect
                label={t.filters.pets}
                value={filter.pet_friendly}
                options={petFriendlyLabels}
                onChange={(v) => setField('pet_friendly', v as PlacesFilter['pet_friendly'])}
                hideLabel
              />
            )}
            {openField === 'cost_type' && (
              <FilterSelect
                label={t.filters.cost}
                value={filter.cost_type}
                options={costTypeLabels}
                onChange={(v) => setField('cost_type', v as PlacesFilter['cost_type'])}
                hideLabel
              />
            )}
            {openField === 'max_distance_m' && (
              <DistanceFilterField value={filter.max_distance_m} onChange={(v) => setField('max_distance_m', v)} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
