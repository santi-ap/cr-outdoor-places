'use client';

import { useState, useTransition } from 'react';
import { cn } from 'cn';
import { ActionButton } from '@/components/ui/action-button';
import { useLanguage } from '@/lib/i18n/language-context';
import { savePlace, markVisited } from '@/app/actions/list-items';

type Status = 'saved' | 'visited' | null;
type Size = 'mobile' | 'desktop';

export function PlaceActions({
  placeId,
  isSignedIn,
  initialStatus,
  size = 'desktop',
  fullWidth,
  stacked,
}: {
  placeId: string;
  isSignedIn: boolean;
  initialStatus: Status;
  size?: Size;
  fullWidth?: boolean;
  stacked?: boolean;
}) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>(initialStatus);
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
                  setStatus('visited');
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
                setStatus('saved');
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
