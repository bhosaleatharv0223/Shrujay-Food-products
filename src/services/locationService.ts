import type { LocationLookupResult, LocationSearchSuggestion } from '@/types/location';

const DEFAULT_LOCATION = {
  address: 'Pune, Maharashtra, India',
  latitude: 18.52043,
  longitude: 73.856743,
};

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

function buildGoogleMapsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

export async function reverseGeocodeLocation(latitude: number, longitude: number): Promise<LocationLookupResult> {
  const response = await fetch(
    `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
    {
      headers: {
        'Accept-Language': 'en',
      },
    },
  );

  if (!response.ok) {
    throw new Error('Unable to retrieve the address for the selected location.');
  }

  const data = await response.json();
  return {
    address: data.display_name || DEFAULT_LOCATION.address,
    latitude,
    longitude,
    googleMapsUrl: buildGoogleMapsUrl(latitude, longitude),
  };
}

export async function searchLocations(query: string): Promise<LocationSearchSuggestion[]> {
  if (!query.trim()) return [];

  const response = await fetch(
    `${NOMINATIM_BASE}/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`,
    {
      headers: {
        'Accept-Language': 'en',
      },
    },
  );

  if (!response.ok) {
    throw new Error('Unable to search locations right now.');
  }

  return (await response.json()) as LocationSearchSuggestion[];
}

export function getDefaultLocation(): LocationLookupResult {
  return {
    ...DEFAULT_LOCATION,
    googleMapsUrl: buildGoogleMapsUrl(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude),
  };
}
