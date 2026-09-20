'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvent } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { XIcon } from 'lucide-react';
import { PlacePills } from './place-pills';
import { useLanguage } from '@/lib/i18n/language-context';
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

// Groups of nearby pins collapse into one numbered bubble at low zoom so
// the map doesn't turn into a wall of overlapping markers — clicking a
// bubble zooms in (the library's default behavior) until it's close
// enough to split back into individual pins. Raw inline styles (not
// Tailwind classes) since this HTML string is handed to Leaflet outside
// React/Tailwind's own build-time class scanning.
function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  const size = count >= 25 ? 46 : count >= 10 ? 40 : 34;
  const fontSize = size >= 40 ? 14 : 13;
  return L.divIcon({
    html: `<div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:#3f6b4c;border:3px solid #f7f1e7;color:#f7f1e7;font-weight:600;font-size:${fontSize}px;font-family:inherit;box-shadow:0 2px 6px rgba(0,0,0,0.25);">${count}</div>`,
    className: '',
    iconSize: L.point(size, size, true),
  });
}

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
  const { t } = useLanguage();
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const showLabels = currentZoom >= LABEL_ZOOM_THRESHOLD;
  const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? null;
  const mapRef = useRef<L.Map | null>(null);

  // Next.js's client-side route cache can "reappear" this component's DOM
  // node on a back/forward navigation instead of a full unmount+remount,
  // but Leaflet stashes an internal id directly on the container element
  // and refuses to initialize a new map on a node that still has one —
  // "Map container is already initialized." Clearing it on unmount lets
  // a later reappear/remount succeed instead of throwing.
  useEffect(() => {
    const map = mapRef.current;
    return () => {
      const container = map?.getContainer() as (HTMLElement & { _leaflet_id?: number }) | undefined;
      if (container) container._leaflet_id = undefined;
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={mapRef}
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
        <MarkerClusterGroup iconCreateFunction={createClusterIcon} showCoverageOnHover={false} maxClusterRadius={60}>
          {places.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => setSelectedPlaceId((current) => (current === place.id ? null : place.id)),
              }}
            >
              {showLabels && (
                <Tooltip permanent direction="top" className="place-map-label">
                  {place.name}
                </Tooltip>
              )}
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* A tap on a pin previews it here — name + the same at-a-glance
          pills the list-view cards use — instead of jumping straight to
          the full detail page. Tapping the same pin again (or the close
          button) dismisses it.

          Portaled to document.body rather than rendered in place: the
          Explore drawer's own root has an inline `transform` style (for
          its drag animation), and `transform` always creates a new
          stacking context — that traps any z-index inside this
          component's own subtree no matter how high, since the drawer
          (a later sibling with its own stacking context) would still
          paint over it. A portal escapes that entirely, so the preview
          reliably shows above the drawer instead of hidden behind it. */}
      {selectedPlace &&
        createPortal(
          <div className="fixed inset-x-3 bottom-3 z-[2000]">
            <div className="rounded-card bg-rail relative overflow-hidden shadow-lg">
              <Link
                href={`/places/${selectedPlace.id}`}
                className="absolute inset-0 z-0"
                aria-label={selectedPlace.name}
              />
              <button
                type="button"
                aria-label={t.browse.closePreview}
                onClick={() => setSelectedPlaceId(null)}
                className="bg-cream text-bark absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-sm"
              >
                <XIcon className="size-3.5" />
              </button>
              <div className="pointer-events-none flex flex-col gap-1.5 p-3.5 pr-10">
                <span className="text-bark font-display text-base leading-snug font-medium text-wrap-pretty">
                  {selectedPlace.name}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <PlacePills place={selectedPlace} size="sm" />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
