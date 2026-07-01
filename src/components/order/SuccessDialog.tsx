import { CheckCircle2 } from 'lucide-react';

type Props = {
  title: string;
  message: string;
};

export function SuccessDialog({ title, message }: Props) {
  return (
    <div className="rounded-[24px] border border-[#D8E7D0] bg-[#F4F9EE] p-5 text-[#2F5A2D] shadow-sm">
      <div className="flex items-start gap-3">
        <CheckCircle2 size={20} className="mt-0.5" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}
