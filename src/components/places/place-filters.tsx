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
import {
  categoryLabels,
  difficultyLabels,
  petFriendlyLabels,
  costTypeLabels,
} from '@/lib/places/labels';
import type { PlacesFilter } from '@/lib/validation/schemas';

const MAX_DISTANCE_M = 10000;

export function PlaceFilters({
  filter,
  onChange,
}: {
  filter: PlacesFilter;
  onChange: (filter: PlacesFilter) => void;
}) {
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
          label="Category"
          value={filter.category}
          options={categoryLabels}
          onChange={(v) => setField('category', v as PlacesFilter['category'])}
        />
        <FilterSelect
          label="Difficulty"
          value={filter.difficulty}
          options={difficultyLabels}
          onChange={(v) => setField('difficulty', v as PlacesFilter['difficulty'])}
        />
        <FilterSelect
          label="Pets"
          value={filter.pet_friendly}
          options={petFriendlyLabels}
          onChange={(v) => setField('pet_friendly', v as PlacesFilter['pet_friendly'])}
        />
        <FilterSelect
          label="Cost"
          value={filter.cost_type}
          options={costTypeLabels}
          onChange={(v) => setField('cost_type', v as PlacesFilter['cost_type'])}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Max distance</span>
          <span className="text-muted-foreground">
            {filter.max_distance_m ? `${(filter.max_distance_m / 1000).toFixed(1)} km` : 'Any'}
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
          Clear filters
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
  return (
    <Select
      value={value ?? 'any'}
      onValueChange={(v) => onChange(!v || v === 'any' ? undefined : v)}
    >
      <SelectTrigger className="w-[150px]" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">Any {label.toLowerCase()}</SelectItem>
        {Object.entries(options).map(([key, text]) => (
          <SelectItem key={key} value={key}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
