'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

// A fast, client-only "is there a session right now" signal — reads from
// local storage via getSession() rather than getUser(), which calls out
// to the Supabase Auth server to verify the token. Used only to skip an
// unnecessary network round trip before showing the sign-in dialog on an
// action that's clearly going to fail while signed out; the server
// actions themselves still verify with getUser() before making any
// change, so this is a UX shortcut, not the security boundary.
export function useIsSignedIn(): boolean | null {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      setIsSignedIn(!!data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return isSignedIn;
}
