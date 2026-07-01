import { jsPDF } from 'jspdf';
import { createRoot, Root } from 'react-dom/client';
import html2canvas from 'html2canvas';
import type { InvoiceData } from '@/types/order';
import { InvoiceTemplate } from '@/components/order/InvoiceTemplate';

function numberToWords(value: number) {
  const units = [
    'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (value < 20) return units[value];
  if (value < 100) {
    const ten = Math.floor(value / 10);
    const unit = value % 10;
    return `${tens[ten - 2]}${unit ? ` ${units[unit]}` : ''}`;
  }
  if (value < 1000) {
    const hundred = Math.floor(value / 100);
    const remainder = value % 100;
    return `${units[hundred]} Hundred${remainder ? ` ${numberToWords(remainder)}` : ''}`;
  }
  if (value < 100000) {
    const thousands = Math.floor(value / 1000);
    const remainder = value % 1000;
    return `${numberToWords(thousands)} Thousand${remainder ? ` ${numberToWords(remainder)}` : ''}`;
  }
  if (value < 10000000) {
    const lakhs = Math.floor(value / 100000);
    const remainder = value % 100000;
    return `${numberToWords(lakhs)} Lakh${remainder ? ` ${numberToWords(remainder)}` : ''}`;
  }
  const crores = Math.floor(value / 10000000);
  const remainder = value % 10000000;
  return `${numberToWords(crores)} Crore${remainder ? ` ${numberToWords(remainder)}` : ''}`;
}

async function waitForImages(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
  await Promise.all(
    images.map(img => {
      if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
      return new Promise<void>(resolve => {
        const cleanup = () => {
          img.onload = null;
          img.onerror = null;
          resolve();
        };
        img.onload = cleanup;
        img.onerror = cleanup;
      });
    })
  );
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Blob> {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '-9999px';
  wrapper.style.width = '1190px';
  wrapper.style.padding = '0';
  wrapper.style.margin = '0';
  wrapper.style.background = '#ffffff';
  wrapper.style.zIndex = '-1';
  wrapper.id = 'invoice-template-capture';
  document.body.appendChild(wrapper);

  const root: Root = createRoot(wrapper);
  root.render(<InvoiceTemplate data={data} amountInWords={`${numberToWords(data.grandTotal)} Only`} />);

  try {
    await waitForImages(wrapper);
    await new Promise(resolve => setTimeout(resolve, 300));

    const canvas = await html2canvas(wrapper, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = { width: pageWidth, height: (canvas.height * pageWidth) / canvas.width };

    let heightLeft = imgProps.height;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgProps.width, imgProps.height);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgProps.width, imgProps.height);
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  } finally {
    root.unmount();
    wrapper.remove();
  }
}
