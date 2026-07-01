import { MessageCircleMore } from 'lucide-react';

type Props = {
  readonly loading: boolean;
  readonly disabled?: boolean;
  readonly onClick: () => void;
};

export function ContinueWhatsAppButton({ loading, disabled = false, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#5C3612] bg-[#5C3612] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#7A4D20] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <MessageCircleMore size={16} />
      {loading ? 'Opening WhatsApp…' : 'Order Now'}
    </button>
  );
}
