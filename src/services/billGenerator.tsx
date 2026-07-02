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
    return tens[ten - 2] + (unit ? ' ' + units[unit] : '');
  }
  if (value < 1000) {
    const hundred = Math.floor(value / 100);
    const remainder = value % 100;
    return units[hundred] + ' Hundred' + (remainder ? ' ' + numberToWords(remainder) : '');
  }
  if (value < 100000) {
    const thousands = Math.floor(value / 1000);
    const remainder = value % 1000;
    return numberToWords(thousands) + ' Thousand' + (remainder ? ' ' + numberToWords(remainder) : '');
  }
  if (value < 10000000) {
    const lakhs = Math.floor(value / 100000);
    const remainder = value % 100000;
    return numberToWords(lakhs) + ' Lakh' + (remainder ? ' ' + numberToWords(remainder) : '');
  }
  const crores = Math.floor(value / 10000000);
  const remainder = value % 10000000;
  return numberToWords(crores) + ' Crore' + (remainder ? ' ' + numberToWords(remainder) : '');
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

async function createImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (!src.startsWith('data:')) {
      image.crossOrigin = 'anonymous';
    }
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image for PDF thumbnail: ${src}`));
    image.src = src;
  });
}

async function createThumbnailDataUrl(src: string, maxDimension = 100, quality = 0.7): Promise<string> {
  try {
    const image = await createImageElement(src);
    const scale = Math.min(maxDimension / image.width, maxDimension / image.height, 1);
    const width = Math.round(image.width * scale);
    const height = Math.round(image.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to create canvas context for invoice thumbnails.');
    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  } catch (error) {
    console.warn('[Invoice] Thumbnail resize failed, using original image:', error);
    return src;
  }
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

  const dataWithThumbnails: InvoiceData = {
    ...data,
    items: await Promise.all(
      data.items.map(async item => ({
        ...item,
        image: await createThumbnailDataUrl(item.image, 100, 0.7),
      }))
    ),
  };

  const root: Root = createRoot(wrapper);
  root.render(<InvoiceTemplate data={dataWithThumbnails} amountInWords={`${numberToWords(data.grandTotal)} Only`} />);

  try {
    await waitForImages(wrapper);
    await new Promise(resolve => setTimeout(resolve, 300));

    const canvas = await html2canvas(wrapper, {
      scale: 1.5,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.7);
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = { width: pageWidth, height: (canvas.height * pageWidth) / canvas.width };

    let heightLeft = imgProps.height;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgProps.width, imgProps.height, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgProps.width, imgProps.height, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  } finally {
    root.unmount();
    wrapper.remove();
  }
}
