import { Spinner } from '@/components/ui/spinner';

export default function PlaceDetailLoading() {
  return (
    <div className="bg-cream flex h-full items-center justify-center">
      <Spinner />
    </div>
  );
}
