import { Instagram, Facebook, MessageSquare, Phone, MapPin, Truck, Package, Leaf } from 'lucide-react';
import type { InvoiceData } from '@/types/order';

type Props = {
  data: InvoiceData;
  amountInWords: string;
};

const brown = '#6B4226';
const cream = '#FFF8EF';
const green = '#2E7D32';

function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function InvoiceTemplate({ data, amountInWords }: Props) {
  return (
    <div className="min-h-[1680px] w-[1190px] rounded-[32px] border border-[#E4D2B4] bg-white p-12 text-[14px] text-[#3A2D24] shadow-[0_24px_64px_rgba(0,0,0,0.08)]" style={{ fontFamily: 'Mukta, sans-serif' }}>
      <div className="flex items-start justify-between gap-8 border-b border-[#E4D2B4] pb-8">
        <div className="flex items-center gap-4">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-[#E6F0E2] text-[#2E7D32] shadow-sm">
            <span className="text-3xl font-black">S</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold uppercase tracking-[0.35em] text-[#3A2D24]">SHRUJAY</div>
            <div className="mt-1 text-sm font-semibold uppercase tracking-[0.35em] text-[#6B4226]">Food Products</div>
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-[64px] font-semibold uppercase tracking-[0.18em] text-[#3A2D24] text-center">BILL</h1>
        </div>

        <div className="grid gap-3 text-sm text-[#4A3A2D]">
          <div className="flex items-center gap-3 rounded-3xl border border-[#E4D2B4] bg-[#FFF7EE] p-4">
            <Phone size={18} className="text-[#6B4226]" />
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-[#6B4226]">Phone</div>
              <div className="font-semibold">+91 {data.customer.mobile}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-3xl border border-[#E4D2B4] bg-[#FFF7EE] p-4">
            <MapPin size={18} className="text-[#6B4226]" />
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-[#6B4226]">Location</div>
              <div className="font-semibold">Pune, Maharashtra, India</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-3xl border border-[#E4D2B4] bg-[#FFF7EE] p-4">
            <Truck size={18} className="text-[#6B4226]" />
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-[#6B4226]">Delivery</div>
              <div className="font-semibold">Fastest home delivery available</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-3xl border border-[#E4D2B4] bg-[#FFF7EE] p-4">
            <Package size={18} className="text-[#6B4226]" />
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-[#6B4226]">Min. order</div>
              <div className="font-semibold">0.5 kg</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_0.6fr]">
        <div className="rounded-[28px] border border-[#E4D2B4] bg-[#FFF8EF] p-8">
          <div className="mb-4 text-xs uppercase tracking-[0.35em] text-[#6B4226]">Bill To</div>
          <div className="space-y-2 text-sm text-[#3A2D24]">
            <div className="font-semibold text-lg">{data.customer.fullName}</div>
            <div>{data.customer.houseNumber}, {data.customer.street}</div>
            <div>{data.customer.area}, {data.customer.city}</div>
            <div>{data.customer.state} - {data.customer.pincode}</div>
            {data.customer.email && <div>{data.customer.email}</div>}
            <div>{data.delivery.address}</div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#E4D2B4] bg-[#FFF8EF] p-8">
          <div className="mb-4 text-xs uppercase tracking-[0.35em] text-[#6B4226]">Invoice Details</div>
          <div className="grid gap-3 text-sm text-[#3A2D24]">
            <div className="flex justify-between gap-4"><span className="text-[#6B4226]">Bill No</span><span>{data.invoiceNumber}</span></div>
            <div className="flex justify-between gap-4"><span className="text-[#6B4226]">Date</span><span>{data.issuedAt}</span></div>
            <div className="flex justify-between gap-4"><span className="text-[#6B4226]">Order No</span><span>{data.orderNumber}</span></div>
            <div className="flex justify-between gap-4"><span className="text-[#6B4226]">Payment Mode</span><span>{data.paymentMode}</span></div>
          </div>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-[28px] border border-[#E4D2B4]">
        <div className="bg-[#6B4226] px-6 py-4 text-sm uppercase tracking-[0.35em] text-white grid grid-cols-[2.5fr_0.8fr_0.8fr_0.9fr_1fr] gap-4">
          <span>Product</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Unit</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Amount</span>
        </div>
        <div className="divide-y divide-[#E4D2B4] bg-white">
          {data.items.map(item => (
            <div key={item.id} className="grid grid-cols-[2.5fr_0.8fr_0.8fr_0.9fr_1fr] gap-4 px-6 py-5 items-center text-sm text-[#3A2D24]">
              <div className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover bg-[#F5EDD8]" />
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-[12px] text-[#6B4226]">{item.marathi}</div>
                </div>
              </div>
              <div className="text-right">{item.quantity}</div>
              <div className="text-right">{item.unit ?? 'Kg'}</div>
              <div className="text-right">{formatCurrency(item.price)}</div>
              <div className="text-right">{formatCurrency(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:items-end">
        <div className="w-full max-w-[420px] rounded-[24px] border border-[#E4D2B4] bg-[#FFF8EF] p-6 text-sm text-[#3A2D24]">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(data.subtotal)}</span></div>
          <div className="mt-3 flex justify-between"><span>Delivery Charge</span><span>{formatCurrency(data.deliveryCharges)}</span></div>
        </div>
        <div className="w-full max-w-[420px] rounded-[24px] bg-[#FCF5E7] p-6 text-sm font-semibold text-[#3A2D24] shadow-sm">
          <div className="flex justify-between"><span>Total</span><span>{formatCurrency(data.grandTotal)}</span></div>
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-[#E4D2B4] bg-[#FFF8EF] p-6 text-sm text-[#3A2D24]">
        Amount in words: <span className="font-semibold">{amountInWords}</span>
      </div>

      <div className="mt-10 rounded-[32px] border-t border-[#E4D2B4] bg-[#FDF8F2] p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 text-sm text-[#4A3A2D]">
            <Leaf size={18} className="text-[#6B4226]" />
            <div>
              <div className="font-semibold text-[#6B4226]">Pure. Natural. Traditional. Premium.</div>
              <div className="text-xs">Made with love and time-honored tradition.</div>
            </div>
          </div>

          <div className="flex items-center gap-5 text-sm text-[#4A3A2D]">
            <div className="flex items-center gap-2"><Instagram size={16} className="text-[#6B4226]" /> @shrujay_food_products</div>
            <div className="flex items-center gap-2"><Facebook size={16} className="text-[#6B4226]" /> @shrujay_food_products</div>
            <div className="flex items-center gap-2"><MessageSquare size={16} className="text-[#6B4226]" /> @shrujay_food_products</div>
          </div>

          <div className="text-right text-sm text-[#4A3A2D]">
            <div className="text-2xl font-semibold">Thank You!</div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#6B4226]">Your order makes our family proud.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
