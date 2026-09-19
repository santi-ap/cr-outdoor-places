'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/lib/i18n/language-context';

// Shared field-level controls used by both the full filter sheet
// (PlaceFilters) and the individual per-filter chip drawers
// (FilterChipCarousel) so the two stay visually and behaviorally in sync.

export const MAX_DISTANCE_M = 10000;

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  hideLabel,
}: {
  label: string;
  value: string | undefined;
  options: Record<string, string>;
  onChange: (value: string | undefined) => void;
  hideLabel?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-1">
      {!hideLabel && (
        <Label htmlFor={`filter-${label}`} className="text-ink-muted text-xs font-medium">
          {label}
        </Label>
      )}
      <Select value={value ?? 'any'} onValueChange={(v) => onChange(!v || v === 'any' ? undefined : v)}>
        <SelectTrigger id={`filter-${label}`} className={hideLabel ? 'w-full' : 'w-[150px]'} aria-label={label}>
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

export function DistanceFilterField({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <Label className="font-medium">{t.filters.maxDistance}</Label>
        <span className="text-muted-foreground shrink-0">
          {value ? `${(value / 1000).toFixed(1)} km` : t.filters.any}
        </span>
      </div>
      <Slider
        min={0}
        max={MAX_DISTANCE_M}
        step={500}
        value={value ?? MAX_DISTANCE_M}
        onValueChange={(v) => {
          const num = typeof v === 'number' ? v : v[0];
          onChange(num >= MAX_DISTANCE_M ? undefined : num);
        }}
      />
    </div>
  );
}
