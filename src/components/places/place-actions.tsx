'use client';

import { useState, useTransition } from 'react';
import { cn } from 'cn';
import { BookmarkIcon, BookmarkCheckIcon } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { useLanguage } from '@/lib/i18n/language-context';
import { savePlace, markVisited } from '@/app/actions/list-items';

export type Status = 'saved' | 'visited' | null;
type Size = 'mobile' | 'desktop';

// status/onStatusChange are lifted to the caller (PlaceDetailView) rather
// than owned here, so this bar and the header's SaveIconButton below stay
// in sync about whether the place is already saved.
export function PlaceActions({
  placeId,
  isSignedIn,
  status,
  onStatusChange,
  size = 'desktop',
  fullWidth,
  stacked,
}: {
  placeId: string;
  isSignedIn: boolean;
  status: Status;
  onStatusChange: (status: Status) => void;
  size?: Size;
  fullWidth?: boolean;
  stacked?: boolean;
}) {
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const rowClassName = cn('flex gap-2', stacked && 'flex-col');

  if (!isSignedIn) {
    return (
      <div
        className={cn(
          'border-line bg-sand rounded-2xl border px-4 py-3',
          fullWidth ? 'w-full' : 'w-auto',
        )}
      >
        <p className="text-ink-body text-sm">{t.placeActions.signInPrompt}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={rowClassName}>
        {status !== null && (
          <ActionButton
            label={status === 'visited' ? t.placeActions.visited : t.placeActions.markVisited}
            variant="primary"
            size={size}
            fullWidth={fullWidth}
            disabled={isPending || status === 'visited'}
            onPress={() =>
              startTransition(async () => {
                const result = await markVisited(placeId);
                if (result.success) {
                  onStatusChange('visited');
                  setError(null);
                } else {
                  setError(result.error);
                }
              })
            }
          />
        )}
        <ActionButton
          label={status ? t.placeActions.saved : t.placeActions.save}
          variant="secondary"
          size={size}
          fullWidth={fullWidth}
          disabled={isPending || status !== null}
          onPress={() =>
            startTransition(async () => {
              const result = await savePlace(placeId);
              if (result.success) {
                onStatusChange('saved');
                setError(null);
              } else {
                setError(result.error);
              }
            })
          }
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}

// Icon-only save toggle for the mobile detail header, next to the place
// name — reuses the same savePlace action and lifted status as the
// PlaceActions bar above, rather than a second parallel implementation.
export function SaveIconButton({
  placeId,
  status,
  onStatusChange,
  className,
}: {
  placeId: string;
  status: Status;
  onStatusChange: (status: Status) => void;
  className?: string;
}) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const saved = status !== null;

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? t.placeActions.saved : t.placeActions.save}
      disabled={isPending || saved}
      onClick={() =>
        startTransition(async () => {
          const result = await savePlace(placeId);
          if (result.success) onStatusChange('saved');
        })
      }
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border font-medium transition-colors',
        saved ? 'border-forest bg-forest text-cream' : 'border-line bg-cream text-clay',
        className,
      )}
    >
      {saved ? <BookmarkCheckIcon className="size-4" /> : <BookmarkIcon className="size-4" />}
    </button>
  );
}
