import { cn } from 'cn';

const VARIANT_STYLES = {
  primary: 'border-0 bg-forest text-cream',
  secondary: 'border-[1.5px] border-clay bg-transparent text-bark',
  quiet: 'border-0 bg-transparent text-ink-muted',
} as const;

const SIZE_STYLES = {
  mobile: 'min-h-[52px] px-5 py-[15px] text-[15px]',
  desktop: 'min-h-11 px-[22px] py-[13px] text-[15px]',
} as const;

export function ActionButton({
  label,
  variant = 'primary',
  size = 'mobile',
  fullWidth,
  disabled,
  type = 'button',
  onPress,
  className,
}: {
  label: string;
  variant?: keyof typeof VARIANT_STYLES;
  size?: keyof typeof SIZE_STYLES;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  onPress?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onPress}
      disabled={disabled}
      className={cn(
        'cursor-pointer rounded-control text-center font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        fullWidth ? 'w-full' : 'w-auto',
        className,
      )}
    >
      {label}
    </button>
  );
}
