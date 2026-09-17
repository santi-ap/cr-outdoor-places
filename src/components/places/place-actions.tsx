'use client';

import { useState, useTransition } from 'react';
import { ActionButton } from '@/components/ui/action-button';
import { useLanguage } from '@/lib/i18n/language-context';
import { savePlace, markVisited } from '@/app/actions/list-items';

type Status = 'saved' | 'visited' | null;

export function PlaceActions({
  placeId,
  isSignedIn,
  initialStatus,
}: {
  placeId: string;
  isSignedIn: boolean;
  initialStatus: Status;
}) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isSignedIn) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <ActionButton label={t.placeActions.save} variant="secondary" size="desktop" disabled />
          <ActionButton label={t.placeActions.markVisited} variant="primary" size="desktop" disabled />
        </div>
        <p className="text-ink-muted text-sm">{t.placeActions.signInPrompt}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <ActionButton
          label={status ? t.placeActions.saved : t.placeActions.save}
          variant="secondary"
          size="desktop"
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
        {status !== null && (
          <ActionButton
            label={status === 'visited' ? t.placeActions.visited : t.placeActions.markVisited}
            variant="primary"
            size="desktop"
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
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
