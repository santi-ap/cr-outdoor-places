'use client';

import { MapPinIcon, ChevronRightIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/lib/i18n/language-context';

// Deep-links to external map apps for the destination — this is the
// sanctioned pattern for "directions" per Pillar 1 ("place-first, not
// route-tracking... deep-link to Google/Waze for actual directions"), not
// in-app navigation.
export function DirectionsButton({
  lat,
  lng,
  locationLabel,
}: {
  lat: number;
  lng: number;
  locationLabel: string | null;
}) {
  const { t } = useLanguage();
  const links = [
    { label: 'Google Maps', href: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` },
    { label: 'Apple Maps', href: `https://maps.apple.com/?daddr=${lat},${lng}` },
    { label: 'Waze', href: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes` },
  ];

  const triggerContent = (
    <>
      <MapPinIcon className="text-clay size-4 shrink-0" />
      <span className="text-bark min-w-0 flex-1 truncate text-sm font-medium">
        {locationLabel ?? t.detail.getDirections}
      </span>
      <ChevronRightIcon className="text-ink-muted size-4 shrink-0" />
    </>
  );

  return (
    <>
      {/* Mobile: full-width bottom sheet, matching the app's mobile-first
          bottom-sheet pattern elsewhere, instead of a narrow floating card. */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <button
                type="button"
                className="border-line bg-cream flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left"
              />
            }
          >
            {triggerContent}
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-sheet border-line bg-cream">
            <SheetHeader>
              <SheetTitle className="font-display text-xl font-medium">{t.detail.getDirections}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4 pb-6">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-sand text-bark rounded-xl px-3 py-3 text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: narrow floating popover — unchanged from before. */}
      <div className="hidden lg:block">
        <Popover>
          <PopoverTrigger
            render={
              <button
                type="button"
                className="border-line bg-cream flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left"
              />
            }
          >
            {triggerContent}
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <p className="text-ink-muted px-1 pb-1 text-xs font-medium">{t.detail.getDirections}</p>
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-sand text-bark rounded-md px-2 py-1.5 text-sm"
              >
                {link.label}
              </a>
            ))}
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
