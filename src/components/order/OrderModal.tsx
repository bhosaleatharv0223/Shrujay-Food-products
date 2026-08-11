import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Package, Truck, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CustomerForm } from './CustomerForm';
import { GenerateBillButton } from './GenerateBillButton';
import { InvoicePreview } from './InvoicePreview';
import { ContinueWhatsAppButton } from './ContinueWhatsAppButton';
import { LoadingScreen } from './LoadingScreen';
import { SuccessDialog } from './SuccessDialog';
import { generateInvoicePdf } from '@/services/billGenerator';
import { uploadInvoiceToCloudinary, validatePdf, verifyCloudinaryPdf } from '@/services/cloudinary';
import { buildWhatsAppUrl } from '@/services/whatsapp';
import type { CustomerDetails, DeliveryMethod, InvoiceData, OrderItem } from '@/types/order';
import { calculateLineTotal, formatCurrency } from '@/utils/pricing';

type Props = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly items: OrderItem[];
};

const defaultCustomer: CustomerDetails = {
  fullName: '',
  mobile: '',
  email: '',
  houseNumber: '',
  street: '',
  area: '',
  city: '',
  state: '',
  pincode: '',
  instructions: '',
};

const buildDeliveryAddress = (customer: CustomerDetails): string => {
  const address = [customer.houseNumber, customer.street, customer.area, customer.city, customer.state, customer.pincode]
    .filter(Boolean)
    .join(', ');

  return address || 'Customer address provided in checkout';
};

const getCourierRatePerKg = (isPuneDelivery: boolean) => isPuneDelivery ? 30 : 40;
const calculateCourierCharge = (totalWeightKg: number, isPuneDelivery: boolean) => totalWeightKg * getCourierRatePerKg(isPuneDelivery);

export function OrderModal({ open, onClose, items }: Props) {
  const [step, setStep] = useState<'customer' | 'method' | 'review' | 'confirmed'>('customer');
  const [customer, setCustomer] = useState<CustomerDetails>(defaultCustomer);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('courier');
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isWhatsAppLoading, setIsWhatsAppLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + calculateLineTotal(item.price, item.quantity), 0),
    [items],
  );
  const totalWeightKg = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const deliveryAddress = useMemo(() => buildDeliveryAddress(customer), [customer]);
  const isPuneDelivery = customer.city.trim().toLowerCase().includes('pune') || customer.pincode.trim().startsWith('411');
  const courierRatePerKg = getCourierRatePerKg(isPuneDelivery);
  const deliveryCharges = subtotal > 0 && deliveryMethod === 'courier' ? calculateCourierCharge(totalWeightKg, isPuneDelivery) : 0;
  const discount = 0;
  const grandTotal = subtotal + deliveryCharges - discount;

  const handleCustomerSubmit = (values: CustomerDetails) => {
    setCustomer(values);
    setStep('method');
  };

  const handleGenerateBill = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      const invoiceNumber = `INV-${Date.now()}`;
      const invoiceData: InvoiceData = {
        invoiceNumber,
        orderNumber: `${Date.now()}`,
        paymentMode: 'Cash on Delivery',
        issuedAt: new Date().toLocaleDateString(),
        customer,
        delivery: deliveryAddress,
        deliveryMethod,
        items,
        subtotal,
        deliveryCharges,
        discount,
        grandTotal,
      };

      let pdfBlob = await generateInvoicePdf(invoiceData);
      let file = new File([pdfBlob], `${invoiceNumber}.pdf`, { type: 'application/pdf' });

      const fileSizeMb = Number((pdfBlob.size / 1024 / 1024).toFixed(2));
      console.log(`[Invoice] Final PDF size: ${fileSizeMb.toFixed(2)} MB`);
      if (pdfBlob.size > 9 * 1024 * 1024) {
        throw new Error('Invoice file is too large. Please contact support.');
      }

      if (!validatePdf(file)) {
        console.warn('[Cloudinary] Generated PDF failed validation, regenerating.');
        pdfBlob = await generateInvoicePdf(invoiceData);
        file = new File([pdfBlob], `${invoiceNumber}.pdf`, { type: 'application/pdf' });
      }

      setIsUploading(true);
      setUploadProgress(0);
      const uploadResponse = await uploadInvoiceToCloudinary(file);
      setUploadProgress(100);
      const cloudinaryUrl = uploadResponse.secure_url;
      setInvoice({ ...invoiceData, cloudinaryUrl });
      setStep('confirmed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsGenerating(false);
      setIsUploading(false);
    }
  };

  const handleWhatsApp = () => {
    setIsWhatsAppLoading(true);
    const message = [
      '━━━━━━━━━━━━━━',
      'New Order',
      `Customer Name: ${customer.fullName}`,
      `Phone Number: ${customer.mobile}`,
      `Address: ${[customer.houseNumber, customer.street, customer.area, customer.city, customer.state, customer.pincode].filter(Boolean).join(', ')}`,
      `Delivery Method: ${deliveryMethod === 'porter' ? 'Porter (charges paid separately by customer)' : `Courier (${isPuneDelivery ? 'Pune' : 'Outside Pune'})`}`,
      `Delivery Charge in Bill: ${formatCurrency(deliveryCharges)}${deliveryMethod === 'courier' ? ` (${totalWeightKg} kg x ${formatCurrency(courierRatePerKg)}/kg)` : ''}`,
      'Products:',
      ...items.map(item => `${item.name} - ${item.quantity} kg - ${formatCurrency(calculateLineTotal(item.price, item.quantity))}`),
      `Grand Total: ${formatCurrency(grandTotal)}`,
      `Cloudinary Invoice URL: ${invoice?.cloudinaryUrl ?? 'Pending'}`,
      '━━━━━━━━━━━━━━',
    ].join('\n');

    const url = buildWhatsAppUrl(message);
    const whatsappWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!whatsappWindow) {
      window.location.assign(url);
    }
    setIsWhatsAppLoading(false);
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-end justify-center bg-[#140F0B]/70 sm:items-center sm:p-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="max-h-[100dvh] w-full max-w-6xl overflow-x-hidden overflow-y-auto rounded-t-[24px] border border-[#E4D2B4] bg-[#FFFDF8] shadow-[0_30px_80px_rgba(0,0,0,0.25)] sm:max-h-[95vh] sm:rounded-[32px]">
          <div className="flex items-center justify-between border-b border-[#E4D2B4] bg-[#FFF9F0] px-5 py-4 sm:px-7">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#A86E34]">Premium Checkout</p>
              <h2 className="text-xl font-semibold text-[#6B4226]">Shrujay Food Products</h2>
            </div>
            <button onClick={onClose} className="rounded-full border border-[#E4D2B4] p-2 text-[#6B4226] transition hover:bg-[#FFF3E8]">
              <X size={18} />
            </button>
          </div>

          <div className="p-3 sm:p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="rounded-[24px] border border-[#E4D2B4] bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                  {['customer', 'method', 'review', 'confirmed'].map((label, index) => {
                    const isActive = step === label;
                    const doneSteps = ['method', 'review', 'confirmed'];
                    const isDone = doneSteps.includes(label) && doneSteps.indexOf(step) > index;
                    let className = 'bg-[#FFF9F0] text-[#8B5E3C]';
                    if (isActive) {
                      className = 'bg-[#6B4226] text-white';
                    } else if (isDone) {
                      className = 'bg-[#F3E7D4] text-[#6B4226]';
                    }
                    return (
                      <span key={label} className={`rounded-full px-3 py-1 ${className}`}>
                        {index + 1}. {label === 'confirmed' ? 'Order Confirmed' : label.charAt(0).toUpperCase() + label.slice(1)}
                      </span>
                    );
                  })}
                </div>

                {step === 'customer' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#6B4226]">
                      <ArrowLeft size={16} /> <span className="font-semibold">Customer Information</span>
                    </div>
                    <CustomerForm defaultValues={customer} onSubmit={handleCustomerSubmit} />
                  </div>
                )}

                {step === 'method' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#6B4226]">
                      <ArrowLeft size={16} /> <span className="font-semibold">Delivery Method</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('courier')}
                        className={`rounded-2xl border p-4 text-left transition ${deliveryMethod === 'courier' ? 'border-[#6B4226] bg-[#FFF3E8] ring-2 ring-[#6B4226]/15' : 'border-[#E4D2B4] bg-white hover:bg-[#FFF9F0]'}`}
                      >
                        <Package size={22} className="mb-3 text-[#6B4226]" />
                        <p className="font-semibold text-[#6B4226]">Courier</p>
                        <p className="mt-1 text-sm text-[#8B5E3C]">{formatCurrency(30)}/kg inside Pune, {formatCurrency(40)}/kg outside Pune</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('porter')}
                        className={`rounded-2xl border p-4 text-left transition ${deliveryMethod === 'porter' ? 'border-[#6B4226] bg-[#FFF3E8] ring-2 ring-[#6B4226]/15' : 'border-[#E4D2B4] bg-white hover:bg-[#FFF9F0]'}`}
                      >
                        <Truck size={22} className="mb-3 text-[#6B4226]" />
                        <p className="font-semibold text-[#6B4226]">Porter</p>
                        <p className="mt-1 text-sm text-[#8B5E3C]">{formatCurrency(0)} added to this bill</p>
                      </button>
                    </div>
                    {deliveryMethod === 'porter' && (
                      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                        <p className="font-semibold">Important Porter notice</p>
                        <p className="mt-1">Porter charges are not included in this bill. The customer must pay Porter charges directly.</p>
                      </div>
                    )}
                    {deliveryMethod === 'courier' && (
                      <div className="rounded-2xl border border-[#E4D2B4] bg-[#FFF9F0] p-4 text-sm text-[#5A3822]">
                        Courier charge: <strong>{formatCurrency(deliveryCharges)}</strong> ({totalWeightKg} kg x {formatCurrency(courierRatePerKg)}/kg, {isPuneDelivery ? 'inside Pune' : 'outside Pune'})
                      </div>
                    )}
                    <button onClick={() => setStep('review')} className="w-full rounded-2xl bg-[#6B4226] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8B5E3C]">
                      Continue to Review
                    </button>
                  </div>
                )}
                {step === 'review' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#6B4226]">
                      <ArrowLeft size={16} /> <span className="font-semibold">Review & Confirm</span>
                    </div>
                    <div className="rounded-2xl border border-[#E4D2B4] bg-[#FFF9F0] p-4 text-sm text-[#5A3822]">
                      <p className="mb-1 font-semibold text-[#6B4226]">Name</p>
                      <p>{customer.fullName}</p>
                      <p className="mt-2 mb-1 font-semibold text-[#6B4226]">Address</p>
                      <p>{[customer.houseNumber, customer.street, customer.area, customer.city, customer.state, customer.pincode].filter(Boolean).join(', ')}</p>
                      <p className="mt-2 mb-1 font-semibold text-[#6B4226]">Delivery Method</p>
                      <p>{deliveryMethod === 'porter' ? 'Porter - customer pays Porter separately' : `Courier - ${formatCurrency(deliveryCharges)} (${totalWeightKg} kg x ${formatCurrency(courierRatePerKg)}/kg)`}</p>
                    </div>
                    {isGenerating && <LoadingScreen title="Preparing your invoice" subtitle="Crafting a premium bill for your order." />}
                    {isUploading && (
                      <div className="rounded-[24px] border border-[#E4D2B4] bg-[#FFF9F0] p-4 text-sm text-[#5A3822]">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-semibold text-[#6B4226]">Uploading invoice to Cloudinary</span>
                          <span className="text-[#8B5E3C]">{uploadProgress}%</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-[#F3E7D4]">
                          <div className="h-full rounded-full bg-[#6B4226] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                    {error && <p className="rounded-2xl bg-[#FFF0F0] p-3 text-sm text-[#B33A3A]">{error}</p>}
                    <GenerateBillButton loading={isGenerating || isUploading} onClick={handleGenerateBill} />
                  </div>
                )}

                {step === 'confirmed' && invoice && (
                  <div className="space-y-5">
                    <div className="rounded-[24px] border border-[#E4D2B4] bg-[#FFF9F0] p-6 text-center">
                      <div className="mb-4 flex items-center justify-center">
                        <CheckCircle2 size={34} className="text-[#2E7D32]" />
                      </div>
                      <h3 className="text-3xl md:text-4xl font-extrabold text-[#6B4226] leading-tight">Confirm Your Order</h3>
                      <p className="mt-2 text-sm text-[#6D4C41]">Your bill is ready. Click “Order Now” below to confirm your order.</p>
                    </div>
                    <ContinueWhatsAppButton loading={isWhatsAppLoading} onClick={handleWhatsApp} />
                  </div>
                )}
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
