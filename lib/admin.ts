import type { User } from 'firebase/auth';

function isPrivateDevelopmentHost(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, '');

  return (
    ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(host) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)
  );
}

export function isLocalAdminPreviewEnabled() {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return false;
  }

  const previewAllowed = import.meta.env.VITE_ALLOW_LOCAL_ADMIN_PREVIEW === 'true';

  return previewAllowed && isPrivateDevelopmentHost(window.location.hostname);
}



export const adminSetupHint =
  'Production access approved email, Firebase admin claim অথবা provisioned admin account দিয়ে নিয়ন্ত্রিত।';
