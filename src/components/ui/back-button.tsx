import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { cn } from 'cn';

// One shared "go back" control, used everywhere a page needs it (place
// detail, suggest-a-place, suggest-an-edit) instead of each screen
// growing its own — previously a circular icon button on the detail page
// and a plain underlined text link on the suggest pages. The sand
// background + shadow read as a distinct floating control rather than
// blending into whatever's behind it (a photo, on the detail page).
export function BackButton({
  href,
  label,
  ariaLabel,
  className,
}: {
  href: string;
  label?: string;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label ? undefined : ariaLabel}
      className={cn(
        'bg-sand text-bark inline-flex shrink-0 items-center gap-2 rounded-2xl shadow-md',
        label ? 'h-11 px-4 text-sm font-medium whitespace-nowrap' : 'h-11 w-11 justify-center',
        className,
      )}
    >
      <ArrowLeftIcon className="size-5 shrink-0" />
      {label}
    </Link>
  );
}
