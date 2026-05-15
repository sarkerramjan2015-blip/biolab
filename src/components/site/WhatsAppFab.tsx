import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { adminWhatsAppPhone, createWhatsAppUrl } from '@/src/lib/whatsapp';

export default function WhatsAppFab() {
  const location = useLocation();
  const hasMobileBottomNav = location.pathname !== '/';

  return (
    <a
      href={createWhatsAppUrl(adminWhatsAppPhone, 'Assalamu alaikum, I want to know more about BIO LAB.')}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with BIO LAB on WhatsApp"
      title="Chat on WhatsApp"
      className={`shine-chip fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_18px_45px_rgba(16,185,129,0.35)] transition-transform hover:-translate-y-1 hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 dark:focus-visible:ring-emerald-900 sm:right-6 ${
        hasMobileBottomNav ? 'bottom-24 md:bottom-6' : 'bottom-6'
      }`}
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
