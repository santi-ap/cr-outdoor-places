'use client';

import Link from 'next/link';
import { SuggestionForm } from './suggestion-form';
import { useLanguage } from '@/lib/i18n/language-context';

export function SuggestPlaceClient({ isSignedIn }: { isSignedIn: boolean }) {
  const { t } = useLanguage();

  return (
    <main className="max-lg:no-scrollbar mx-auto flex h-full max-w-2xl flex-col gap-4 overflow-y-auto p-4 pb-24 lg:pb-4">
      <Link href="/" className="text-muted-foreground text-sm underline">
        &larr; {t.detail.backToMap}
      </Link>

      <h1 className="text-2xl font-semibold">{t.suggest.newPlaceHeading}</h1>
      <p className="text-muted-foreground text-sm">{t.suggest.newPlaceDescription}</p>

      {isSignedIn ? <SuggestionForm /> : <p className="text-sm">{t.suggest.signInToSuggest}</p>}
    </main>
  );
}
