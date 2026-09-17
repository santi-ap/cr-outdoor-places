'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { languages } from '@/lib/i18n/dictionary';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-line p-0.5 text-xs font-medium">
      {languages.map((lang) => (
        <button
          key={lang}
          type="button"
          aria-pressed={language === lang}
          onClick={() => setLanguage(lang)}
          className={
            'rounded-full px-2 py-1 uppercase transition-colors ' +
            (language === lang
              ? 'bg-forest text-cream'
              : 'text-ink-muted hover:text-bark')
          }
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
