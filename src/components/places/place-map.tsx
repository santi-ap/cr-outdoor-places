'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvent } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { XIcon } from 'lucide-react';
import { PlacePills } from './place-pills';
import {
  getDrawerHeightPx,
  getDrawerStateSnapshot,
  getServerDrawerStateSnapshot,
  subscribeDrawerState,
} from '@/lib/places/drawer-state';
import { useLanguage } from '@/lib/i18n/language-context';
import type { Place } from '@/lib/validation/schemas';

// Clearance between the preview panel and whatever's below it, so the
// panel never overlaps that content — just the fixed 12px inset from the
// screen edge when there's no drawer to clear.
const PANEL_BOTTOM_INSET_PX = 12;
// Extra breathing room between the panel and the drawer's own top edge,
// when there is one, so the two don't touch.
const PANEL_DRAWER_GAP_PX = 16;

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

// The selected pin (preview panel open) needs to be obviously the one —
// larger, with a clay accent ring, so it reads as "this one" at a glance
// rather than looking identical to every other pin on the map.
const selectedMarkerIcon = L.divIcon({
  className: '',
  html: `<svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2C9.716 2 3 8.716 3 17c0 12.5 15 27 15 27s15-14.5 15-27c0-8.284-6.716-15-15-15z" fill="#3f6b4c" stroke="#b98a63" stroke-width="3"/>
    <circle cx="18" cy="17" r="6.5" fill="#f7f1e7"/>
  </svg>`,
  iconSize: [36, 48],
  iconAnchor: [18, 48],
  popupAnchor: [0, -42],
  tooltipAnchor: [0, -42],
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
  hasDrawer = false,
  interactivePins = true,
}: {
  places: Place[];
  center?: [number, number];
  zoom?: number;
  // True only where a ListDrawer sits over this map (mobile Explore) — the
  // preview panel then keeps clear of the drawer's current top edge
  // instead of using a plain fixed inset, which only makes sense where
  // there's no drawer to avoid.
  hasDrawer?: boolean;
  // False for the place detail page's own small reference map — that map
  // only ever shows the one place it belongs to, so a name label and a
  // tap-to-preview panel for it would just be redundant with the page
  // it's already sitting on. True (the default) is for the main Explore
  // map, where both make sense.
  interactivePins?: boolean;
}) {
  const { t } = useLanguage();
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const showLabels = interactivePins && currentZoom >= LABEL_ZOOM_THRESHOLD;
  const selectedPlace = interactivePins ? (places.find((place) => place.id === selectedPlaceId) ?? null) : null;
  const mapRef = useRef<L.Map | null>(null);
  const drawerState = useSyncExternalStore(subscribeDrawerState, getDrawerStateSnapshot, getServerDrawerStateSnapshot);
  const drawerHeightPx = hasDrawer ? getDrawerHeightPx(drawerState) : 0;
  const panelBottomPx = Number.isFinite(drawerHeightPx)
    ? drawerHeightPx + (hasDrawer ? PANEL_DRAWER_GAP_PX : PANEL_BOTTOM_INSET_PX)
    : null;

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
              icon={place.id === selectedPlaceId ? selectedMarkerIcon : markerIcon}
              zIndexOffset={place.id === selectedPlaceId ? 1000 : 0}
              eventHandlers={
                interactivePins
                  ? { click: () => setSelectedPlaceId((current) => (current === place.id ? null : place.id)) }
                  : undefined
              }
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
          reliably shows above the drawer instead of hidden behind it.

          panelBottomPx keeps a real gap above the drawer's current top
          edge (not just a higher stacking order) — when hasDrawer and the
          drawer is fully expanded there's no map showing to preview
          over, so panelBottomPx is null and nothing renders. */}
      {selectedPlace &&
        panelBottomPx !== null &&
        createPortal(
          <div className="fixed inset-x-3 z-[2000]" style={{ bottom: panelBottomPx }}>
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
