import { cn } from 'cn';

const SIZE_STYLES = {
  mobile: 'min-h-11 px-[15px] py-2.5 text-[13.5px]',
  desktop: 'min-h-9 px-[15px] py-[9px] text-sm',
} as const;

export function FilterChip({
  label,
  active,
  size = 'mobile',
  onToggle,
  className,
}: {
  label: string;
  active: boolean;
  size?: keyof typeof SIZE_STYLES;
  onToggle?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={cn(
        'cursor-pointer rounded-pill border font-sans whitespace-nowrap transition-colors',
        SIZE_STYLES[size],
        active
          ? 'border-forest bg-forest font-semibold text-cream'
          : 'border-line-strong bg-cream font-medium text-bark',
        className,
      )}
    >
      {label}
    </button>
  );
}
