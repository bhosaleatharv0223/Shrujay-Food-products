import { MessageCircleMore } from 'lucide-react';

type Props = {
  readonly loading: boolean;
  readonly disabled?: boolean;
  readonly onClick: () => void;
};

export function ContinueWhatsAppButton({ loading, disabled = false, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[#5C3612] bg-[#5C3612] px-5 py-4 text-base font-bold text-white shadow-md transition hover:bg-[#7A4D20] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5C3612]/25 disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-16 sm:py-5 sm:text-lg"
    >
      <MessageCircleMore size={20} />
      {loading ? 'Opening WhatsApp…' : 'Order Now'}
    </button>
  );
}
