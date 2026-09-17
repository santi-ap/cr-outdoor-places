import Link from 'next/link';
import { AuthStatus } from '@/components/auth/auth-status';

export function SiteHeader() {
  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b p-3">
      <Link href="/" className="text-lg font-semibold">
        CR Outdoor Places
      </Link>
      <AuthStatus />
    </header>
  );
}
