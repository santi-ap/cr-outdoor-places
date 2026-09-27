'use client';

import { useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { createPlaceSuggestion } from '@/app/actions/place-suggestions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelectField } from '@/components/places/filter-field';
import {
  getCategoryLabels,
  getLandscapeLabels,
  getCostTypeSuggestionLabels,
  getDifficultyLabels,
  getPetFriendlySuggestionLabels,
  getTerrainLabels,
} from '@/lib/places/labels';
import { reverseGeocode } from '@/lib/places/reverse-geocode';
import { useLanguage } from '@/lib/i18n/language-context';
import type { Place, PlaceInsert } from '@/lib/validation/schemas';

const LocationPicker = dynamic(
  () => import('./location-picker').then((m) => m.LocationPicker),
  { ssr: false },
);

// rating/reviews are mock/seed-only display data (Issue #36) — not exposed
// here, since suggestions never touch them. `landscape` is excluded from
// the generic string-per-field mapping below and handled on its own — a
// place can be more than one landscape at once, so it's a string array,
// not a single string like every other field here.
type FieldValues = {
  [K in keyof Omit<PlaceInsert, 'rating' | 'reviews' | 'landscape'>]-?: string;
} & { landscape: string[] };

const EMPTY: FieldValues = {
  name: '',
  description: '',
  category: '',
  landscape: [],
  province: '',
  canton: '',
  lat: '',
  lng: '',
  difficulty: '',
  terrain: '',
  distance_m: '',
  duration_min: '',
  // Not '' like the rest — cost/pet policy always have one of their real
  // values selected (see the label-map comment in lib/places/labels.ts),
  // and 'unknown' is both a real choice and this column's own DB default.
  cost_type: 'unknown',
  cost_amount: '',
  pet_friendly: 'unknown',
  hours_text: '',
  website: '',
  phone: '',
  whatsapp: '',
  source: '',
  confidence: '',
};

function placeToFieldValues(place: Place): FieldValues {
  return {
    ...EMPTY,
    name: place.name,
    description: place.description ?? '',
    category: place.category ?? '',
    landscape: place.landscape,
    province: place.province ?? '',
    canton: place.canton ?? '',
    lat: String(place.lat),
    lng: String(place.lng),
    difficulty: place.difficulty ?? '',
    terrain: place.terrain ?? '',
    distance_m: place.distance_m != null ? String(place.distance_m) : '',
    duration_min: place.duration_min != null ? String(place.duration_min) : '',
    cost_type: place.cost_type,
    cost_amount: place.cost_amount ?? '',
    pet_friendly: place.pet_friendly,
    hours_text: place.hours_text ?? '',
    website: place.website ?? '',
    phone: place.phone ?? '',
    whatsapp: place.whatsapp ?? '',
  };
}

// Fields the suggestion form exposes, and how to parse each into the
// PlaceInsert shape expected by `changes`. Required (non-nullable) columns
// are simply omitted from `changes` when left blank rather than sent as
// null, since the underlying schema doesn't accept null for them.
const NUMBER_FIELDS = new Set(['lat', 'lng', 'distance_m', 'duration_min']);
const NULLABLE_FIELDS = new Set([
  'description',
  'category',
  'province',
  'canton',
  'difficulty',
  'terrain',
  'distance_m',
  'duration_min',
  'cost_amount',
  'hours_text',
  'website',
  'phone',
  'whatsapp',
]);

function parseFieldValue(
  key: keyof PlaceInsert,
  raw: string,
): { skip: true } | { skip: false; value: unknown } {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return NULLABLE_FIELDS.has(key) ? { skip: false, value: null } : { skip: true };
  }
  if (NUMBER_FIELDS.has(key)) {
    const num = Number(trimmed);
    return Number.isFinite(num) ? { skip: false, value: num } : { skip: true };
  }
  return { skip: false, value: trimmed };
}

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}

function buildChanges(values: FieldValues, original: FieldValues | null): Partial<PlaceInsert> {
  const changes: Record<string, unknown> = {};
  for (const key of Object.keys(values) as (keyof FieldValues)[]) {
    if (key === 'source' || key === 'confidence' || key === 'landscape') continue;
    const raw = values[key] as string;
    if (original && raw === original[key]) continue; // edit mode: unchanged
    const parsed = parseFieldValue(key as keyof PlaceInsert, raw);
    if (parsed.skip) continue;
    changes[key] = parsed.value;
  }
  if (!original || !arraysEqual(values.landscape, original.landscape)) {
    changes.landscape = values.landscape;
  }
  return changes as Partial<PlaceInsert>;
}

export function SuggestionForm({ place }: { place?: Place }) {
  const { t, language } = useLanguage();
  const original = place ? placeToFieldValues(place) : null;
  const [values, setValues] = useState<FieldValues>(original ?? EMPTY);
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const categoryLabels = getCategoryLabels(language);
  const landscapeLabels = getLandscapeLabels(language);
  const difficultyLabels = getDifficultyLabels(language);
  const terrainLabels = getTerrainLabels(language);
  const costTypeLabels = getCostTypeSuggestionLabels(language);
  const petFriendlyLabels = getPetFriendlySuggestionLabels(language);

  function setField(key: keyof PlaceInsert, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setLandscape(values: string[]) {
    setValues((prev) => ({ ...prev, landscape: values }));
  }

  // Placing/moving the pin is the source of truth for lat/lng — no more
  // typing coordinates by hand (#73). Province/canton get a best-effort
  // auto-fill from it so those don't need typing either, but stay
  // editable: reverse geocoding a pin isn't always right, and a failed
  // lookup (network hiccup, no OSM match) shouldn't block placing the pin
  // itself, so it's silently left for the suggester to fill in by hand.
  function setLocation(lat: number, lng: number) {
    setValues((prev) => ({ ...prev, lat: String(lat), lng: String(lng) }));
    reverseGeocode(lat, lng, language)
      .then(({ province, canton }) => {
        setValues((prev) => ({
          ...prev,
          province: province ?? prev.province,
          canton: canton ?? prev.canton,
        }));
      })
      .catch(() => {});
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !place &&
      (values.name.trim() === '' ||
        (values.category.trim() === '' && values.landscape.length === 0) ||
        values.lat.trim() === '' ||
        values.lng.trim() === '')
    ) {
      setError(t.suggest.errorNameCategoryRequired);
      setStatus('error');
      return;
    }

    const changes = buildChanges(values, original);
    if (Object.keys(changes).length === 0) {
      setError(t.suggest.errorChangeAtLeastOne);
      setStatus('error');
      return;
    }

    startTransition(async () => {
      const result = await createPlaceSuggestion({
        place_id: place?.id ?? null,
        changes,
      });
      if (result.success) {
        setStatus('sent');
        setError('');
      } else {
        setError(result.error);
        setStatus('error');
      }
    });
  }

  if (status === 'sent') {
    return <p className="text-sm">{t.suggest.thanks}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t.suggest.fields.name}>
        <Input value={values.name} onChange={(e) => setField('name', e.target.value)} />
      </Field>

      <Field label={t.suggest.fields.description}>
        <Textarea
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          rows={3}
        />
      </Field>

      <Field label={t.suggest.fields.category}>
        <EnumSelect
          value={values.category}
          options={categoryLabels}
          placeholder={t.suggest.selectCategory}
          onChange={(v) => setField('category', v)}
        />
      </Field>

      <Field label={t.suggest.fields.landscape}>
        <MultiSelectField values={values.landscape} options={landscapeLabels} onChange={setLandscape} />
      </Field>

      <Field label={t.suggest.fields.location}>
        <LocationPicker
          lat={values.lat === '' ? null : Number(values.lat)}
          lng={values.lng === '' ? null : Number(values.lng)}
          onChange={setLocation}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.suggest.fields.province}>
          <Input value={values.province} onChange={(e) => setField('province', e.target.value)} />
        </Field>
        <Field label={t.suggest.fields.canton}>
          <Input value={values.canton} onChange={(e) => setField('canton', e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.suggest.fields.difficulty}>
          <EnumSelect
            value={values.difficulty}
            options={difficultyLabels}
            placeholder={t.suggest.notSet}
            onChange={(v) => setField('difficulty', v)}
          />
        </Field>
        <Field label={t.suggest.fields.terrain}>
          <EnumSelect
            value={values.terrain}
            options={terrainLabels}
            placeholder={t.suggest.notSet}
            onChange={(v) => setField('terrain', v)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.suggest.fields.distanceM}>
          <Input
            type="number"
            value={values.distance_m}
            onChange={(e) => setField('distance_m', e.target.value)}
          />
        </Field>
        <Field label={t.suggest.fields.durationMin}>
          <Input
            type="number"
            value={values.duration_min}
            onChange={(e) => setField('duration_min', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.suggest.fields.costType}>
          <RequiredEnumSelect
            value={values.cost_type}
            options={costTypeLabels}
            onChange={(v) => setField('cost_type', v)}
          />
        </Field>
        <Field label={t.suggest.fields.costAmount}>
          <Input
            placeholder={t.suggest.costAmountPlaceholder}
            value={values.cost_amount}
            onChange={(e) => setField('cost_amount', e.target.value)}
          />
        </Field>
      </div>

      <Field label={t.suggest.fields.petPolicy}>
        <RequiredEnumSelect
          value={values.pet_friendly}
          options={petFriendlyLabels}
          onChange={(v) => setField('pet_friendly', v)}
        />
      </Field>

      <Field label={t.suggest.fields.hours}>
        <Input
          placeholder={t.suggest.hoursPlaceholder}
          value={values.hours_text}
          onChange={(e) => setField('hours_text', e.target.value)}
        />
      </Field>

      <Field label={t.suggest.fields.website}>
        <Input
          type="url"
          placeholder={t.suggest.websitePlaceholder}
          value={values.website}
          onChange={(e) => setField('website', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.suggest.fields.phone}>
          <Input
            type="tel"
            placeholder={t.suggest.phonePlaceholder}
            value={values.phone}
            onChange={(e) => setField('phone', e.target.value)}
          />
        </Field>
        <Field label={t.suggest.fields.whatsapp}>
          <Input
            type="tel"
            placeholder={t.suggest.whatsappPlaceholder}
            value={values.whatsapp}
            onChange={(e) => setField('whatsapp', e.target.value)}
          />
        </Field>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? t.suggest.submitting : t.suggest.submit}
      </Button>

      {status === 'error' && <p className="text-destructive text-sm">{error}</p>}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function EnumSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: Record<string, string>;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      value={value === '' ? 'unset' : value}
      onValueChange={(v) => onChange(!v || v === 'unset' ? '' : v)}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {(v: unknown) => (v === 'unset' ? placeholder : (options[v as string] ?? placeholder))}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unset">{placeholder}</SelectItem>
        {Object.entries(options).map(([key, text]) => (
          <SelectItem key={key} value={key}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Like EnumSelect, but for fields with no separate "blank" state to offer
// on top of their own options — the value is always one of `options`
// (never ''), so there's no unset pseudo-item or placeholder.
function RequiredEnumSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger>
        <SelectValue>{(v: unknown) => options[v as string] ?? ''}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(options).map(([key, text]) => (
          <SelectItem key={key} value={key}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
