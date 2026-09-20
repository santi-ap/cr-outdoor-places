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

// sm covers every mobile pill in the Explore flow (list cards, the
// peek/full map preview panel, and the docked-low preview card) — kept
// to one size so they read as one consistent system rather than the
// docked card being its own one-off (#58). md is reserved for the
// larger, deliberately more prominent contexts: desktop list cards and
// the detail page's own pill row.
const SIZE_STYLES = {
  sm: 'px-[7px] py-0.5 text-[10px]',
  md: 'px-[9px] py-1 text-[11.5px]',
} as const;

const ICON_SIZE = {
  sm: 'size-2.5',
  md: 'size-3',
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
