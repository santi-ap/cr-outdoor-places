'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/lib/i18n/language-context';

export function AuthStatus({ layout = 'header' }: { layout?: 'header' | 'rail' }) {
  const { t } = useLanguage();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSendLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setErrorMessage(error.message);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return <div className="h-9 w-20" />;
  }

  if (user) {
    // 'rail' layout: no "My List" link — the nav rail already has its own
    // link to that route, so repeating it here would be redundant.
    if (layout === 'rail') {
      return (
        <div className="flex flex-col gap-2">
          <span className="text-ink-muted truncate text-xs">{user.email}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
            {t.header.signOut}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground hidden max-w-[180px] truncate text-sm sm:inline">
          {user.email}
        </span>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          {t.header.signOut}
        </Button>
      </div>
    );
  }

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) {
          setStatus('idle');
          setErrorMessage('');
        }
      }}
    >
      <PopoverTrigger
        render={<Button variant="outline" size="sm" className={layout === 'rail' ? 'w-full' : undefined} />}
      >
        {t.header.signIn}
      </PopoverTrigger>
      <PopoverContent align={layout === 'rail' ? 'start' : 'end'}>
        {status === 'sent' ? (
          <p className="p-1 text-sm">{t.auth.checkEmail}</p>
        ) : (
          <form onSubmit={handleSendLink} className="flex flex-col gap-2 p-1">
            <Label htmlFor="auth-email">{t.auth.email}</Label>
            <Input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.auth.emailPlaceholder}
            />
            <Button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? t.auth.sending : t.auth.sendMagicLink}
            </Button>
            {status === 'error' && <p className="text-destructive text-sm">{errorMessage}</p>}
          </form>
        )}
      </PopoverContent>
    </Popover>
  );
}
