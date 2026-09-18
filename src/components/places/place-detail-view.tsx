'use client';

import Link from 'next/link';
import { TierBadge, type Tier } from '@/components/ui/tier-badge';
import { Badge } from '@/components/ui/badge';
import { PlaceActions } from './place-actions';
import { useLanguage } from '@/lib/i18n/language-context';
import {
  getCategoryLabels,
  getCostTypeLabels,
  getDifficultyLabels,
  getPetFriendlyLabels,
  getTerrainLabels,
} from '@/lib/places/labels';
import { formatDistance, formatDuration } from '@/lib/places/format';
import type { Place } from '@/lib/validation/schemas';

const DIFFICULTY_TIER: Record<string, Tier> = {
  easy: 'facil',
  moderate: 'moderado',
  hard: 'dificil',
};

const PHOTO_PLACEHOLDER_STYLE = {
  backgroundColor: '#E3D6C1',
  backgroundImage:
    'repeating-linear-gradient(118deg, rgba(143,168,118,0.4) 0 9px, rgba(143,168,118,0) 9px 20px)',
};

type Status = 'saved' | 'visited' | null;

export function PlaceDetailView({
  place,
  isSignedIn,
  initialStatus,
}: {
  place: Place;
  isSignedIn: boolean;
  initialStatus: Status;
}) {
  const { t, language } = useLanguage();

  const categoryLabels = getCategoryLabels(language);
  const difficultyLabels = getDifficultyLabels(language);
  const terrainLabels = getTerrainLabels(language);
  const costTypeLabels = getCostTypeLabels(language);
  const petFriendlyLabels = getPetFriendlyLabels(language);

  const badges: { label: string; tier: Tier }[] = [];
  if (place.difficulty) {
    badges.push({ label: difficultyLabels[place.difficulty], tier: DIFFICULTY_TIER[place.difficulty] });
  }
  badges.push({ label: costTypeLabels[place.cost_type], tier: 'neutral' });
  badges.push({ label: petFriendlyLabels[place.pet_friendly], tier: 'neutral' });

  const stats: { value: string; label: string }[] = [];
  if (place.distance_m) {
    stats.push({ value: formatDistance(place.distance_m, language), label: t.detail.distanceStat });
  }
  if (place.duration_min) {
    stats.push({ value: formatDuration(place.duration_min, language), label: t.detail.durationStat });
  }

  const practical: { label: string; value: string }[] = [];
  if (place.cost_amount || place.cost_type !== 'unknown') {
    practical.push({ label: t.detail.entrance, value: place.cost_amount ?? costTypeLabels[place.cost_type] });
  }
  if (place.hours_text) {
    practical.push({ label: t.detail.hours, value: place.hours_text });
  }
  if (place.pet_friendly !== 'unknown') {
    practical.push({ label: t.detail.pets, value: petFriendlyLabels[place.pet_friendly] });
  }
  if (place.terrain) {
    practical.push({ label: t.detail.terrain, value: terrainLabels[place.terrain] });
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="relative h-[220px] shrink-0 rounded-b-[30px]" style={PHOTO_PLACEHOLDER_STYLE}>
        <div className="flex items-center justify-between p-4">
          <Link
            href="/"
            aria-label={t.detail.backToMap}
            className="border-line bg-cream flex h-11 w-11 items-center justify-center rounded-2xl border"
          >
            <span className="border-bark -ml-0.5 block h-2.5 w-2.5 rotate-45 border-b-2 border-l-2" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-5 pb-40">
        <div>
          <h1 className="font-display text-bark text-[32px] leading-[1.05] font-medium text-wrap-pretty">
            {place.name}
          </h1>
          <p className="text-ink-muted mt-1.5 text-sm">
            {[place.province, categoryLabels[place.category] ?? place.category].filter(Boolean).join(' · ')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <TierBadge key={b.label} label={b.label} tier={b.tier} size="md" />
          ))}
          {place.confidence === 'unverified' && <Badge variant="destructive">{t.detail.unverified}</Badge>}
        </div>

        {stats.length > 0 && (
          <div className="border-line divide-line flex divide-x rounded-2xl border">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-1 flex-col gap-0.5 px-4 py-3.5">
                <span className="font-display text-bark text-xl">{s.value}</span>
                <span className="text-ink-muted text-xs">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {place.description && (
          <p className="text-ink-body text-[15.5px] leading-relaxed text-wrap-pretty">{place.description}</p>
        )}

        {practical.length > 0 && (
          <div>
            <h2 className="font-display text-bark mb-3 text-[22px] font-medium">{t.detail.practicalInfo}</h2>
            <div className="border-line divide-line divide-y rounded-2xl border">
              {practical.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="text-ink-muted text-sm">{row.label}</span>
                  <span className="text-right text-sm font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link href={`/places/${place.id}/suggest-edit`} className="text-ink-muted text-sm underline">
          {t.detail.suggestEdit}
        </Link>
      </div>

      {/* Fixed full-width on all sizes for now — #16 gives desktop its own
          inline placement alongside the practical-info sidebar. */}
      <div className="from-cream border-line fixed inset-x-0 bottom-0 border-t bg-gradient-to-t via-70% p-5 pt-8">
        <PlaceActions
          placeId={place.id}
          isSignedIn={isSignedIn}
          initialStatus={initialStatus}
          size="mobile"
          fullWidth
        />
      </div>
    </div>
  );
}
