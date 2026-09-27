'use client';

import { useSyncExternalStore } from 'react';
import { cn } from 'cn';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  getServerUserLocationSnapshot,
  getUserLocationSnapshot,
  requestUserLocation,
  subscribeUserLocation,
} from '@/lib/geo/user-location-state';
import { useLanguage } from '@/lib/i18n/language-context';

// Shared field-level controls used by both the full filter sheet
// (PlaceFilters) and the individual per-filter chip drawers
// (FilterChipCarousel) so the two stay visually and behaviorally in sync.

export const MAX_DISTANCE_M = 10000;

// A field can have more than one value selected at once (e.g. Easy AND
// Hard difficulty) — each option is its own toggle button rather than a
// single-value dropdown.
export function MultiSelectField({
  values,
  options,
  onChange,
}: {
  values: string[];
  options: Record<string, string>;
  onChange: (values: string[]) => void;
}) {
  function toggle(key: string) {
    onChange(values.includes(key) ? values.filter((v) => v !== key) : [...values, key]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(options).map(([key, text]) => {
        const active = values.includes(key);
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(key)}
            className={cn(
              'rounded-control border-[1.5px] px-3 py-1.5 text-[13px] font-medium transition-colors',
              active ? 'border-forest bg-forest text-cream' : 'border-line-strong bg-cream text-bark',
            )}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

export const NEAR_ME_PRESETS_KM = [1, 5, 10, 25];

// Distance-FROM-THE-USER filter (Issue #82) -- distinct from
// DistanceFilterField above, which filters by a place's own recorrido
// (trail/route) length. Tapping a preset both requests geolocation (if
// not already granted) and selects that radius; the actual filtering in
// browse-view.tsx only takes effect once a location is available.
export function NearMeFilterField({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (km: number | null) => void;
}) {
  const { t } = useLanguage();
  const { status } = useSyncExternalStore(
    subscribeUserLocation,
    getUserLocationSnapshot,
    getServerUserLocationSnapshot,
  );

  function selectRadius(km: number) {
    if (status !== 'granted') requestUserLocation();
    onChange(value === km ? null : km);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {NEAR_ME_PRESETS_KM.map((km) => (
          <button
            key={km}
            type="button"
            aria-pressed={value === km}
            onClick={() => selectRadius(km)}
            className={cn(
              'rounded-control border-[1.5px] px-3 py-1.5 text-[13px] font-medium transition-colors',
              value === km ? 'border-forest bg-forest text-cream' : 'border-line-strong bg-cream text-bark',
            )}
          >
            {km} km
          </button>
        ))}
      </div>
      {status === 'requesting' && <p className="text-muted-foreground text-xs">{t.filters.nearMeRequesting}</p>}
      {status === 'denied' && <p className="text-muted-foreground text-xs">{t.filters.nearMeDenied}</p>}
      {status === 'unsupported' && <p className="text-muted-foreground text-xs">{t.filters.nearMeUnsupported}</p>}
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
