import { Search } from 'lucide-react';
import type { LocationSearchSuggestion } from '@/types/location';

type Props = {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly suggestions: LocationSearchSuggestion[];
  readonly onSearch: () => void;
  readonly onSelectSuggestion: (suggestion: LocationSearchSuggestion) => void;
  readonly loading: boolean;
};

export function LocationSearch({ value, onChange, suggestions, onSearch, onSelectSuggestion, loading }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="flex-1 rounded-2xl border border-[#E4D2B4] bg-[#FFFDF8] px-4 py-3 text-sm">
          <span className="mb-1.5 block font-semibold text-[#5A3822]">Search Location</span>
          <div className="flex items-center gap-2">
            <Search size={16} className="text-[#A86E34]" />
            <input
              value={value}
              onChange={event => onChange(event.target.value)}
              onKeyDown={event => event.key === 'Enter' && onSearch()}
              className="w-full bg-transparent outline-none"
              placeholder="Try Pune Railway Station or Kothrud"
            />
          </div>
        </label>
        <button onClick={onSearch} className="rounded-2xl bg-[#6B4226] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8B5E3C]">
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="rounded-2xl border border-[#E4D2B4] bg-[#FFFDF8] p-2 shadow-sm">
          {suggestions.map(suggestion => (
            <button
              key={suggestion.place_id ?? suggestion.display_name}
              onClick={() => onSelectSuggestion(suggestion)}
              className="flex w-full items-start justify-between rounded-xl px-3 py-2 text-left text-sm text-[#5A3822] transition hover:bg-[#FFF3E8]"
            >
              <span>{suggestion.display_name}</span>
              <span className="text-xs text-[#A86E34]">Select</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
