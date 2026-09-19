'use client';

import { Button } from '@/components/ui/button';
import { FilterSelect, DistanceFilterField } from './filter-field';
import {
  getCategoryLabels,
  getDifficultyLabels,
  getPetFriendlyLabels,
  getCostTypeLabels,
} from '@/lib/places/labels';
import { useLanguage } from '@/lib/i18n/language-context';
import type { PlacesFilter } from '@/lib/validation/schemas';

export function PlaceFilters({
  filter,
  onChange,
}: {
  filter: PlacesFilter;
  onChange: (filter: PlacesFilter) => void;
}) {
  const { t, language } = useLanguage();
  const hasActiveFilters = Object.keys(filter).length > 0;

  function setField<K extends keyof PlacesFilter>(key: K, value: PlacesFilter[K] | undefined) {
    const next = { ...filter };
    if (value === undefined) {
      delete next[key];
    } else {
      next[key] = value;
    }
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <FilterSelect
          label={t.filters.category}
          value={filter.category}
          options={getCategoryLabels(language)}
          onChange={(v) => setField('category', v as PlacesFilter['category'])}
        />
        <FilterSelect
          label={t.filters.difficulty}
          value={filter.difficulty}
          options={getDifficultyLabels(language)}
          onChange={(v) => setField('difficulty', v as PlacesFilter['difficulty'])}
        />
        <FilterSelect
          label={t.filters.pets}
          value={filter.pet_friendly}
          options={getPetFriendlyLabels(language)}
          onChange={(v) => setField('pet_friendly', v as PlacesFilter['pet_friendly'])}
        />
        <FilterSelect
          label={t.filters.cost}
          value={filter.cost_type}
          options={getCostTypeLabels(language)}
          onChange={(v) => setField('cost_type', v as PlacesFilter['cost_type'])}
        />
      </div>

      <DistanceFilterField value={filter.max_distance_m} onChange={(v) => setField('max_distance_m', v)} />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => onChange({})}>
          {t.filters.clearFilters}
        </Button>
      )}
    </div>
  );
}
