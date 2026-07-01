import type { CustomerDetails, DeliveryLocation, OrderItem } from '@/types/order';

type Props = {
  items: OrderItem[];
  customer: CustomerDetails;
  delivery: DeliveryLocation;
  subtotal: number;
  deliveryCharges: number;
  discount: number;
  grandTotal: number;
};

export function OrderSummary({ items, subtotal, deliveryCharges, discount, grandTotal }: Props) {
  return (
    <div className="space-y-4 rounded-[28px] border border-[#E4D2B4] bg-[#FFFDF8] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#6B4226]">Order Summary</h3>
        <span className="rounded-full bg-[#F6E9D8] px-3 py-1 text-xs font-semibold text-[#8B5E3C]">Premium Checkout</span>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-[#F2E2C8] bg-white p-3">
            <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
            <div className="flex-1">
              <p className="font-semibold text-[#2C1810]">{item.name}</p>
              <p className="text-sm text-[#6D4C41]">Qty {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#6B4226]">₹{item.price * item.quantity}</p>
              <p className="text-xs text-[#8B5E3C]">₹{item.price} each</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#E4D2B4] bg-[#FFF9F0] p-4 text-sm text-[#5A3822]">
        <div className="mb-2 flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
        <div className="mb-2 flex justify-between"><span>Delivery Charges</span><span>₹{deliveryCharges}</span></div>
        <div className="mb-2 flex justify-between"><span>Discount</span><span>₹{discount}</span></div>
        <div className="mt-3 flex justify-between border-t border-[#E4D2B4] pt-3 text-base font-semibold text-[#6B4226]"><span>Grand Total</span><span>₹{grandTotal}</span></div>
      </div>
    </div>
  );
}
