'use client';

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import { dictionaries, languages, type Dictionary, type Language } from './dictionary';

const STORAGE_KEY = 'lugares-cr-language';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function getSnapshot(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && languages.includes(stored as Language) ? (stored as Language) : 'es';
  } catch {
    return 'es';
  }
}

// Server (and first client paint, before hydration) always renders 'es' —
// no SSR/client mismatch; the real persisted value takes over right after.
function getServerSnapshot(): Language {
  return 'es';
}

function setStoredLanguage(next: Language) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Best-effort persistence only.
  }
  for (const listener of listeners) listener();
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: setStoredLanguage, t: dictionaries[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
