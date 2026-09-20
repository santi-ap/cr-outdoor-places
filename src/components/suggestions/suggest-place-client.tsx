'use client';

import { SuggestionForm } from './suggestion-form';
import { SignInNotice } from '@/components/auth/sign-in-notice';
import { BackButton } from '@/components/ui/back-button';
import { useLanguage } from '@/lib/i18n/language-context';

export function SuggestPlaceClient({ isSignedIn }: { isSignedIn: boolean }) {
  const { t } = useLanguage();

  return (
    <main className="max-lg:no-scrollbar mx-auto flex h-full max-w-2xl flex-col gap-4 overflow-y-auto p-4 pb-24 lg:pb-4">
      <BackButton href="/" label={t.detail.backToMap} ariaLabel={t.detail.backToMap} className="self-start" />

      <h1 className="text-2xl font-semibold">{t.suggest.newPlaceHeading}</h1>
      <p className="text-muted-foreground text-sm">{t.suggest.newPlaceDescription}</p>

      {isSignedIn ? <SuggestionForm /> : <SignInNotice message={t.suggest.signInToSuggest} />}
    </main>
  );
}
