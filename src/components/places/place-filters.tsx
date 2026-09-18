'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { FilterChip } from '@/components/ui/filter-chip';
import {
  getCategoryLabels,
  getDifficultyLabels,
  getPetFriendlyLabels,
  getCostTypeLabels,
} from '@/lib/places/labels';
import { useLanguage } from '@/lib/i18n/language-context';
import type { PlacesFilter } from '@/lib/validation/schemas';

const MAX_DISTANCE_M = 10000;

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
          anyLabel={t.filters.anyCategory}
          value={filter.category}
          options={getCategoryLabels(language)}
          onChange={(v) => setField('category', v as PlacesFilter['category'])}
        />
        <FilterSelect
          label={t.filters.difficulty}
          anyLabel={t.filters.anyDifficulty}
          value={filter.difficulty}
          options={getDifficultyLabels(language)}
          onChange={(v) => setField('difficulty', v as PlacesFilter['difficulty'])}
        />
        <FilterSelect
          label={t.filters.pets}
          anyLabel={t.filters.anyPets}
          value={filter.pet_friendly}
          options={getPetFriendlyLabels(language)}
          onChange={(v) => setField('pet_friendly', v as PlacesFilter['pet_friendly'])}
        />
        <FilterSelect
          label={t.filters.cost}
          anyLabel={t.filters.anyCost}
          value={filter.cost_type}
          options={getCostTypeLabels(language)}
          onChange={(v) => setField('cost_type', v as PlacesFilter['cost_type'])}
        />
        <FilterChip
          label={t.filters.petsQuick}
          active={filter.pet_friendly === 'yes'}
          size="desktop"
          onToggle={() => setField('pet_friendly', filter.pet_friendly === 'yes' ? undefined : 'yes')}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{t.filters.maxDistance}</span>
          <span className="text-muted-foreground">
            {filter.max_distance_m ? `${(filter.max_distance_m / 1000).toFixed(1)} km` : t.filters.any}
          </span>
        </div>
        <Slider
          min={0}
          max={MAX_DISTANCE_M}
          step={500}
          value={filter.max_distance_m ?? MAX_DISTANCE_M}
          onValueChange={(value) => {
            const num = typeof value === 'number' ? value : value[0];
            setField('max_distance_m', num >= MAX_DISTANCE_M ? undefined : num);
          }}
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => onChange({})}>
          {t.filters.clearFilters}
        </Button>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  anyLabel,
  value,
  options,
  onChange,
}: {
  label: string;
  anyLabel: string;
  value: string | undefined;
  options: Record<string, string>;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <Select
      value={value ?? 'any'}
      onValueChange={(v) => onChange(!v || v === 'any' ? undefined : v)}
    >
      <SelectTrigger className="w-[150px]" aria-label={label}>
        <SelectValue placeholder={label}>
          {(v: unknown) => (v === 'any' ? anyLabel : (options[v as string] ?? label))}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">{anyLabel}</SelectItem>
        {Object.entries(options).map(([key, text]) => (
          <SelectItem key={key} value={key}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
