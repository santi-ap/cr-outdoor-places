'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSavedPlaceIds } from '@/lib/places/use-saved-places';
import { toggleSavedPlace } from '@/app/actions/list-items';
import { SignInRequiredDialog } from '@/components/auth/sign-in-required-dialog';
import { useIsSignedIn } from '@/lib/auth/use-is-signed-in';
import { PlaceCardMobile } from '@/components/places/place-card-mobile';
import { PlaceCardDesktop } from '@/components/places/place-card-desktop';
import { useLanguage } from '@/lib/i18n/language-context';
import type { Place } from '@/lib/validation/schemas';

// A signed-out visitor following someone else's shared link can still
// save places to their own list here (prompted to sign in first, same as
// everywhere else in the app) — the places themselves are public data,
// only the "my list" membership is per-viewer.
export function SharedListClient({ places }: { places: Place[] }) {
  const { t } = useLanguage();
  const { data: savedIds } = useSavedPlaceIds();
  const queryClient = useQueryClient();
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const isSignedIn = useIsSignedIn();

  const toggleSaved = useMutation({
    mutationFn: (placeId: string) => toggleSavedPlace(placeId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['saved-place-ids'] });
      } else {
        setSignInDialogOpen(true);
      }
    },
  });

  function handleToggleSave(placeId: string) {
    if (isSignedIn === false) {
      setSignInDialogOpen(true);
      return;
    }
    toggleSaved.mutate(placeId);
  }

  const savingPlaceId = toggleSaved.isPending ? toggleSaved.variables : null;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold">{t.sharedList.heading}</h1>

      {places.length === 0 ? (
        <p className="text-ink-muted text-[13px]">{t.sharedList.empty}</p>
      ) : (
        <>
          <div className="flex flex-col gap-2.5 lg:hidden">
            {places.map((place) => (
              <PlaceCardMobile
                key={place.id}
                place={place}
                saved={savedIds?.has(place.id) ?? false}
                saving={savingPlaceId === place.id}
                onToggleSave={() => handleToggleSave(place.id)}
              />
            ))}
          </div>
          <div className="hidden grid-cols-2 gap-4 lg:grid">
            {places.map((place) => (
              <PlaceCardDesktop
                key={place.id}
                place={place}
                saved={savedIds?.has(place.id) ?? false}
                saving={savingPlaceId === place.id}
                onToggleSave={() => handleToggleSave(place.id)}
              />
            ))}
          </div>
        </>
      )}

      <SignInRequiredDialog
        open={signInDialogOpen}
        onOpenChange={setSignInDialogOpen}
        message={t.placeActions.signInPrompt}
      />
    </div>
  );
}
