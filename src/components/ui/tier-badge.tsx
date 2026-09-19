import type { ComponentType } from 'react';
import { cn } from 'cn';

export type Tier = 'plano' | 'facil' | 'moderado' | 'dificil' | 'neutral';

const TIER_STYLES: Record<Tier, string> = {
  plano: 'bg-moss text-[#23281C] border-moss',
  facil: 'bg-moss text-[#23281C] border-moss',
  moderado: 'bg-clay text-bark border-clay',
  dificil: 'bg-clay-dark text-cream border-clay-dark',
  neutral: 'bg-transparent text-bark border-clay',
};

const SIZE_STYLES = {
  sm: 'px-[9px] py-1 text-[11.5px]',
  md: 'px-[11px] py-1.5 text-[12.5px]',
} as const;

const ICON_SIZE = {
  sm: 'size-3',
  md: 'size-3.5',
} as const;

export function TierBadge({
  label,
  tier = 'neutral',
  size = 'sm',
  icon: Icon,
  className,
}: {
  label: string;
  tier?: Tier;
  size?: keyof typeof SIZE_STYLES;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill border font-semibold whitespace-nowrap',
        TIER_STYLES[tier],
        SIZE_STYLES[size],
        className,
      )}
    >
      {Icon && <Icon className={ICON_SIZE[size]} />}
      {label}
    </span>
  );
}
