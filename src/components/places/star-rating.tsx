import { StarIcon } from 'lucide-react';
import { cn } from 'cn';

export function StarRating({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon
          key={i}
          width={size}
          height={size}
          className={cn(i <= Math.round(value) ? 'fill-clay text-clay' : 'fill-none text-line-strong')}
        />
      ))}
    </div>
  );
}
