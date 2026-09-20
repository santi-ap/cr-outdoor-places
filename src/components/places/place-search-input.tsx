'use client';

import { SearchIcon, XIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n/language-context';

export function PlaceSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="border-line bg-cream relative flex items-center rounded-pill border">
      <SearchIcon className="text-ink-muted pointer-events-none absolute left-3.5 size-4" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        // iOS Safari auto-zooms the page on focusing any input under
        // 16px — text-base (not text-sm) here keeps it at 16px on
        // mobile; md:text-sm still shrinks it back down on desktop.
        className="h-11 rounded-pill border-0 bg-transparent pr-9 pl-10 text-base focus-visible:ring-0 md:text-sm"
      />
      {value.length > 0 && (
        <button
          type="button"
          aria-label={t.browse.clearSearch}
          onClick={() => onChange('')}
          className="text-ink-muted hover:text-bark absolute right-3 flex size-5 items-center justify-center"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
