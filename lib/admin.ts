import type { User } from 'firebase/auth';

export const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

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

  const previewAllowed = import.meta.env.VITE_ALLOW_LOCAL_ADMIN_PREVIEW !== 'false';

  return previewAllowed && isPrivateDevelopmentHost(window.location.hostname);
}

export function isAdminUser(user: User | null) {
  if (!user?.email) {
    return false;
  }

  if (isLocalAdminPreviewEnabled()) {
    return true;
  }

  return adminEmails.includes(user.email.toLowerCase());
}

export const adminSetupHint =
  'Local/private dev preview opens the admin dashboard. Production needs VITE_ADMIN_EMAILS plus Firebase admin custom claim.';
