import { useForm } from 'react-hook-form';
import type { CustomerDetails } from '@/types/order';

type Props = {
  defaultValues?: Partial<CustomerDetails>;
  onSubmit: (values: CustomerDetails) => void;
};

const fields: Array<{ name: keyof CustomerDetails; label: string; placeholder: string; required?: boolean; type?: string }> = [
  { name: 'fullName', label: 'Full Name', placeholder: 'Enter full name', required: true },
  { name: 'mobile', label: 'Mobile Number', placeholder: 'Enter mobile number', required: true, type: 'tel' },
  { name: 'email', label: 'Email (Optional)', placeholder: 'Enter email address', type: 'email' },
  { name: 'houseNumber', label: 'House / Flat Number', placeholder: 'House / Flat Number', required: true },
  { name: 'street', label: 'Street', placeholder: 'Street name', required: true },
  { name: 'area', label: 'Area', placeholder: 'Area / Locality', required: true },
  { name: 'city', label: 'City', placeholder: 'City', required: true },
  { name: 'state', label: 'State', placeholder: 'State', required: true },
  { name: 'pincode', label: 'Pincode', placeholder: 'Pincode', required: true },
];

export function CustomerForm({ defaultValues, onSubmit }: Props) {
  const { register, handleSubmit } = useForm<CustomerDetails>({
    defaultValues: {
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
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map(field => (
          <label key={field.name} className="block text-sm text-[#5A3822]">
            <span className="mb-1.5 block font-semibold">{field.label}</span>
            <input
              type={field.type ?? 'text'}
              required={field.required}
              placeholder={field.placeholder}
              className="w-full rounded-2xl border border-[#E4D2B4] bg-[#FFFDF8] px-4 py-3 text-sm outline-none transition focus:border-[#A86E34] focus:ring-2 focus:ring-[#A86E34]/20"
              {...register(field.name)}
            />
          </label>
        ))}
      </div>

      <label className="block text-sm text-[#5A3822]">
        <span className="mb-1.5 block font-semibold">Delivery Instructions (Optional)</span>
        <textarea
          rows={3}
          placeholder="Any gate code, landmark, or special instructions"
          className="w-full rounded-2xl border border-[#E4D2B4] bg-[#FFFDF8] px-4 py-3 text-sm outline-none transition focus:border-[#A86E34] focus:ring-2 focus:ring-[#A86E34]/20"
          {...register('instructions')}
        />
      </label>

      <button className="w-full rounded-2xl bg-[#6B4226] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8B5E3C]">
        Continue to Delivery Location
      </button>
    </form>
  );
}
