import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { categoryLabels, costTypeLabels, difficultyLabels } from '@/lib/places/labels';
import type { Place } from '@/lib/validation/schemas';

export function PlaceCard({ place }: { place: Place }) {
  return (
    <Link href={`/places/${place.id}`}>
      <Card className="hover:bg-accent/50 transition-colors">
        <CardHeader>
          <CardTitle className="text-base">{place.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground flex flex-wrap gap-2 text-sm">
          <Badge variant="secondary">{categoryLabels[place.category] ?? place.category}</Badge>
          {place.difficulty && (
            <Badge variant="outline">{difficultyLabels[place.difficulty]}</Badge>
          )}
          <Badge variant="outline">{costTypeLabels[place.cost_type]}</Badge>
          {place.province && <span className="self-center">{place.province}</span>}
        </CardContent>
      </Card>
    </Link>
  );
}
