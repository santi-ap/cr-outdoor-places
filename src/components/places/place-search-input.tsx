'use client';

import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function PlaceSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="border-line bg-cream relative flex items-center rounded-pill border">
      <SearchIcon className="text-ink-muted pointer-events-none absolute left-3.5 size-4" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 rounded-pill border-0 bg-transparent pl-10 pr-3.5 text-sm focus-visible:ring-0"
      />
    </div>
  );
}
