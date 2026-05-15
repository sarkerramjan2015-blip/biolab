export const adminWhatsAppPhone = '8801549625831';
export const developerWhatsAppPhone = '8801518657869';

export function createWhatsAppUrl(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
