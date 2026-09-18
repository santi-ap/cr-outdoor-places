'use client';

import { cn } from 'cn';

export type BrowseView = 'map' | 'list';

export function ViewToggle({
  view,
  onChange,
  mapLabel,
  listLabel,
}: {
  view: BrowseView;
  onChange: (view: BrowseView) => void;
  mapLabel: string;
  listLabel: string;
}) {
  const options: { value: BrowseView; label: string }[] = [
    { value: 'map', label: mapLabel },
    { value: 'list', label: listLabel },
  ];

  return (
    <div className="border-line-strong bg-cream inline-flex shrink-0 items-center gap-0.5 self-start rounded-pill border p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={view === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-pill px-4 py-1.5 text-sm font-medium transition-colors',
            view === option.value ? 'bg-forest text-cream' : 'text-ink-muted hover:text-bark',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
