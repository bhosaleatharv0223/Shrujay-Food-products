import { LoaderCircle } from 'lucide-react';

type Props = {
  title: string;
  subtitle: string;
};

export function LoadingScreen({ title, subtitle }: Props) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-[24px] border border-[#E4D2B4] bg-[#FFF9F0] p-6 text-center">
      <div className="space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#6B4226]/10 text-[#6B4226]">
          <LoaderCircle className="h-7 w-7 animate-spin" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#6B4226]">{title}</h3>
          <p className="mt-1 text-sm text-[#6D4C41]">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
