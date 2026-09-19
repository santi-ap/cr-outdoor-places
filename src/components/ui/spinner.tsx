import { cn } from 'cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'border-line border-t-forest size-8 animate-spin rounded-full border-[3px]',
        className,
      )}
    />
  );
}
