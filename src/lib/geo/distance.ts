// Straight-line ("as the crow flies") distance, not drive time — a plain
// client-side Haversine calculation needs no API/key. Drive time would
// need a routing service (Google Directions, OSRM, ...) and is deferred
// per Issue #82's own note that it can wait if it's meaningfully more
// complex than distance alone.
const EARTH_RADIUS_M = 6_371_000;

export function haversineDistanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}
