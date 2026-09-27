// Best-effort province/canton lookup from a pinned lat/lng, so the
// suggestion form's map picker (#73) can spare a suggester from typing
// coordinates and administrative divisions they likely don't know by
// heart. Uses OpenStreetMap's free Nominatim reverse-geocoding endpoint —
// no API key, matching the OSM tiles the app's own maps already use.
//
// OSM's tagging for Costa Rica isn't fully consistent between locations
// (see the two field names tried for canton below), so this is a starting
// point for the form's Provincia/Cantón fields, not an authoritative
// answer — they stay editable so a suggester can correct it.
export type ReverseGeocodeResult = {
  province: string | null;
  canton: string | null;
};

type NominatimAddress = {
  state?: string;
  county?: string;
  city_district?: string;
  town?: string;
  municipality?: string;
};

export async function reverseGeocode(
  lat: number,
  lng: number,
  language: 'es' | 'en',
): Promise<ReverseGeocodeResult> {
  // Without accept-language, Nominatim falls back to the browser's own
  // Accept-Language header, which produced English admin-boundary names
  // ("Puntarenas Province") even on the Spanish-default UI — pin it to
  // whichever language the form itself is in instead.
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=${language}`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Reverse geocode failed: ${response.status}`);

  const data: { address?: NominatimAddress } = await response.json();
  const address = data.address ?? {};

  return {
    province: address.state ?? null,
    canton: address.county ?? address.city_district ?? address.town ?? address.municipality ?? null,
  };
}
