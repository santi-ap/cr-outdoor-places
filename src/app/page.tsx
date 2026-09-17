import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">CR Outdoor Places</h1>
      <p className="text-muted-foreground max-w-md">
        Scaffold in progress — the map/list browse view lands in a later issue.
      </p>
      <Button>Get started</Button>
    </main>
  );
}
