import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CustomerForm } from './CustomerForm';
import { LocationPicker } from './LocationPicker';
import { OrderSummary } from './OrderSummary';
import { GenerateBillButton } from './GenerateBillButton';
import { InvoicePreview } from './InvoicePreview';
import { ContinueWhatsAppButton } from './ContinueWhatsAppButton';
import { LoadingScreen } from './LoadingScreen';
import { SuccessDialog } from './SuccessDialog';
import { generateInvoicePdf } from '@/services/billGenerator';
import { uploadInvoiceToCloudinary, validatePdf, verifyCloudinaryPdf } from '@/services/cloudinary';
import { buildWhatsAppUrl } from '@/services/whatsapp';
import type { CustomerDetails, DeliveryLocation, InvoiceData, OrderItem } from '@/types/order';

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

const defaultLocation: DeliveryLocation = {
  address: 'Please select a delivery location',
  latitude: 18.52043,
  longitude: 73.856743,
  googleMapsUrl: 'https://www.google.com/maps?q=18.52043,73.856743',
};

export function OrderModal({ open, onClose, items }: Props) {
  const [step, setStep] = useState<'customer' | 'location' | 'review' | 'invoice'>('customer');
  const [customer, setCustomer] = useState<CustomerDetails>(defaultCustomer);
  const [delivery, setDelivery] = useState<DeliveryLocation>(defaultLocation);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [invoiceVerification, setInvoiceVerification] = useState<{
    verified: boolean;
    status: number;
    contentType: string;
    contentLength: number;
    verifiedUrl: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isWhatsAppLoading, setIsWhatsAppLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const deliveryCharges = subtotal > 0 ? 30 : 0;
  const discount = 0;
  const grandTotal = subtotal + deliveryCharges - discount;

  const handleCustomerSubmit = (values: CustomerDetails) => {
    setCustomer(values);
    setStep('location');
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
        delivery,
        items,
        subtotal,
        deliveryCharges,
        discount,
        grandTotal,
      };

      let pdfBlob = await generateInvoicePdf(invoiceData);
      let file = new File([pdfBlob], `${invoiceNumber}.pdf`, { type: 'application/pdf' });

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
      const verification = await verifyCloudinaryPdf(uploadResponse.secure_url);
      setInvoice({ ...invoiceData, cloudinaryUrl });
      setInvoiceVerification(verification);
      setStep('invoice');

      if (!verification.verified) {
        setError(
          `Invoice verification failed. Status ${verification.status}, Content-Type ${verification.contentType || 'unknown'}, Length ${verification.contentLength}.`
        );
        return;
      }

      window.open(cloudinaryUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsGenerating(false);
      setIsUploading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!invoiceVerification?.verified) {
      setError('Invoice must be verified before continuing to WhatsApp.');
      return;
    }

    setIsWhatsAppLoading(true);
    const message = [
      '━━━━━━━━━━━━━━',
      'New Order',
      `Customer Name: ${customer.fullName}`,
      `Phone Number: ${customer.mobile}`,
      `Address: ${[customer.houseNumber, customer.street, customer.area, customer.city, customer.state, customer.pincode].filter(Boolean).join(', ')}`,
      `OpenStreetMap Location: ${delivery.address} (${delivery.latitude.toFixed(6)}, ${delivery.longitude.toFixed(6)})`,
      `Google Maps Link: ${delivery.googleMapsUrl ?? 'https://www.google.com/maps?q=' + delivery.latitude + ',' + delivery.longitude}`,
      'Products:',
      ...items.map(item => `${item.name} x ${item.quantity} - ₹${item.price * item.quantity}`),
      `Grand Total: ₹${grandTotal}`,
      `Cloudinary Invoice URL: ${invoice?.cloudinaryUrl ?? 'Pending'}`,
      '━━━━━━━━━━━━━━',
    ].join('\n');

    const url = buildWhatsAppUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsWhatsAppLoading(false);
  };

  const handleDownload = () => {
    if (!invoice?.cloudinaryUrl) return;
    window.open(invoice.cloudinaryUrl, '_blank', 'noopener,noreferrer');
  };

  const handleRetryVerification = async () => {
    if (!invoice?.cloudinaryUrl) return;
    setError(null);
    setIsVerifying(true);

    try {
      const verification = await verifyCloudinaryPdf(invoice.cloudinaryUrl);
      setInvoiceVerification(verification);
      if (!verification.verified) {
        setError(
          `Invoice verification failed again. Status ${verification.status}, Content-Type ${verification.contentType || 'unknown'}.`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification retry failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const invoiceVerificationContent = (() => {
    if (isVerifying) {
      return <p className="text-[#6B4226]">Verifying uploaded invoice, please wait…</p>;
    }

    if (!invoiceVerification) {
      return <p className="text-[#6B4226]">Invoice verification pending. Please verify before continuing.</p>;
    }

    if (invoiceVerification.verified) {
      return (
        <div className="space-y-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <p className="font-semibold">Verified PDF ready to send.</p>
          <p>Content-Type: {invoiceVerification.contentType}</p>
          <p>Content-Length: {invoiceVerification.contentLength}</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 rounded-2xl border border-[#F7D0D0] bg-[#FFF1F1] p-4 text-sm text-[#9B2C2C]">
        <p className="font-semibold">Invoice verification failed.</p>
        <p>Status: {invoiceVerification.status}</p>
        <p>Content-Type: {invoiceVerification.contentType || 'unknown'}</p>
        <p>Content-Length: {invoiceVerification.contentLength}</p>
      </div>
    );
  })();

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center bg-[#140F0B]/70 p-3 sm:p-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="max-h-[95vh] w-full max-w-6xl overflow-y-auto rounded-[32px] border border-[#E4D2B4] bg-[#FFFDF8] shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between border-b border-[#E4D2B4] bg-[#FFF9F0] px-5 py-4 sm:px-7">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#A86E34]">Premium Checkout</p>
              <h2 className="text-xl font-semibold text-[#6B4226]">Shrujay Food Products</h2>
            </div>
            <button onClick={onClose} className="rounded-full border border-[#E4D2B4] p-2 text-[#6B4226] transition hover:bg-[#FFF3E8]">
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-[24px] border border-[#E4D2B4] bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                  {['customer', 'location', 'review', 'invoice'].map((label, index) => {
                    const isActive = step === label;
                    const doneSteps = ['location', 'review', 'invoice'];
                    const isDone = doneSteps.includes(label) && doneSteps.indexOf(step) > index;
                    let className = 'bg-[#FFF9F0] text-[#8B5E3C]';
                    if (isActive) {
                      className = 'bg-[#6B4226] text-white';
                    } else if (isDone) {
                      className = 'bg-[#F3E7D4] text-[#6B4226]';
                    }
                    return (
                      <span key={label} className={`rounded-full px-3 py-1 ${className}`}>
                        {index + 1}. {label.charAt(0).toUpperCase() + label.slice(1)}
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

                {step === 'location' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#6B4226]">
                      <ArrowLeft size={16} /> <span className="font-semibold">Delivery Location</span>
                    </div>
                    <LocationPicker value={delivery} onChange={setDelivery} />
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
                      <p className="mt-2 mb-1 font-semibold text-[#6B4226]">Location</p>
                      <p>{delivery.address}</p>
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

                {step === 'invoice' && invoice && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#6B4226]">
                      <CheckCircle2 size={16} /> <span className="font-semibold">Bill Generated Successfully</span>
                    </div>
                    <SuccessDialog title="✓ Bill Uploaded Successfully" message={`Cloudinary URL: ${invoice.cloudinaryUrl ?? ''}`} />

                    <div className="rounded-[24px] border border-[#E4D2B4] bg-[#FFF9F0] p-4 text-sm text-[#5A3822]">
                      <p className="mb-2 font-semibold text-[#6B4226]">Invoice Verification</p>
                      {invoiceVerificationContent}
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={handleRetryVerification}
                          disabled={isVerifying || isUploading}
                          className="w-full rounded-2xl border border-[#6B4226] bg-[#FFF8EF] px-4 py-3 text-sm font-semibold text-[#6B4226] transition hover:bg-[#FFF0DF] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                        >
                          {isVerifying ? 'Retrying verification…' : 'Retry Verification'}
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerateBill}
                          disabled={isGenerating || isUploading || isVerifying}
                          className="w-full rounded-2xl bg-[#6B4226] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8B5E3C] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                        >
                          {isGenerating || isUploading ? 'Regenerating invoice…' : 'Re-upload Invoice'}
                        </button>
                      </div>
                    </div>

                    <InvoicePreview invoice={invoice} onDownload={handleDownload} />
                    <ContinueWhatsAppButton disabled={!invoiceVerification?.verified} loading={isWhatsAppLoading} onClick={handleWhatsApp} />
                    {!invoiceVerification?.verified && (
                      <p className="text-sm text-[#9B2C2C]">You must verify the uploaded invoice PDF before continuing to WhatsApp.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <OrderSummary items={items} customer={customer} delivery={delivery} subtotal={subtotal} deliveryCharges={deliveryCharges} discount={discount} grandTotal={grandTotal} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
