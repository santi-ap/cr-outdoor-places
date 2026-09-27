'use client';

import type { ComponentType } from 'react';
import { MapPinIcon, ChevronRightIcon, NavigationIcon } from 'lucide-react';
import { cn } from 'cn';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GoogleMapsIcon, AppleMapsIcon, WazeIcon } from '@/components/icons/brand-icons';
import { useLanguage } from '@/lib/i18n/language-context';

// Deep-links to external map apps for the destination — this is the
// sanctioned pattern for "directions" per Pillar 1 ("place-first, not
// route-tracking... deep-link to Google/Waze for actual directions"), not
// in-app navigation. Each app gets its own recognizable accent color
// (no logo assets in this prototype) rather than a text link, so the row
// reads at a glance and stays compact.
export function DirectionsButton({
  lat,
  lng,
  locationLabel,
  variant = 'row',
}: {
  lat: number;
  lng: number;
  locationLabel: string | null;
  // 'row': the default full-width bordered row (location label + chevron).
  // 'pill': compact, for sitting inside another card (the 5b map-section
  // card's "Abrir mapa" pill — Issue #78). 'cta': large filled button, for
  // the 5b bottom action bar's primary "Cómo llegar" — same underlying
  // app-picker sheet/popover either way, just a different trigger.
  variant?: 'row' | 'pill' | 'cta';
}) {
  const { t } = useLanguage();
  const links = [
    {
      label: 'Google Maps',
      href: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      icon: GoogleMapsIcon,
      bg: '#4285F4',
    },
    {
      label: 'Apple Maps',
      href: `https://maps.apple.com/?daddr=${lat},${lng}`,
      icon: AppleMapsIcon,
      bg: '#000000',
    },
    {
      label: 'Waze',
      href: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
      icon: WazeIcon,
      bg: '#33CCFF',
    },
  ];

  const triggerContent =
    variant === 'cta' ? (
      <>
        <NavigationIcon className="size-4 shrink-0" />
        {t.detail.getDirections}
      </>
    ) : variant === 'pill' ? (
      t.detail.openMap
    ) : (
      <>
        <MapPinIcon className="text-clay size-4 shrink-0" />
        <span className="text-bark min-w-0 flex-1 truncate text-[13px] font-medium">
          {locationLabel ?? t.detail.getDirections}
        </span>
        <ChevronRightIcon className="text-ink-muted size-4 shrink-0" />
      </>
    );

  const triggerClassName =
    variant === 'cta'
      ? 'bg-forest text-cream flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold'
      : variant === 'pill'
        ? 'bg-cream text-forest rounded-control px-3 py-2 text-[13px] font-semibold whitespace-nowrap'
        : 'border-line bg-cream flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left';

  return (
    <>
      {/* Mobile: compact full-width bottom sheet with icon-only app
          buttons, side by side and centered — matches the app's
          mobile-first bottom-sheet pattern elsewhere without taking up
          much vertical space. */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger render={<button type="button" className={triggerClassName} />}>
            {triggerContent}
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-sheet border-line bg-cream gap-2.5 pb-5">
            <SheetHeader className="pb-0">
              <SheetTitle className="font-display text-base font-medium">{t.detail.getDirections}</SheetTitle>
            </SheetHeader>
            <MapAppRow links={links} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: narrow floating popover with the same icon row. */}
      <div className="hidden lg:block">
        <Popover>
          <PopoverTrigger
            render={
              <button
                type="button"
                className="border-line bg-cream flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left"
              />
            }
          >
            {triggerContent}
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <p className="text-ink-muted px-1 pb-0.5 text-xs font-medium">{t.detail.getDirections}</p>
            <MapAppRow links={links} />
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}

function MapAppRow({
  links,
}: {
  links: { label: string; href: string; icon: ComponentType<{ className?: string }>; bg: string }[];
}) {
  return (
    <div className="flex items-center justify-center gap-4 px-2">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className={cn('flex flex-col items-center gap-1.5')}
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm"
            style={{ backgroundColor: link.bg }}
          >
            <link.icon className="size-5" />
          </span>
          <span className="text-ink-muted text-[11px] font-medium whitespace-nowrap">{link.label}</span>
        </a>
      ))}
    </div>
  );
}
