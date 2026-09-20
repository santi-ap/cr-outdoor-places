'use client';

import { SuggestionForm } from './suggestion-form';
import { SignInNotice } from '@/components/auth/sign-in-notice';
import { BackButton } from '@/components/ui/back-button';
import { useLanguage } from '@/lib/i18n/language-context';
import type { Place } from '@/lib/validation/schemas';

export function SuggestEditClient({ place, isSignedIn }: { place: Place; isSignedIn: boolean }) {
  const { t } = useLanguage();
  const backLabel = `${t.suggest.backTo} ${place.name}`;

  return (
    <main className="max-lg:no-scrollbar mx-auto flex h-full max-w-2xl flex-col gap-4 overflow-y-auto p-4 pb-24 lg:pb-4">
      <BackButton
        href={`/places/${place.id}`}
        label={backLabel}
        ariaLabel={backLabel}
        className="sticky top-4 z-20 self-start"
      />

      <h1 className="text-2xl font-semibold">{t.suggest.editHeading}</h1>
      <p className="text-muted-foreground text-sm">{t.suggest.editDescription}</p>

      {isSignedIn ? <SuggestionForm place={place} /> : <SignInNotice message={t.suggest.signInToEdit} />}
    </main>
  );
}
