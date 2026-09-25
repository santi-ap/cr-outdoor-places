'use client';

import { useState } from 'react';
import { ShareIcon, CheckIcon } from 'lucide-react';
import { cn } from 'cn';
import { useLanguage } from '@/lib/i18n/language-context';

export function ShareButton({
  title,
  url,
  iconOnly,
  className,
}: {
  title: string;
  // Defaults to the current page's URL (place detail pages, which are the
  // page being shared). Callers sharing a URL other than the one they're
  // currently on — e.g. My List generating a separate /shared-list link —
  // pass it explicitly, absolute or relative (resolved against
  // window.location.origin here, at share time, so callers can build it
  // during SSR render without touching `window` themselves).
  url?: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = url ? new URL(url, window.location.origin).toString() : window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // User cancelled or the share sheet failed — nothing to recover.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — nothing more we can do.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? t.detail.linkCopied : t.detail.share}
      className={cn(
        'border-line bg-cream text-bark flex items-center justify-center gap-2 rounded-2xl border font-medium',
        iconOnly ? 'h-11 w-11 shrink-0' : 'px-3.5 py-2.5 text-[13px]',
        className,
      )}
    >
      {copied ? <CheckIcon className="text-forest size-4" /> : <ShareIcon className="size-4" />}
      {!iconOnly && (copied ? t.detail.linkCopied : t.detail.share)}
    </button>
  );
}
