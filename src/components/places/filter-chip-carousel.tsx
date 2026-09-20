'use client';

import { useState } from 'react';
import { cn } from 'cn';
import { XIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MultiSelectField, DistanceFilterField } from './filter-field';
import {
  getCategoryLabels,
  getDifficultyLabels,
  getPetFriendlyLabels,
  getCostTypeLabels,
} from '@/lib/places/labels';
import { useLanguage } from '@/lib/i18n/language-context';
import type { PlacesFilter } from '@/lib/validation/schemas';

type FilterKey = 'category' | 'difficulty' | 'pet_friendly' | 'cost_type' | 'max_distance_m';
type MultiValueKey = 'category' | 'difficulty' | 'pet_friendly' | 'cost_type';

// A horizontally-scrollable row of filter buttons ("All filters" plus one
// per field), each opening a compact multi-select drawer for just that
// field — an alternative, faster path to the same `filter` state the full
// "All filters" sheet (PlaceFilters) edits, so the two stay in sync
// without any separate state of their own. Every currently-selected value
// across all fields also shows as its own removable pill below the row.
export function FilterChipCarousel({
  filter,
  onChange,
  onOpenAllFilters,
  resultsLabel,
}: {
  filter: PlacesFilter;
  onChange: (filter: PlacesFilter) => void;
  onOpenAllFilters: () => void;
  resultsLabel: string;
}) {
  const { t, language } = useLanguage();
  const [openField, setOpenField] = useState<FilterKey | null>(null);

  const categoryLabels = getCategoryLabels(language);
  const difficultyLabels = getDifficultyLabels(language);
  const petFriendlyLabels = getPetFriendlyLabels(language);
  const costTypeLabels = getCostTypeLabels(language);

  function setValues<K extends MultiValueKey>(key: K, values: string[]) {
    const next = { ...filter };
    if (values.length === 0) {
      delete next[key];
    } else {
      next[key] = values as PlacesFilter[K];
    }
    onChange(next);
  }

  function setDistance(value: number | undefined) {
    const next = { ...filter };
    if (value === undefined) {
      delete next.max_distance_m;
    } else {
      next.max_distance_m = value;
    }
    onChange(next);
  }

  function removeValue(key: MultiValueKey, value: string) {
    setValues(key, (filter[key] ?? []).filter((v) => v !== value));
  }

  const fields: { key: FilterKey; label: string; count: number }[] = [
    { key: 'category', label: t.filters.category, count: filter.category?.length ?? 0 },
    { key: 'difficulty', label: t.filters.difficulty, count: filter.difficulty?.length ?? 0 },
    { key: 'pet_friendly', label: t.filters.pets, count: filter.pet_friendly?.length ?? 0 },
    { key: 'cost_type', label: t.filters.cost, count: filter.cost_type?.length ?? 0 },
    { key: 'max_distance_m', label: t.filters.maxDistance, count: filter.max_distance_m ? 1 : 0 },
  ];

  const selectedPills: { key: string; label: string; onRemove: () => void }[] = [
    ...(filter.category ?? []).map((v) => ({
      key: `category:${v}`,
      label: categoryLabels[v] ?? v,
      onRemove: () => removeValue('category', v),
    })),
    ...(filter.difficulty ?? []).map((v) => ({
      key: `difficulty:${v}`,
      label: difficultyLabels[v] ?? v,
      onRemove: () => removeValue('difficulty', v),
    })),
    ...(filter.pet_friendly ?? []).map((v) => ({
      key: `pet_friendly:${v}`,
      label: petFriendlyLabels[v] ?? v,
      onRemove: () => removeValue('pet_friendly', v),
    })),
    ...(filter.cost_type ?? []).map((v) => ({
      key: `cost_type:${v}`,
      label: costTypeLabels[v] ?? v,
      onRemove: () => removeValue('cost_type', v),
    })),
    ...(filter.max_distance_m
      ? [
          {
            key: 'max_distance_m',
            label: `${t.filters.maxDistance}: ${(filter.max_distance_m / 1000).toFixed(1)} km`,
            onRemove: () => setDistance(undefined),
          },
        ]
      : []),
  ];

  const activeField = fields.find((f) => f.key === openField);

  return (
    <div className="flex flex-col gap-2">
      {/* No horizontal padding on the scroll container itself — the row's
          own content carries the px-5 instead, so it starts flush with
          the rest of the page but can scroll all the way to the screen
          edges rather than stopping at that margin. */}
      <div className="no-scrollbar overflow-x-auto pb-0.5">
        <div className="flex items-center gap-2 px-5">
          <button
            type="button"
            onClick={onOpenAllFilters}
            className="border-forest bg-forest text-cream rounded-control shrink-0 border-[1.5px] px-3.5 py-2 text-sm font-medium whitespace-nowrap"
          >
            {t.filters.allFilters}
          </button>
          {fields.map((field) => (
            <button
              key={field.key}
              type="button"
              onClick={() => setOpenField(field.key)}
              className={cn(
                'rounded-control shrink-0 border-[1.5px] px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                field.count > 0
                  ? 'border-forest text-forest bg-cream'
                  : 'border-line-strong bg-cream text-ink-muted',
              )}
            >
              {field.label}
              {field.count > 0 ? ` (${field.count})` : ''}
            </button>
          ))}
        </div>
      </div>

      {selectedPills.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="no-scrollbar min-w-0 flex-1 overflow-x-auto pb-0.5">
            <div className="flex items-center gap-1.5 pl-5">
              {selectedPills.map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={pill.onRemove}
                  className="border-forest bg-forest/10 text-forest rounded-pill flex shrink-0 items-center gap-1 border px-3 py-1 text-xs font-medium whitespace-nowrap"
                >
                  {pill.label}
                  <XIcon className="size-3" />
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange({})}
            className="text-forest shrink-0 pr-5 text-xs font-medium whitespace-nowrap underline"
          >
            {t.filters.clearFilters}
          </button>
        </div>
      )}

      <p className="text-ink-muted text-center text-xs">{resultsLabel}</p>

      <Sheet open={openField !== null} onOpenChange={(open) => !open && setOpenField(null)}>
        <SheetContent side="bottom" className="rounded-t-sheet border-line bg-cream">
          <SheetHeader className="flex-row items-center justify-between pr-12">
            <SheetTitle className="font-display text-xl font-medium">{activeField?.label}</SheetTitle>
            {activeField && activeField.count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (activeField.key === 'max_distance_m') setDistance(undefined);
                  else setValues(activeField.key as MultiValueKey, []);
                }}
              >
                {t.filters.clear}
              </Button>
            )}
          </SheetHeader>
          <div className="px-4 pb-6">
            {openField === 'category' && (
              <MultiSelectField
                values={filter.category ?? []}
                options={categoryLabels}
                onChange={(v) => setValues('category', v)}
              />
            )}
            {openField === 'difficulty' && (
              <MultiSelectField
                values={filter.difficulty ?? []}
                options={difficultyLabels}
                onChange={(v) => setValues('difficulty', v)}
              />
            )}
            {openField === 'pet_friendly' && (
              <MultiSelectField
                values={filter.pet_friendly ?? []}
                options={petFriendlyLabels}
                onChange={(v) => setValues('pet_friendly', v)}
              />
            )}
            {openField === 'cost_type' && (
              <MultiSelectField
                values={filter.cost_type ?? []}
                options={costTypeLabels}
                onChange={(v) => setValues('cost_type', v)}
              />
            )}
            {openField === 'max_distance_m' && (
              <DistanceFilterField value={filter.max_distance_m} onChange={setDistance} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
