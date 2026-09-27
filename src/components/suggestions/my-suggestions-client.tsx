'use client';

import Link from 'next/link';
import { BackButton } from '@/components/ui/back-button';
import { TierBadge, type Tier } from '@/components/ui/tier-badge';
import { SignInNotice } from '@/components/auth/sign-in-notice';
import { useLanguage } from '@/lib/i18n/language-context';
import type { PlaceSuggestionStatus } from '@/lib/validation/schemas';

export type SuggestionWithPlace = {
  id: string;
  place_id: string | null;
  changes: Record<string, unknown>;
  status: PlaceSuggestionStatus;
  created_at: string;
  place: { id: string; name: string } | null;
};

const STATUS_TIER: Record<PlaceSuggestionStatus, Tier> = {
  pending: 'moderado',
  approved: 'facil',
  rejected: 'dificil',
};

export function MySuggestionsClient({
  suggestions,
  isSignedIn,
}: {
  suggestions: SuggestionWithPlace[];
  isSignedIn: boolean;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4">
      <BackButton
        href="/suggest-place"
        label={t.mySuggestions.backToSuggest}
        ariaLabel={t.mySuggestions.backToSuggest}
        className="sticky top-4 z-20 self-start"
      />

      <h1 className="text-xl font-semibold">{t.mySuggestions.heading}</h1>

      {!isSignedIn ? (
        <SignInNotice message={t.suggest.signInToSuggest} />
      ) : suggestions.length === 0 ? (
        <p className="text-muted-foreground text-[13px]">{t.mySuggestions.empty}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {suggestions.map((suggestion) => (
            <SuggestionRow key={suggestion.id} suggestion={suggestion} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SuggestionRow({ suggestion }: { suggestion: SuggestionWithPlace }) {
  const { t, language } = useLanguage();
  const isNewPlace = suggestion.place_id === null;
  const suggestedName =
    typeof suggestion.changes.name === 'string' ? suggestion.changes.name : null;
  const name = isNewPlace
    ? (suggestedName ?? t.mySuggestions.untitled)
    : (suggestion.place?.name ?? t.mySuggestions.untitled);
  const statusLabel = {
    pending: t.mySuggestions.statusPending,
    approved: t.mySuggestions.statusApproved,
    rejected: t.mySuggestions.statusRejected,
  }[suggestion.status];
  const submittedDate = new Date(suggestion.created_at).toLocaleDateString(
    language === 'es' ? 'es-CR' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' },
  );

  const content = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <TierBadge
          label={isNewPlace ? t.mySuggestions.newPlaceLabel : t.mySuggestions.editLabel}
          tier="neutral"
        />
        <TierBadge label={statusLabel} tier={STATUS_TIER[suggestion.status]} />
      </div>
      <span className="font-medium">{name}</span>
      <span className="text-muted-foreground text-[12px]">
        {t.mySuggestions.submittedOn} {submittedDate}
      </span>
    </div>
  );

  return (
    <li className="rounded-md border p-2.5">
      {!isNewPlace && suggestion.place ? (
        <Link href={`/places/${suggestion.place.id}`} className="block hover:underline">
          {content}
        </Link>
      ) : (
        content
      )}
    </li>
  );
}
