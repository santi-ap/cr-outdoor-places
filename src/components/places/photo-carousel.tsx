'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { cn } from 'cn';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';

// No real photos exist for any place yet (this prototype has no image
// storage) — a few differently-tinted/patterned placeholder slides stand in
// so the carousel interaction (swipe/arrows/dots) is real, without spending
// tokens or storage on generated or fetched imagery (Issue #34).
const SLIDE_STYLES: CSSProperties[] = [
  {
    backgroundColor: '#E3D6C1',
    backgroundImage:
      'repeating-linear-gradient(118deg, rgba(143,168,118,0.4) 0 9px, rgba(143,168,118,0) 9px 20px)',
  },
  {
    backgroundColor: '#D7E0C7',
    backgroundImage:
      'repeating-linear-gradient(60deg, rgba(139,100,70,0.35) 0 9px, rgba(139,100,70,0) 9px 20px)',
  },
  {
    backgroundColor: '#E7D9C0',
    backgroundImage:
      'repeating-linear-gradient(-30deg, rgba(107,132,94,0.35) 0 9px, rgba(107,132,94,0) 9px 20px)',
  },
  {
    backgroundColor: '#DCE3D2',
    backgroundImage:
      'repeating-linear-gradient(150deg, rgba(184,138,99,0.35) 0 9px, rgba(184,138,99,0) 9px 20px)',
  },
];

export function PhotoCarousel({
  className,
  roundedClassName,
}: {
  className?: string;
  roundedClassName: string;
}) {
  const { t } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function handleScroll() {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  }

  function scrollToIndex(next: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
  }

  return (
    <div className={cn('relative overflow-hidden', roundedClassName, className)}>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {SLIDE_STYLES.map((style, i) => (
          <div
            key={i}
            role="img"
            aria-label={t.detail.photoPlaceholder}
            className="h-full w-full shrink-0 snap-center"
            style={style}
          />
        ))}
      </div>

      <button
        type="button"
        aria-label={t.detail.previousPhoto}
        onClick={() => scrollToIndex(Math.max(0, index - 1))}
        className={cn(
          'bg-cream/80 text-bark absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full shadow-sm transition-opacity',
          index === 0 ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
      >
        <ChevronLeftIcon className="size-5" />
      </button>
      <button
        type="button"
        aria-label={t.detail.nextPhoto}
        onClick={() => scrollToIndex(Math.min(SLIDE_STYLES.length - 1, index + 1))}
        className={cn(
          'bg-cream/80 text-bark absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full shadow-sm transition-opacity',
          index === SLIDE_STYLES.length - 1 ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
      >
        <ChevronRightIcon className="size-5" />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {SLIDE_STYLES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${t.detail.photo} ${i + 1}`}
            aria-current={i === index}
            onClick={() => scrollToIndex(i)}
            className={cn('h-1.5 w-1.5 rounded-full transition-colors', i === index ? 'bg-cream' : 'bg-cream/50')}
          />
        ))}
      </div>
    </div>
  );
}
