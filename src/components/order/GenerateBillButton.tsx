import { FileDown, LoaderCircle } from 'lucide-react';

type Props = {
  loading: boolean;
  onClick: () => void;
};

export function GenerateBillButton({ loading, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6B4226] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8B5E3C] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? <LoaderCircle className="animate-spin" size={16} /> : <FileDown size={16} />}
      {loading ? 'Generating Invoice…' : 'Generate Bill'}
    </button>
  );
}
