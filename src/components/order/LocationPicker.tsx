import { useEffect, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import type { DeliveryLocation } from '@/types/order';
import { LocationPreview } from './LocationPreview';

// Simplified LocationPicker: no live geolocation, no maps.

type Props = {
  readonly value: DeliveryLocation;
  readonly onChange: (value: DeliveryLocation) => void;
};

// No map or geolocation helpers — this picker only captures an address string.

export function LocationPicker({ value, onChange }: Props) {
  const [address, setAddress] = useState(value.address || '');

  useEffect(() => {
    setAddress(value.address || '');
  }, [value.address]);

  const applyAddress = (nextAddress: string) => {
    const nextValue: DeliveryLocation = {
      address: nextAddress || 'Customer address provided in checkout',
      latitude: undefined as any,
      longitude: undefined as any,
      googleMapsUrl: undefined,
    };
    setAddress(nextAddress);
    onChange(nextValue);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm text-[#5A3822]">
        <span className="mb-1.5 block font-semibold">Delivery Address</span>
        <textarea rows={3} placeholder="House / Flat, Street, Area, City, State, Pincode" className="w-full rounded-2xl border border-[#E4D2B4] bg-[#FFFDF8] px-4 py-3 text-sm outline-none transition focus:border-[#A86E34] focus:ring-2 focus:ring-[#A86E34]/20" value={address} onChange={(e) => setAddress(e.target.value)} />
      </label>
      <div className="flex gap-2">
        <button onClick={() => applyAddress(address)} className="rounded-2xl bg-[#6B4226] px-4 py-2 text-sm font-semibold text-white">Save Address</button>
      </div>

      <LocationPreview address={address} latitude={value.latitude} longitude={value.longitude} googleMapsUrl={value.googleMapsUrl} />
    </div>
  );
}
