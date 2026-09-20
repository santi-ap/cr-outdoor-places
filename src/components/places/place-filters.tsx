'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MultiSelectField, DistanceFilterField } from './filter-field';
import {
  getCategoryLabels,
  getDifficultyLabels,
  getPetFriendlyLabels,
  getCostTypeLabels,
} from '@/lib/places/labels';
import { useLanguage } from '@/lib/i18n/language-context';
import type { PlacesFilter } from '@/lib/validation/schemas';

type MultiValueKey = 'category' | 'difficulty' | 'pet_friendly' | 'cost_type';

export function PlaceFilters({
  filter,
  onChange,
}: {
  filter: PlacesFilter;
  onChange: (filter: PlacesFilter) => void;
}) {
  const { t, language } = useLanguage();
  const hasActiveFilters = Object.keys(filter).length > 0;

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

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label={t.filters.category}>
        <MultiSelectField
          values={filter.category ?? []}
          options={getCategoryLabels(language)}
          onChange={(v) => setValues('category', v)}
        />
      </FieldGroup>

      <FieldGroup label={t.filters.difficulty}>
        <MultiSelectField
          values={filter.difficulty ?? []}
          options={getDifficultyLabels(language)}
          onChange={(v) => setValues('difficulty', v)}
        />
      </FieldGroup>

      <FieldGroup label={t.filters.pets}>
        <MultiSelectField
          values={filter.pet_friendly ?? []}
          options={getPetFriendlyLabels(language)}
          onChange={(v) => setValues('pet_friendly', v)}
        />
      </FieldGroup>

      <FieldGroup label={t.filters.cost}>
        <MultiSelectField
          values={filter.cost_type ?? []}
          options={getCostTypeLabels(language)}
          onChange={(v) => setValues('cost_type', v)}
        />
      </FieldGroup>

      <DistanceFilterField value={filter.max_distance_m} onChange={setDistance} />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => onChange({})}>
          {t.filters.clearFilters}
        </Button>
      )}
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-ink-muted text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
