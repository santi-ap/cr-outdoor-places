// Plain lat/lng rectangle, kept independent of Leaflet's own LatLngBounds
// type so callers (BrowseView) don't need to import the Leaflet-specific
// type just to filter a places array by it.
export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export function isWithinBounds(place: { lat: number; lng: number }, bounds: MapBounds): boolean {
  return (
    place.lat >= bounds.south &&
    place.lat <= bounds.north &&
    place.lng >= bounds.west &&
    place.lng <= bounds.east
  );
}
