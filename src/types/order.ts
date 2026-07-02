export type OrderItem = {
  id: number;
  name: string;
  marathi: string;
  price: number;
  quantity: number;
  unit?: string;
  image: string;
};

export type CustomerDetails = {
  fullName: string;
  mobile: string;
  email: string;
  houseNumber: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  instructions: string;
};

export type DeliveryLocation = {
  address: string;
  latitude: number;
  longitude: number;
  googleMapsUrl?: string;
};

export type DeliveryMethod = 'courier' | 'porter';

export type InvoiceData = {
  invoiceNumber: string;
  issuedAt: string;
  customer: CustomerDetails;
  delivery: DeliveryLocation;
  deliveryMethod: DeliveryMethod;
  items: OrderItem[];
  subtotal: number;
  deliveryCharges: number;
  discount: number;
  grandTotal: number;
  orderNumber: string;
  paymentMode: string;
  cloudinaryUrl?: string;
};
