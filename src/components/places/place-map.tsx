'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import type { Place } from '@/lib/validation/schemas';

// The default Leaflet marker icon references image paths that bundlers
// don't resolve correctly — point it at the CDN copy instead.
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const COSTA_RICA_CENTER: [number, number] = [9.7489, -83.7534];

export function PlaceMap({
  places,
  center = COSTA_RICA_CENTER,
  zoom = 8,
}: {
  places: Place[];
  center?: [number, number];
  zoom?: number;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      // isolate traps Leaflet's internal z-index:1000 control layer inside
      // this stacking context so it can't render above fixed-position UI
      // elsewhere on the page (e.g. the filters Sheet).
      className="isolate h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places.map((place) => (
        <Marker key={place.id} position={[place.lat, place.lng]} icon={markerIcon}>
          <Popup>
            <Link href={`/places/${place.id}`} className="font-medium underline">
              {place.name}
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
