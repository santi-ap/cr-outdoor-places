import Link from 'next/link';
import { cn } from 'cn';

const VARIANT_STYLES = {
  primary: 'border-0 bg-forest text-cream',
  secondary: 'border-[1.5px] border-clay bg-transparent text-bark',
  quiet: 'border-0 bg-transparent text-ink-muted',
} as const;

const SIZE_STYLES = {
  mobile: 'min-h-[48px] px-4 py-3 text-[14px]',
  desktop: 'min-h-11 px-[18px] py-[11px] text-[14px]',
} as const;

type ActionButtonProps = {
  label: string;
  variant?: keyof typeof VARIANT_STYLES;
  size?: keyof typeof SIZE_STYLES;
  fullWidth?: boolean;
  className?: string;
};

export function ActionButton({
  label,
  variant = 'primary',
  size = 'mobile',
  fullWidth,
  disabled,
  type = 'button',
  onPress,
  href,
  className,
}: ActionButtonProps &
  (
    | { href: string; disabled?: undefined; type?: undefined; onPress?: undefined }
    | { href?: undefined; disabled?: boolean; type?: 'button' | 'submit'; onPress?: () => void }
  )) {
  const sharedClassName = cn(
    'cursor-pointer rounded-control text-center font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    VARIANT_STYLES[variant],
    SIZE_STYLES[size],
    fullWidth ? 'w-full' : 'w-auto',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cn(sharedClassName, 'inline-block')}>
        {label}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onPress} disabled={disabled} className={sharedClassName}>
      {label}
    </button>
  );
}
