import { cn } from 'cn';

// Inline "you need to sign in" notice for pages whose whole purpose already
// requires an account (My List, suggest-a-place/suggest-edit) — unlike
// SignInRequiredDialog, which appears on demand when an action is attempted
// on a page that's otherwise browsable signed out (place detail). Both
// contexts share this one component so the message reads consistently;
// only the text should ever differ between callers.
export function SignInNotice({ message, className }: { message: string; className?: string }) {
  return (
    <div className={cn('border-line bg-sand rounded-2xl border px-3.5 py-2.5', className)}>
      <p className="text-ink-body text-[13px]">{message}</p>
    </div>
  );
}
