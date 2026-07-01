export const MIN_QUANTITY_KG = 0.5;
export const QUANTITY_STEP_KG = 0.1;

export function normalizeQuantity(quantity: number) {
  return Math.max(MIN_QUANTITY_KG, Math.round(quantity * 10) / 10);
}

export function calculateLineTotal(pricePerKg: number, quantityKg: number) {
  return Math.round((pricePerKg * quantityKg + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}
