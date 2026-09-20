'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SignInNotice } from '@/components/auth/sign-in-notice';
import { toggleListItemStatus, removeListItem } from '@/app/actions/my-list';
import { useLanguage } from '@/lib/i18n/language-context';
import type { Place } from '@/lib/validation/schemas';

export type ListItemWithPlace = {
  id: string;
  status: 'saved' | 'visited';
  place: Place;
};

export function MyListClient({
  items: initialItems,
  isSignedIn,
}: {
  items: ListItemWithPlace[];
  isSignedIn: boolean;
}) {
  const { t } = useLanguage();
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  const saved = items.filter((item) => item.status === 'saved');
  const visited = items.filter((item) => item.status === 'visited');

  function handleToggle(item: ListItemWithPlace) {
    const newStatus = item.status === 'saved' ? 'visited' : 'saved';
    startTransition(async () => {
      const result = await toggleListItemStatus(item.id, newStatus);
      if (result.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)),
        );
      }
    });
  }

  function handleRemove(item: ListItemWithPlace) {
    startTransition(async () => {
      const result = await removeListItem(item.id);
      if (result.success) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      }
    });
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-xl font-semibold">{t.header.myList}</h1>
        <ListSection title={t.myList.saved} items={[]} isPending={false} toggleLabel="" onToggle={() => {}} onRemove={() => {}} />
        <ListSection title={t.myList.visited} items={[]} isPending={false} toggleLabel="" onToggle={() => {}} onRemove={() => {}} />
        <SignInNotice message={t.placeActions.signInPrompt} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold">{t.header.myList}</h1>
      <ListSection
        title={t.myList.saved}
        items={saved}
        isPending={isPending}
        toggleLabel={t.myList.markVisited}
        onToggle={handleToggle}
        onRemove={handleRemove}
      />
      <ListSection
        title={t.myList.visited}
        items={visited}
        isPending={isPending}
        toggleLabel={t.myList.markSaved}
        onToggle={handleToggle}
        onRemove={handleRemove}
      />
    </div>
  );
}

function ListSection({
  title,
  items,
  isPending,
  toggleLabel,
  onToggle,
  onRemove,
}: {
  title: string;
  items: ListItemWithPlace[];
  isPending: boolean;
  toggleLabel: string;
  onToggle: (item: ListItemWithPlace) => void;
  onRemove: (item: ListItemWithPlace) => void;
}) {
  const { t } = useLanguage();
  return (
    <section>
      <h2 className="mb-1.5 text-base font-medium">
        {title} ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">{t.myList.empty}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-md border p-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link href={`/places/${item.place.id}`} className="font-medium hover:underline">
                {item.place.name}
              </Link>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => onToggle(item)}
                >
                  {toggleLabel}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => onRemove(item)}
                >
                  {t.myList.remove}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
