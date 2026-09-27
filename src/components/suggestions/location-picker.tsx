'use client';

import { MapContainer, TileLayer, Marker, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '@/lib/i18n/language-context';

// Same pin style as the main Explore map (place-map.tsx) — duplicated
// rather than imported since it's a small, self-contained constant and
// this component has otherwise no dependency on that file.
const markerIcon = L.divIcon({
  className: '',
  html: `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z" fill="#3f6b4c"/>
    <circle cx="14" cy="14" r="5.5" fill="#f7f1e7"/>
  </svg>`,
  iconSize: [28, 38],
  iconAnchor: [14, 38],
});

const COSTA_RICA_CENTER: [number, number] = [9.7489, -83.7534];
const DEFAULT_ZOOM = 8;
const PINNED_ZOOM = 13;

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvent('click', (e) => onPick(e.latlng.lat, e.latlng.lng));
  return null;
}

// Lets a suggester drop/drag a pin instead of typing coordinates they
// almost certainly don't know (#73) — the map itself is the source of
// truth for lat/lng; province/canton get auto-filled from it separately
// (see reverse-geocode.ts) but stay editable in case that guess is off.
export function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const { t } = useLanguage();
  const hasPin = lat != null && lng != null;
  const initialPosition: [number, number] = hasPin ? [lat, lng] : COSTA_RICA_CENTER;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="rounded-card border-line h-[240px] w-full overflow-hidden border">
        <MapContainer
          center={initialPosition}
          zoom={hasPin ? PINNED_ZOOM : DEFAULT_ZOOM}
          className="isolate h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={onChange} />
          {hasPin && (
            <Marker
              position={[lat, lng]}
              icon={markerIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const position = (e.target as L.Marker).getLatLng();
                  onChange(position.lat, position.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>
      <p className="text-ink-muted text-[12px]">
        {hasPin
          ? `${t.suggest.locationPicked} ${lat.toFixed(4)}, ${lng.toFixed(4)}`
          : t.suggest.locationHint}
      </p>
    </div>
  );
}
