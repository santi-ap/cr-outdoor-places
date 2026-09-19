'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useLanguage } from '@/lib/i18n/language-context';

// Shown on demand when a signed-out visitor attempts an action that needs
// an account (save, mark visited, suggest a place/edit) — not as a
// persistent banner. A bottom sheet reads fine at any width for a message
// this short, so there's no separate desktop variant.
export function SignInRequiredDialog({
  open,
  onOpenChange,
  message,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
}) {
  const { t } = useLanguage();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-sheet border-line bg-cream sm:inset-x-auto sm:right-1/2 sm:bottom-6 sm:w-full sm:max-w-sm sm:translate-x-1/2 sm:rounded-2xl sm:border"
      >
        <SheetHeader>
          <SheetTitle className="font-display text-xl font-medium">{t.auth.signInRequiredTitle}</SheetTitle>
          <SheetDescription className="text-ink-body text-sm">{message}</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
