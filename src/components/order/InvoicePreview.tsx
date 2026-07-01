import { Download, ExternalLink } from 'lucide-react';
import type { InvoiceData } from '@/types/order';

type Props = {
  invoice: InvoiceData;
  onDownload: () => void;
};

export function InvoicePreview({ invoice, onDownload }: Props) {
  return (
    <div className="rounded-[28px] border border-[#E4D2B4] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#6B4226]">Invoice Preview</h3>
          <p className="text-sm text-[#6D4C41]">Bill generated successfully and ready to share.</p>
        </div>
        <button onClick={onDownload} className="flex items-center gap-2 rounded-2xl bg-[#6B4226] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8B5E3C]">
          <Download size={16} /> Download
        </button>
      </div>

      <div className="rounded-[24px] border border-[#E4D2B4] bg-[#FFF9F0] p-4 text-sm text-[#5A3822]">
        <div className="mb-3 flex items-center justify-between border-b border-[#E4D2B4] pb-3">
          <div>
            <p className="font-semibold text-[#6B4226]">Invoice #{invoice.invoiceNumber}</p>
            <p className="text-xs">Issued {invoice.issuedAt}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{invoice.customer.fullName}</p>
            <p className="text-xs">{invoice.customer.mobile}</p>
          </div>
        </div>
        <p className="mb-2 font-semibold text-[#6B4226]">Cloudinary Invoice</p>
        <a href={invoice.cloudinaryUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B5E3C]">
          <ExternalLink size={14} /> Open Cloudinary Invoice
        </a>
      </div>
    </div>
  );
}
