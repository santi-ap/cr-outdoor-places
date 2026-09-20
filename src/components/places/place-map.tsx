'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import type { Place } from '@/lib/validation/schemas';

// A pin matching the app's forest-green brand color instead of Leaflet's
// default blue marker (which also needed its image paths pointed at a CDN
// to render at all under our bundler).
const markerIcon = L.divIcon({
  className: '',
  html: `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z" fill="#3f6b4c"/>
    <circle cx="14" cy="14" r="5.5" fill="#f7f1e7"/>
  </svg>`,
  iconSize: [28, 38],
  iconAnchor: [14, 38],
  popupAnchor: [0, -34],
  tooltipAnchor: [0, -34],
});

const COSTA_RICA_CENTER: [number, number] = [9.7489, -83.7534];

// Below this zoom level, place names would overlap and clutter the map —
// permanent labels only switch on once you've zoomed in far enough that
// pins have room to breathe.
const LABEL_ZOOM_THRESHOLD = 11;

function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  useMapEvent('zoomend', (e) => onZoomChange(e.target.getZoom()));
  return null;
}

export function PlaceMap({
  places,
  center = COSTA_RICA_CENTER,
  zoom = 8,
}: {
  places: Place[];
  center?: [number, number];
  zoom?: number;
}) {
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const showLabels = currentZoom >= LABEL_ZOOM_THRESHOLD;

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
      <ZoomTracker onZoomChange={setCurrentZoom} />
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
          {showLabels && (
            <Tooltip permanent direction="top" className="place-map-label">
              {place.name}
            </Tooltip>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
