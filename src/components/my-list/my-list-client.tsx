'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toggleListItemStatus, removeListItem } from '@/app/actions/my-list';
import type { Place } from '@/lib/validation/schemas';

export type ListItemWithPlace = {
  id: string;
  status: 'saved' | 'visited';
  place: Place;
};

export function MyListClient({ items: initialItems }: { items: ListItemWithPlace[] }) {
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

  return (
    <div className="flex flex-col gap-6">
      <ListSection
        title="Saved"
        items={saved}
        isPending={isPending}
        toggleLabel="Mark visited"
        onToggle={handleToggle}
        onRemove={handleRemove}
      />
      <ListSection
        title="Visited"
        items={visited}
        isPending={isPending}
        toggleLabel="Mark saved"
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
  return (
    <section>
      <h2 className="mb-2 text-lg font-medium">
        {title} ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
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
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
