import type { User } from 'firebase/auth';

export const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminUser(user: User | null) {
  if (!user?.email) {
    return false;
  }

  return adminEmails.includes(user.email.toLowerCase());
}

export const adminSetupHint =
  'Add your admin email to VITE_ADMIN_EMAILS and set matching Firebase admin rules/custom claims before launch.';
