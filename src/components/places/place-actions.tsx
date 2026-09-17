'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
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
  const [status, setStatus] = useState<Status>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isSignedIn) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button disabled>Save to my list</Button>
          <Button disabled variant="outline">
            Mark as visited
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Sign in (top right) to save places and track visits.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          disabled={isPending || status !== null}
          onClick={() =>
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
        >
          {status ? 'Saved' : 'Save to my list'}
        </Button>
        {status !== null && (
          <Button
            variant="outline"
            disabled={isPending || status === 'visited'}
            onClick={() =>
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
          >
            {status === 'visited' ? 'Visited' : 'Mark as visited'}
          </Button>
        )}
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
