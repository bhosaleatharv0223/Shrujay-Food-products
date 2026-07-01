export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/918080394411?text=${encodeURIComponent(message)}`;
}
