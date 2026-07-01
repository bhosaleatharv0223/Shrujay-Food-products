export type LocationSearchSuggestion = {
  place_id?: string;
  display_name: string;
  lat: string;
  lon: string;
};

export type LocationLookupResult = {
  address: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
};

export type LocationStatus = 'idle' | 'loading' | 'success' | 'error';
