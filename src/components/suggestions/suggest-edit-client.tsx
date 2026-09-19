'use client';

import Link from 'next/link';
import { SuggestionForm } from './suggestion-form';
import { useLanguage } from '@/lib/i18n/language-context';
import type { Place } from '@/lib/validation/schemas';

export function SuggestEditClient({ place, isSignedIn }: { place: Place; isSignedIn: boolean }) {
  const { t } = useLanguage();

  return (
    <main className="max-lg:no-scrollbar mx-auto flex h-full max-w-2xl flex-col gap-4 overflow-y-auto p-4 pb-24 lg:pb-4">
      <Link href={`/places/${place.id}`} className="text-muted-foreground text-sm underline">
        &larr; {t.suggest.backTo} {place.name}
      </Link>

      <h1 className="text-2xl font-semibold">{t.suggest.editHeading}</h1>
      <p className="text-muted-foreground text-sm">{t.suggest.editDescription}</p>

      {isSignedIn ? <SuggestionForm place={place} /> : <p className="text-sm">{t.suggest.signInToEdit}</p>}
    </main>
  );
}
