import type { ComponentType } from 'react';
import Link from 'next/link';
import { cn } from 'cn';

const VARIANT_STYLES = {
  primary: 'border-0 bg-forest text-cream',
  secondary: 'border-[1.5px] border-clay bg-transparent text-bark',
  quiet: 'border-0 bg-transparent text-ink-muted',
  // Forest-bordered outline, e.g. the mobile detail page's "Guardar"
  // (Issue #78/#83) -- distinct from `secondary`'s clay border, used
  // elsewhere for a lighter-weight "not the primary action" treatment.
  outline: 'border-[1.5px] border-forest bg-transparent text-forest',
} as const;

const SIZE_STYLES = {
  // 52px/18px horizontal padding, no vertical padding (centered via flex
  // instead) -- matches the mobile detail page's bottom action bar in the
  // design (Issue #83 follow-up, #82 round 2), which was previously 48px.
  mobile: 'min-h-[52px] px-[18px] text-[14px]',
  desktop: 'min-h-11 px-[18px] py-[11px] text-[14px]',
} as const;

export type ActionButtonVariant = keyof typeof VARIANT_STYLES;

type ActionButtonProps = {
  label: string;
  variant?: ActionButtonVariant;
  size?: keyof typeof SIZE_STYLES;
  fullWidth?: boolean;
  // Leading icon -- the mobile bottom bar's "Guardar" button pairs a small
  // bookmark icon with the label in the design, unlike the plain
  // text-only buttons elsewhere that don't pass this.
  icon?: ComponentType<{ className?: string }>;
  className?: string;
};

export function ActionButton({
  label,
  variant = 'primary',
  size = 'mobile',
  fullWidth,
  icon: Icon,
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
    'flex cursor-pointer items-center justify-center gap-2 rounded-control text-center font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    VARIANT_STYLES[variant],
    SIZE_STYLES[size],
    fullWidth ? 'w-full' : 'w-auto',
    className,
  );

  const content = (
    <>
      {Icon && <Icon className="size-4 shrink-0" />}
      {label}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn(sharedClassName, 'inline-flex')}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onPress} disabled={disabled} className={sharedClassName}>
      {content}
    </button>
  );
}
