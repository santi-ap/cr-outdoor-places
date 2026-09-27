'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cn } from 'cn';
import {
  FootprintsIcon,
  RulerIcon,
  ClockIcon,
  DollarSignIcon,
  MountainIcon,
  ChevronRightIcon,
  PencilIcon,
  FlagIcon,
} from 'lucide-react';
import { TierBadge, type Tier } from '@/components/ui/tier-badge';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/ui/back-button';
import { PlaceActions, type Status } from './place-actions';
import { PhotoCarousel } from './photo-carousel';
import { StarRating } from './star-rating';
import { DirectionsButton } from './directions-button';
import { ShareButton } from './share-button';
import { PlaceContact } from './place-contact';
import { useLanguage } from '@/lib/i18n/language-context';
import {
  getCategoryLabels,
  getLandscapeLabels,
  getCostTypeLabels,
  getDifficultyLabels,
  getPetFriendlyLabels,
  getTerrainLabels,
} from '@/lib/places/labels';
import { formatDistance, formatDuration } from '@/lib/places/format';
import { getOpenStatus, getWeeklySchedule } from '@/lib/places/hours';
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

  // Mobile-only (5b redesign, Issue #78): the sticky Info/Mapa/Reseñas tabs
  // scroll their section into view and highlight on click — not a true
  // scroll-spy, since the mockup itself is a static preview with no real
  // scroll position to track; this stays simple and doesn't fight the
  // user's own scrolling.
  const [activeTab, setActiveTab] = useState<'info' | 'map' | 'reviews'>('info');
  const infoSectionRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  function goToSection(tab: typeof activeTab, ref: React.RefObject<HTMLDivElement | null>) {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const categoryLabels = getCategoryLabels(language);
  const landscapeLabels = getLandscapeLabels(language);
  const difficultyLabels = getDifficultyLabels(language);
  const terrainLabels = getTerrainLabels(language);
  const costTypeLabels = getCostTypeLabels(language);
  const petFriendlyLabels = getPetFriendlyLabels(language);

  // Icons and pill treatment match the list-view cards for the same
  // fields (#47) — distance/duration used to render as a separate stat
  // box here; now they're pills alongside the rest, same as list view.
  const badges: { label: string; tier: Tier; icon?: typeof FootprintsIcon }[] = [];
  if (place.difficulty) {
    badges.push({
      label: difficultyLabels[place.difficulty],
      tier: DIFFICULTY_TIER[place.difficulty],
      icon: FootprintsIcon,
    });
  }
  if (place.distance_m) {
    badges.push({ label: formatDistance(place.distance_m, language), tier: 'neutral', icon: RulerIcon });
  }
  if (place.duration_min) {
    badges.push({ label: formatDuration(place.duration_min, language), tier: 'neutral', icon: ClockIcon });
  }
  badges.push({ label: costTypeLabels[place.cost_type], tier: 'neutral', icon: DollarSignIcon });
  badges.push({ label: petFriendlyLabels[place.pet_friendly], tier: 'neutral' });

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

  // Mobile-only (5b redesign, Issue #78) — a differently-composed pill row
  // (difficulty/category/cost/pets, no distance or duration) and an icon
  // card grid for practical facts, instead of the shared `badges`/
  // `practical` above (which the desktop layout below still uses
  // untouched). Recorrido combines distance+duration into one card,
  // matching the mockup; hours moves to its own collapsible row instead
  // of a grid card.
  const mobilePills: { label: string; tier: Tier }[] = [];
  if (place.difficulty) {
    mobilePills.push({ label: difficultyLabels[place.difficulty], tier: DIFFICULTY_TIER[place.difficulty] });
  }
  if (place.category) {
    mobilePills.push({ label: categoryLabels[place.category] ?? place.category, tier: 'neutral' });
  }
  mobilePills.push({ label: costTypeLabels[place.cost_type], tier: 'neutral' });
  mobilePills.push({ label: petFriendlyLabels[place.pet_friendly], tier: 'neutral' });

  const factCards: { icon: typeof FootprintsIcon; label: string; value: string }[] = [];
  if (place.distance_m || place.duration_min) {
    factCards.push({
      icon: FootprintsIcon,
      label: t.detail.route,
      value: [
        place.distance_m ? formatDistance(place.distance_m, language) : null,
        place.duration_min ? formatDuration(place.duration_min, language) : null,
      ]
        .filter(Boolean)
        .join(' · '),
    });
  }
  if (place.terrain) {
    factCards.push({ icon: MountainIcon, label: t.detail.terrain, value: terrainLabels[place.terrain] });
  }
  if (place.cost_amount || place.cost_type !== 'unknown') {
    factCards.push({
      icon: DollarSignIcon,
      label: t.detail.entrance,
      value: place.cost_amount ?? costTypeLabels[place.cost_type],
    });
  }
  // Pet policy is deliberately not repeated here — it's already one of the
  // pills above (mobilePills), and repeating it in both places was flagged
  // as clutter (#83). Keep whatever's in the pills there; this grid is for
  // what isn't already shown elsewhere.

  const openStatus = getOpenStatus(place.hours);
  const weeklySchedule = getWeeklySchedule(place.hours, language);

  const locationLine = [
    place.province,
    categoryLabels[place.category ?? ''] ?? place.category,
    ...place.landscape.map((value) => landscapeLabels[value] ?? value),
  ]
    .filter(Boolean)
    .join(' · ');

  // No street-address field in the data model — canton/province is the
  // closest approximation for a "where is this" label on the directions
  // button.
  const directionsLabel = [place.canton, place.province].filter(Boolean).join(', ') || null;

  return (
    <>
      {/* Mobile detail screen (<1024px) — "5b" redesign, Issue #78/#83. */}
      <div className="no-scrollbar flex h-full flex-col overflow-y-auto lg:hidden">
        {/* Share overlays the photo; back is a separate zero-height sticky
            wrapper rendered just before it in flow, so it starts at the
            same top-4 spot over the photo but — unlike share — stays
            pinned there through the whole scroll instead of scrolling
            away with the photo (#83: "make sure back is sticky"). */}
        <div className="sticky top-4 z-30 h-0 px-4">
          <div className="flex justify-start">
            <BackButton href="/" ariaLabel={t.detail.backToMap} className="bg-cream" />
          </div>
        </div>
        <div className="relative h-[260px] shrink-0">
          <PhotoCarousel roundedClassName="rounded-b-[30px]" className="h-full" />
          <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex items-center justify-end">
            <ShareButton title={place.name} iconOnly className="pointer-events-auto" />
          </div>
        </div>

        <div className="flex flex-col gap-4 pb-56">
          <div className="flex flex-col gap-3 px-4 pt-4">
            <div className="flex flex-col gap-1">
              <div className="text-ink-muted flex items-center gap-1.5 text-[13px]">
                {place.province && <span>{place.province}</span>}
                {place.rating != null && place.reviews.length > 0 && (
                  <>
                    {place.province && <span>·</span>}
                    <StarRating value={place.rating} size={12} />
                    <span className="text-bark font-medium">{place.rating.toFixed(1)}</span>
                    <button
                      type="button"
                      onClick={() => goToSection('reviews', reviewsSectionRef)}
                      className="text-ink-muted"
                    >
                      ({place.reviews.length})
                    </button>
                  </>
                )}
              </div>
              <h1 className="font-display text-bark text-[27px] leading-[1.05] font-medium text-wrap-pretty">
                {place.name}
              </h1>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {mobilePills.map((pill) => (
                <TierBadge key={pill.label} label={pill.label} tier={pill.tier} size="md" />
              ))}
              {place.confidence === 'unverified' && <Badge variant="destructive">{t.detail.unverified}</Badge>}
            </div>
          </div>

          {/* Sticky anchor tabs — not true scroll-spy (see goToSection),
              just click-to-jump with the clicked tab highlighted. */}
          {/* top-[60px]: sits just below the sticky back button (top-4,
              44px tall) once both are stuck, instead of overlapping it. */}
          <div className="border-line bg-cream sticky top-[60px] z-10 flex gap-1 border-y px-4 py-2">
            <button
              type="button"
              onClick={() => goToSection('info', infoSectionRef)}
              className={cn(
                'h-10 flex-1 rounded-xl text-[14px] font-semibold transition-colors',
                activeTab === 'info' ? 'bg-bark text-cream' : 'text-ink-muted',
              )}
            >
              {t.detail.tabInfo}
            </button>
            <button
              type="button"
              onClick={() => goToSection('map', mapSectionRef)}
              className={cn(
                'h-10 flex-1 rounded-xl text-[14px] font-semibold transition-colors',
                activeTab === 'map' ? 'bg-bark text-cream' : 'text-ink-muted',
              )}
            >
              {t.detail.tabMap}
            </button>
            {place.reviews.length > 0 && (
              <button
                type="button"
                onClick={() => goToSection('reviews', reviewsSectionRef)}
                className={cn(
                  'h-10 flex-1 rounded-xl text-[14px] font-semibold transition-colors',
                  activeTab === 'reviews' ? 'bg-bark text-cream' : 'text-ink-muted',
                )}
              >
                {t.detail.reviews} <span className="font-medium opacity-70">{place.reviews.length}</span>
              </button>
            )}
          </div>

          <div ref={infoSectionRef} className="flex flex-col gap-4 px-4">
            {weeklySchedule.length > 0 && (
              <div
                className={cn(
                  'flex items-center gap-2.5 rounded-2xl px-3.5 py-3',
                  openStatus.open ? 'bg-[#dde6d3]' : 'bg-rail',
                )}
              >
                <span
                  className={cn('size-2 shrink-0 rounded-full', openStatus.open ? 'bg-forest' : 'bg-clay-dark')}
                />
                <span className={cn('text-[14px] font-semibold', openStatus.open ? 'text-forest' : 'text-clay-dark')}>
                  {openStatus.open ? t.detail.openNow : t.detail.closedNow}
                </span>
                {openStatus.open && openStatus.changeTime && (
                  <span className="text-[14px] text-[#3e5a45]">
                    · {t.detail.closesAt} {openStatus.changeTime}
                  </span>
                )}
              </div>
            )}

            {place.description && (
              <p className="text-ink-body text-[14px] leading-relaxed text-wrap-pretty">{place.description}</p>
            )}

            {factCards.length > 0 && (
              <div>
                <h2 className="font-display text-bark mb-2.5 text-[19px] font-medium">
                  {t.detail.practicalInfo}
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {factCards.map((card) => (
                    <div key={card.label} className="bg-rail flex flex-col gap-1.5 rounded-2xl p-3">
                      <card.icon className="text-forest size-4 shrink-0" />
                      <span className="text-ink-muted text-[12px]">{card.label}</span>
                      <span className="line-clamp-2 text-[14px] leading-snug font-semibold text-wrap-pretty">
                        {card.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Always-shown per-day table (5a design), not the collapsed
                single-line summary 5b originally had — Issue #83. */}
            {weeklySchedule.length > 0 && (
              <div className="border-line rounded-2xl border">
                <div className="flex items-center gap-2 px-3.5 py-3 text-[14px] font-semibold">
                  <ClockIcon className="text-forest size-4 shrink-0" />
                  {t.detail.hours}
                </div>
                {weeklySchedule.map((row) => (
                  <div
                    key={row.label}
                    className="border-line-soft flex items-center justify-between border-t px-3.5 py-2.5 text-[13.5px]"
                  >
                    <span className="text-ink-muted">{row.label}</span>
                    <span
                      className={cn('font-semibold tabular-nums', row.closed && 'text-clay-dark')}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
                {place.hours_text && (
                  <p className="text-ink-body border-line-soft border-t px-3.5 py-2.5 text-[13px] leading-relaxed">
                    {place.hours_text}
                  </p>
                )}
              </div>
            )}

            <PlaceContact place={place} t={t.detail} />
          </div>

          <div ref={mapSectionRef} className="flex flex-col gap-2.5 px-4">
            <h2 className="font-display text-bark text-[19px] font-medium">{t.detail.location}</h2>
            <div className="border-line overflow-hidden rounded-2xl border">
              <div className="h-[170px]">
                <PlaceMap
                  places={[place]}
                  center={[place.lat, place.lng]}
                  zoom={LOCATION_MAP_ZOOM}
                  interactivePins={false}
                  interactive={false}
                />
              </div>
              <div className="bg-rail flex items-center justify-between gap-2 px-3.5 py-2.5">
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                  {directionsLabel ?? place.name}
                </span>
                <DirectionsButton lat={place.lat} lng={place.lng} locationLabel={directionsLabel} variant="pill" />
              </div>
            </div>
          </div>

          {place.reviews.length > 0 && (
            <div ref={reviewsSectionRef} id="reviews" className="flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between gap-3 px-4">
                <h2 className="font-display text-bark text-[19px] font-medium">{t.detail.reviews}</h2>
                {place.rating != null && (
                  <span className="flex items-center gap-1.5 text-[14px] font-semibold">
                    <StarRating value={place.rating} size={13} />
                    {place.rating.toFixed(1)}
                    <span className="text-ink-muted font-normal">· {place.reviews.length}</span>
                  </span>
                )}
              </div>
              <div className="no-scrollbar -mx-0 flex gap-2.5 overflow-x-auto px-4 pb-1">
                {place.reviews.map((review, i) => (
                  <div key={i} className="bg-rail flex w-[264px] shrink-0 flex-col gap-2.5 rounded-2xl p-3.5">
                    <StarRating value={review.rating} size={12} />
                    <p className="text-ink-body line-clamp-3 text-[14px] leading-relaxed">{review.text}</p>
                    <div className="mt-auto flex items-center gap-2">
                      <span className="bg-clay/20 text-clay-dark flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold">
                        {review.author
                          .split(' ')
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </span>
                      <span className="text-bark text-[13px] font-medium">{review.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-line flex flex-col border-t px-4">
            <Link
              href={`/places/${place.id}/suggest-edit`}
              className="border-line-soft flex items-center gap-2.5 border-b py-3.5 text-[14px]"
            >
              <PencilIcon className="text-ink-muted size-4 shrink-0" />
              <span className="flex-1">{t.detail.suggestEdit}</span>
              <ChevronRightIcon className="text-ink-muted size-4 shrink-0" />
            </Link>
            <Link href={`/places/${place.id}/suggest-edit`} className="flex items-center gap-2.5 py-3.5 text-[14px]">
              <FlagIcon className="text-ink-muted size-4 shrink-0" />
              <span className="flex-1">{t.detail.reportProblem}</span>
              <ChevronRightIcon className="text-ink-muted size-4 shrink-0" />
            </Link>
          </div>
        </div>

        {/* This replaces the global MobileTabBar entirely on this page
            (hidden for /places/* routes, see mobile-tab-bar.tsx) rather
            than sitting above it, so it sits flush at the very bottom —
            solid background, not the old translucent gradient fade, per
            #83. */}
        <div className="bg-cream border-line fixed inset-x-0 bottom-0 border-t p-4 pb-5">
          <PlaceActions
            placeId={place.id}
            isSignedIn={isSignedIn}
            status={status}
            onStatusChange={setStatus}
            size="mobile"
            saveVariant="outline"
            saveFullWidth={false}
            extra={<DirectionsButton lat={place.lat} lng={place.lng} locationLabel={directionsLabel} variant="cta" />}
          />
        </div>
      </div>

      {/* Desktop detail screen (>=1024px). */}
      <div className="hidden h-full overflow-y-auto lg:block">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-5 p-8">
          <div className="flex items-center gap-3">
            <BackButton href="/" ariaLabel={t.detail.backToMap} className="sticky top-4 z-20" />
            <span className="text-ink-muted text-sm">{locationLine}</span>
            <ShareButton title={place.name} className="ml-auto" />
          </div>

          <PhotoCarousel roundedClassName="rounded-[26px]" className="h-[260px]" />

          <div className="flex items-start gap-8">
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <div>
                <h1 className="font-display text-bark max-w-[620px] text-[36px] leading-[1.04] font-medium text-wrap-pretty">
                  {place.name}
                </h1>
                <p className="text-ink-muted mt-1.5 text-[13px]">{locationLine}</p>
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

              {place.description && (
                <p className="text-ink-body max-w-[640px] text-[14px] leading-relaxed text-wrap-pretty">
                  {place.description}
                </p>
              )}

              <PlaceContact place={place} t={t.detail} />

              <div className="flex flex-col gap-2.5">
                <h2 className="font-display text-bark text-lg font-medium">{t.detail.location}</h2>
                <div className="rounded-2xl border-line h-[220px] overflow-hidden border">
                  <PlaceMap
                    places={[place]}
                    center={[place.lat, place.lng]}
                    zoom={LOCATION_MAP_ZOOM}
                    interactivePins={false}
                    interactive={false}
                  />
                </div>
                <DirectionsButton lat={place.lat} lng={place.lng} locationLabel={directionsLabel} />
              </div>

              {place.reviews.length > 0 && (
                <div>
                  <h2 className="font-display text-bark mb-2.5 text-lg font-medium">{t.detail.reviews}</h2>
                  <ReviewsList reviews={place.reviews} />
                </div>
              )}

              <Link href={`/places/${place.id}/suggest-edit`} className="text-ink-muted text-sm underline">
                {t.detail.suggestEdit}
              </Link>
            </div>

            <div className="border-line bg-cream flex w-[300px] shrink-0 flex-col gap-3.5 rounded-2xl border p-5">
              {practical.length > 0 && (
                <>
                  <h2 className="font-display text-bark text-lg font-medium">{t.detail.practicalInfo}</h2>
                  <div className="flex flex-col">
                    {practical.map((row) => (
                      <div key={row.label} className="border-line-soft flex flex-col gap-0.5 border-b py-2.5">
                        <span className="text-ink-muted text-[13px]">{row.label}</span>
                        <span className="text-[13px] font-medium text-wrap-pretty">{row.value}</span>
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
    <div className="flex flex-col gap-3.5">
      {reviews.map((review, i) => (
        <div key={i} className="border-line-soft border-b pb-3.5 last:border-b-0 last:pb-0">
          <div className="flex items-center justify-between gap-3">
            <span className="text-bark text-[13px] font-medium">{review.author}</span>
            <StarRating value={review.rating} size={13} />
          </div>
          <p className="text-ink-body mt-1.5 text-[13px] leading-relaxed">{review.text}</p>
        </div>
      ))}
    </div>
  );
}
