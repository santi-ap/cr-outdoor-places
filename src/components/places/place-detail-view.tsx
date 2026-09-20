'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FootprintsIcon, RulerIcon, ClockIcon, DollarSignIcon } from 'lucide-react';
import { TierBadge, type Tier } from '@/components/ui/tier-badge';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/ui/back-button';
import { PlaceActions, SaveIconButton, type Status } from './place-actions';
import { PhotoCarousel } from './photo-carousel';
import { StarRating } from './star-rating';
import { DirectionsButton } from './directions-button';
import { ShareButton } from './share-button';
import { useLanguage } from '@/lib/i18n/language-context';
import {
  getCategoryLabels,
  getCostTypeLabels,
  getDifficultyLabels,
  getPetFriendlyLabels,
  getTerrainLabels,
} from '@/lib/places/labels';
import { formatDistance, formatDuration } from '@/lib/places/format';
import type { Place, PlaceReview } from '@/lib/validation/schemas';

const DIFFICULTY_TIER: Record<string, Tier> = {
  easy: 'facil',
  moderate: 'moderado',
  hard: 'dificil',
};

const PlaceMap = dynamic(() => import('./place-map').then((m) => m.PlaceMap), {
  ssr: false,
  loading: () => <div className="bg-sand h-full w-full" />,
});

const LOCATION_MAP_ZOOM = 14;

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
  // Lifted so the header's icon SaveIconButton and the PlaceActions bar
  // below stay in sync about whether the place is already saved.
  const [status, setStatus] = useState<Status>(initialStatus);

  const categoryLabels = getCategoryLabels(language);
  const difficultyLabels = getDifficultyLabels(language);
  const terrainLabels = getTerrainLabels(language);
  const costTypeLabels = getCostTypeLabels(language);
  const petFriendlyLabels = getPetFriendlyLabels(language);

  // Icons match the ones the list-view cards already use for the same
  // fields (#47), so the same information reads consistently wherever it
  // shows up.
  const badges: { label: string; tier: Tier; icon?: typeof FootprintsIcon }[] = [];
  if (place.difficulty) {
    badges.push({
      label: difficultyLabels[place.difficulty],
      tier: DIFFICULTY_TIER[place.difficulty],
      icon: FootprintsIcon,
    });
  }
  badges.push({ label: costTypeLabels[place.cost_type], tier: 'neutral', icon: DollarSignIcon });
  badges.push({ label: petFriendlyLabels[place.pet_friendly], tier: 'neutral' });

  const stats: { value: string; label: string; icon: typeof FootprintsIcon }[] = [];
  if (place.distance_m) {
    stats.push({ value: formatDistance(place.distance_m, language), label: t.detail.distanceStat, icon: RulerIcon });
  }
  if (place.duration_min) {
    stats.push({ value: formatDuration(place.duration_min, language), label: t.detail.durationStat, icon: ClockIcon });
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

  const locationLine = [place.province, categoryLabels[place.category] ?? place.category]
    .filter(Boolean)
    .join(' · ');

  // No street-address field in the data model — canton/province is the
  // closest approximation for a "where is this" label on the directions
  // button.
  const directionsLabel = [place.canton, place.province].filter(Boolean).join(', ') || null;

  return (
    <>
      {/* Mobile detail screen (<1024px). */}
      <div className="no-scrollbar flex h-full flex-col overflow-y-auto lg:hidden">
        <div className="relative h-[220px] shrink-0">
          <PhotoCarousel roundedClassName="rounded-b-[30px]" className="h-full" />
          <BackButton href="/" ariaLabel={t.detail.backToMap} className="absolute top-4 left-4" />
        </div>

        <div className="flex flex-col gap-5 p-5 pb-56">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-bark text-[32px] leading-[1.05] font-medium text-wrap-pretty">
                {place.name}
              </h1>
              <p className="text-ink-muted mt-1.5 text-sm">{locationLine}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ShareButton title={place.name} iconOnly />
              <SaveIconButton
                placeId={place.id}
                isSignedIn={isSignedIn}
                status={status}
                onStatusChange={setStatus}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <TierBadge key={b.label} label={b.label} tier={b.tier} icon={b.icon} size="md" />
            ))}
            {place.confidence === 'unverified' && <Badge variant="destructive">{t.detail.unverified}</Badge>}
          </div>

          {place.rating != null && place.reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating value={place.rating} />
              <span className="text-bark text-sm font-medium">{place.rating.toFixed(1)}</span>
              <span className="text-ink-muted text-sm">({place.reviews.length})</span>
            </div>
          )}

          {stats.length > 0 && (
            <div className="border-line divide-line flex divide-x rounded-2xl border">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-1 flex-col gap-0.5 px-4 py-3.5">
                  <span className="font-display text-bark text-xl">{s.value}</span>
                  <span className="text-ink-muted flex items-center gap-1 text-xs">
                    <s.icon className="size-3" />
                    {s.label}
                  </span>
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
                  <div key={row.label} className="flex flex-col gap-0.5 px-4 py-3">
                    <span className="text-ink-muted text-sm">{row.label}</span>
                    <span className="text-sm font-medium text-wrap-pretty">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-bark text-[22px] font-medium">{t.detail.location}</h2>
            <div className="rounded-2xl border-line h-[200px] overflow-hidden border">
              <PlaceMap places={[place]} center={[place.lat, place.lng]} zoom={LOCATION_MAP_ZOOM} />
            </div>
            <DirectionsButton lat={place.lat} lng={place.lng} locationLabel={directionsLabel} />
          </div>

          {place.reviews.length > 0 && (
            <div>
              <h2 className="font-display text-bark mb-3 text-[22px] font-medium">{t.detail.reviews}</h2>
              <ReviewsList reviews={place.reviews} />
            </div>
          )}

          <Link href={`/places/${place.id}/suggest-edit`} className="text-ink-muted text-sm underline">
            {t.detail.suggestEdit}
          </Link>
        </div>

        {/* Save already lives in the header's SaveIconButton — this bar
            only needs to surface once there's a "mark visited" action to
            take, so a signed-out or not-yet-saved visitor sees no floating
            bar at all. bottom-[76px] clears the floating global tab bar
            (MobileTabBar, ~44px pill + 26px offset) instead of sitting
            underneath it. */}
        {status !== null && (
          <div className="from-cream border-line fixed inset-x-0 bottom-[76px] border-t bg-gradient-to-t via-70% p-5 pt-8">
            <PlaceActions
              placeId={place.id}
              isSignedIn={isSignedIn}
              status={status}
              onStatusChange={setStatus}
              size="mobile"
              fullWidth
              showSaveButton={false}
            />
          </div>
        )}
      </div>

      {/* Desktop detail screen (>=1024px). */}
      <div className="hidden h-full overflow-y-auto lg:block">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6 p-10">
          <div className="flex items-center gap-3">
            <BackButton href="/" ariaLabel={t.detail.backToMap} />
            <span className="text-ink-muted text-sm">{locationLine}</span>
            <ShareButton title={place.name} className="ml-auto" />
          </div>

          <PhotoCarousel roundedClassName="rounded-[26px]" className="h-[300px]" />

          <div className="flex items-start gap-10">
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <div>
                <h1 className="font-display text-bark max-w-[620px] text-[44px] leading-[1.04] font-medium text-wrap-pretty">
                  {place.name}
                </h1>
                <p className="text-ink-muted mt-2 text-sm">{locationLine}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {badges.map((b) => (
                    <TierBadge key={b.label} label={b.label} tier={b.tier} icon={b.icon} size="md" />
                  ))}
                  {place.confidence === 'unverified' && (
                    <Badge variant="destructive">{t.detail.unverified}</Badge>
                  )}
                </div>
                {place.rating != null && place.reviews.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <StarRating value={place.rating} />
                    <span className="text-bark text-sm font-medium">{place.rating.toFixed(1)}</span>
                    <span className="text-ink-muted text-sm">({place.reviews.length})</span>
                  </div>
                )}
              </div>

              {stats.length > 0 && (
                <div className="border-line divide-line flex max-w-[520px] divide-x rounded-2xl border">
                  {stats.map((s) => (
                    <div key={s.label} className="flex flex-1 flex-col gap-1 px-4.5 py-4">
                      <span className="font-display text-bark text-2xl">{s.value}</span>
                      <span className="text-ink-muted flex items-center gap-1 text-[13px]">
                        <s.icon className="size-3" />
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {place.description && (
                <p className="text-ink-body max-w-[640px] text-base leading-relaxed text-wrap-pretty">
                  {place.description}
                </p>
              )}

              <div className="flex flex-col gap-3">
                <h2 className="font-display text-bark text-xl font-medium">{t.detail.location}</h2>
                <div className="rounded-2xl border-line h-[260px] overflow-hidden border">
                  <PlaceMap places={[place]} center={[place.lat, place.lng]} zoom={LOCATION_MAP_ZOOM} />
                </div>
                <DirectionsButton lat={place.lat} lng={place.lng} locationLabel={directionsLabel} />
              </div>

              {place.reviews.length > 0 && (
                <div>
                  <h2 className="font-display text-bark mb-3 text-xl font-medium">{t.detail.reviews}</h2>
                  <ReviewsList reviews={place.reviews} />
                </div>
              )}

              <Link href={`/places/${place.id}/suggest-edit`} className="text-ink-muted text-sm underline">
                {t.detail.suggestEdit}
              </Link>
            </div>

            <div className="border-line bg-cream flex w-[340px] shrink-0 flex-col gap-4 rounded-2xl border p-6">
              {practical.length > 0 && (
                <>
                  <h2 className="font-display text-bark text-xl font-medium">{t.detail.practicalInfo}</h2>
                  <div className="flex flex-col">
                    {practical.map((row) => (
                      <div key={row.label} className="border-line-soft flex flex-col gap-0.5 border-b py-3">
                        <span className="text-ink-muted text-sm">{row.label}</span>
                        <span className="text-sm font-medium text-wrap-pretty">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <PlaceActions
                placeId={place.id}
                isSignedIn={isSignedIn}
                status={status}
                onStatusChange={setStatus}
                size="desktop"
                fullWidth
                stacked
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Read-only mock reviews (Issue #36) — no "write a review" UI anywhere.
function ReviewsList({ reviews }: { reviews: PlaceReview[] }) {
  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review, i) => (
        <div key={i} className="border-line-soft border-b pb-4 last:border-b-0 last:pb-0">
          <div className="flex items-center justify-between gap-3">
            <span className="text-bark text-sm font-medium">{review.author}</span>
            <StarRating value={review.rating} size={14} />
          </div>
          <p className="text-ink-body mt-1.5 text-sm leading-relaxed">{review.text}</p>
        </div>
      ))}
    </div>
  );
}
