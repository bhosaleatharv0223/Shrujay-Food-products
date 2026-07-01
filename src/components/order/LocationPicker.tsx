import { useEffect, useMemo, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DeliveryLocation } from '@/types/order';
import type { LocationSearchSuggestion } from '@/types/location';
import { getDefaultLocation, reverseGeocodeLocation, searchLocations } from '@/services/locationService';
import { LocationPreview } from './LocationPreview';
import { LocationSearch } from './LocationSearch';

type Props = {
  readonly value: DeliveryLocation;
  readonly onChange: (value: DeliveryLocation) => void;
};

type Position = [number, number];

type Status = 'idle' | 'loading' | 'success' | 'error';

const markerIcon = L.divIcon({
  html: '<div style="font-size: 24px; color: #6B4226;">📍</div>',
  className: 'bg-transparent border-0',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

function MapController({ position, zoom }: { position: Position; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, zoom, { duration: 1.1 });
  }, [map, position, zoom]);

  return null;
}

function MapEvents({ onSelect }: { onSelect: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export function LocationPicker({ value, onChange }: Props) {
  const defaultLocation = useMemo(() => getDefaultLocation(), []);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSearchSuggestion[]>([]);
  const [position, setPosition] = useState<Position>([
    value.latitude || defaultLocation.latitude,
    value.longitude || defaultLocation.longitude,
  ]);
  const [address, setAddress] = useState(value.address || defaultLocation.address);
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('Select a delivery point on the map or search for a landmark.');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const nextPosition: Position = [value.latitude || defaultLocation.latitude, value.longitude || defaultLocation.longitude];
    setPosition(nextPosition);
    setAddress(value.address || defaultLocation.address);
  }, [defaultLocation.address, defaultLocation.latitude, defaultLocation.longitude, value.address, value.latitude, value.longitude]);

  const commitLocation = (latitude: number, longitude: number, nextAddress: string, googleMapsUrl: string) => {
    const nextValue: DeliveryLocation = {
      address: nextAddress,
      latitude,
      longitude,
      googleMapsUrl,
    };

    setPosition([latitude, longitude]);
    setAddress(nextAddress);
    onChange(nextValue);
  };

  const applyLocation = async (latitude: number, longitude: number, fallbackAddress: string, shouldGeocode = true) => {
    setStatus('loading');
    setFeedback('Resolving your selected location…');

    try {
      if (!shouldGeocode) {
        const nextAddress = fallbackAddress || 'Selected location';
        commitLocation(latitude, longitude, nextAddress, `https://www.google.com/maps?q=${latitude},${longitude}`);
        setStatus('success');
        setFeedback('Location updated successfully.');
        return;
      }

      const lookup = await reverseGeocodeLocation(latitude, longitude);
      commitLocation(latitude, longitude, lookup.address, lookup.googleMapsUrl);
      setStatus('success');
      setFeedback('Location updated successfully.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to resolve the address.';
      commitLocation(latitude, longitude, fallbackAddress || 'Selected location', `https://www.google.com/maps?q=${latitude},${longitude}`);
      setStatus('error');
      setFeedback(errorMessage);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      setSuggestions([]);
      setStatus('error');
      setFeedback('Enter a place name such as Pune Railway Station or Kothrud.');
      return;
    }

    setIsSearching(true);
    setStatus('loading');
    setFeedback('Searching OpenStreetMap for nearby matches…');

    try {
      const results = await searchLocations(search);
      setSuggestions(results);
      if (results.length) {
        setStatus('success');
        setFeedback(`Showing ${results.length} location suggestions.`);
      } else {
        setStatus('error');
        setFeedback('No matching locations were found.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to search locations right now.';
      setStatus('error');
      setFeedback(message);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (suggestion: LocationSearchSuggestion) => {
    setSearch(suggestion.display_name);
    setSuggestions([]);
    void applyLocation(Number(suggestion.lat), Number(suggestion.lon), suggestion.display_name, false);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      setFeedback('Geolocation is not available on this device.');
      return;
    }

    setStatus('loading');
    setFeedback('Acquiring your current location…');
    navigator.geolocation.getCurrentPosition(
      position => {
        void applyLocation(position.coords.latitude, position.coords.longitude, 'Current GPS location', true);
      },
      error => {
        let message = 'Unable to access your current location.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission was denied. Please allow GPS access to continue.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable right now.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out. Please try again.';
        }
        setStatus('error');
        setFeedback(message);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-4">
      <LocationSearch
        value={search}
        onChange={setSearch}
        suggestions={suggestions}
        onSearch={handleSearch}
        onSelectSuggestion={handleSelectSuggestion}
        loading={isSearching}
      />

      <button onClick={handleCurrentLocation} className="flex items-center justify-center gap-2 rounded-2xl border border-[#6B4226] bg-[#FFF3E8] px-4 py-3 text-sm font-semibold text-[#6B4226] transition hover:bg-[#FBE7D1]">
        <Navigation size={15} /> Use My Current Location
      </button>

      <div className="overflow-hidden rounded-[24px] border border-[#E4D2B4] bg-[#FFFDF8] p-3">
        <MapContainer center={position} zoom={13} scrollWheelZoom className="h-[240px] w-full rounded-[20px] sm:h-[320px]">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapController position={position} zoom={13} />
          <MapEvents onSelect={(latitude, longitude) => { void applyLocation(latitude, longitude, 'Selected location'); }} />
          <Marker position={position} draggable icon={markerIcon} eventHandlers={{ dragend: event => { const target = event.target as L.Marker; const { lat, lng } = target.getLatLng(); void applyLocation(lat, lng, 'Moved marker'); } }} />
        </MapContainer>
      </div>

      <div className={`rounded-2xl border p-4 text-sm ${status === 'error' ? 'border-[#E9B8B8] bg-[#FFF0F0] text-[#B33A3A]' : 'border-[#E4D2B4] bg-[#FFF9F0] text-[#5A3822]'}`}>
        <div className="mb-2 flex items-center gap-2 font-semibold text-[#6B4226]">
          <MapPin size={16} /> {status === 'loading' ? 'Loading location…' : 'Location Status'}
        </div>
        <p>{feedback}</p>
      </div>

      <LocationPreview address={address} latitude={value.latitude} longitude={value.longitude} googleMapsUrl={value.googleMapsUrl || `https://www.google.com/maps?q=${value.latitude},${value.longitude}`} />
    </div>
  );
}
