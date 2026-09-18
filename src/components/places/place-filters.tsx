'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
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

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <Label className="font-medium">{t.filters.maxDistance}</Label>
          <span className="text-muted-foreground shrink-0">
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
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | undefined;
  options: Record<string, string>;
  onChange: (value: string | undefined) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={`filter-${label}`} className="text-ink-muted text-xs font-medium">
        {label}
      </Label>
      <Select
        value={value ?? 'any'}
        onValueChange={(v) => onChange(!v || v === 'any' ? undefined : v)}
      >
        <SelectTrigger id={`filter-${label}`} className="w-[150px]" aria-label={label}>
          <SelectValue placeholder={t.filters.any}>
            {(v: unknown) => (v === 'any' ? t.filters.any : (options[v as string] ?? label))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">{t.filters.any}</SelectItem>
          {Object.entries(options).map(([key, text]) => (
            <SelectItem key={key} value={key}>
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
