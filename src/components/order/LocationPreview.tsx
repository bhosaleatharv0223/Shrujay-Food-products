import { ExternalLink, MapPin } from 'lucide-react';

type Props = {
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly googleMapsUrl: string;
};

export function LocationPreview({ address, latitude, longitude, googleMapsUrl }: Props) {
  return (
    <div className="rounded-2xl border border-[#E4D2B4] bg-[#FFF9F0] p-4 text-sm text-[#5A3822]">
      <div className="mb-2 flex items-center gap-2 font-semibold text-[#6B4226]">
        <MapPin size={16} /> Current Address
      </div>
      <p className="mb-3 leading-6">{address}</p>
      <div className="grid gap-2 text-xs sm:grid-cols-2">
        <div><span className="font-semibold">Latitude:</span> {latitude.toFixed(6)}</div>
        <div><span className="font-semibold">Longitude:</span> {longitude.toFixed(6)}</div>
      </div>
      <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#E4D2B4] px-3 py-2 text-[#6B4226] transition hover:bg-[#FFF3E8]">
        <ExternalLink size={14} /> Open Google Maps Link
      </a>
    </div>
  );
}
