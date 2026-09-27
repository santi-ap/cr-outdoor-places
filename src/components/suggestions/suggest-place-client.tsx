'use client';

import Link from 'next/link';
import { SuggestionForm } from './suggestion-form';
import { SignInNotice } from '@/components/auth/sign-in-notice';
import { BackButton } from '@/components/ui/back-button';
import { useLanguage } from '@/lib/i18n/language-context';

export function SuggestPlaceClient({ isSignedIn }: { isSignedIn: boolean }) {
  const { t } = useLanguage();

  return (
    <main className="max-lg:no-scrollbar mx-auto flex h-full max-w-2xl flex-col gap-4 overflow-y-auto p-4 pb-24 lg:pb-4">
      <div className="flex items-center justify-between gap-3">
        <BackButton
          href="/"
          label={t.detail.backToMap}
          ariaLabel={t.detail.backToMap}
          className="sticky top-4 z-20 self-start"
        />
        {isSignedIn && (
          <Link href="/my-suggestions" className="text-forest text-[13px] font-medium underline">
            {t.mySuggestions.viewLink}
          </Link>
        )}
      </div>

      <h1 className="text-xl font-semibold">{t.suggest.newPlaceHeading}</h1>
      <p className="text-muted-foreground text-[13px]">{t.suggest.newPlaceDescription}</p>

      {isSignedIn ? <SuggestionForm /> : <SignInNotice message={t.suggest.signInToSuggest} />}
    </main>
  );
}
