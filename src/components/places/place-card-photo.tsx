'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from 'cn';
import { SLIDE_STYLES } from './photo-carousel';

// A real swipeable photo strip for list-view cards — not just a static
// decorative hint. It's its own <Link> (not part of the card's invisible
// full-card overlay Link from #40, since a scrollable element needs real
// pointer-events to receive the swipe gesture, which a pointer-events-none
// decorative div can't do) rather than a plain div, so a tap that doesn't
// drag still navigates to the place; a drag scrolls it instead, the same
// native browser tap-vs-scroll disambiguation PhotoCarousel's own track
// relies on. aria-hidden/tabIndex=-1 keep it out of the a11y tree so
// screen readers only announce the card's one real link.
export function PlaceCardPhoto({ placeId, className }: { placeId: string; className?: string }) {
  const trackRef = useRef<HTMLAnchorElement>(null);
  const [index, setIndex] = useState(0);

  function handleScroll() {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  }

  return (
    <div className={cn('relative shrink-0 overflow-hidden', className)}>
      <Link
        href={`/places/${placeId}`}
        aria-hidden="true"
        tabIndex={-1}
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {SLIDE_STYLES.map((style, i) => (
          <div key={i} className="h-full w-full shrink-0 snap-center" style={style} />
        ))}
      </Link>
      <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {SLIDE_STYLES.map((_, i) => (
          <span
            key={i}
            className={cn('h-1.5 w-1.5 rounded-full', i === index ? 'bg-cream' : 'bg-cream/50')}
          />
        ))}
      </div>
    </div>
  );
}
