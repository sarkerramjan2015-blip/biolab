import { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { db, auth } from './firebase';

export type RegistrationSettings = {
  enabled: boolean;
  title: string;
  opensAt: number | null;
  closesAt: number | null;
  updatedAt?: number;
  updatedBy?: string | null;
};

export type Registration = {
  name: string;
  mobile: string;
  school: string;
  branch: string;
  roll: string;
  shift: string;
  whatsapp: string;
  createdAt: number;
  uid?: string;
};

export type RegistrationInput = Omit<Registration, 'createdAt' | 'uid'>;

export const DEFAULT_REGISTRATION_TITLE =
  'SSC 2026 সালে জীববিজ্ঞান বিষয়ে A+ প্রাপ্ত শিক্ষার্থীদের বিশেষ সংবর্ধনা';

const SETTINGS_ID = 'settings';

export class DuplicateRegistrationError extends Error {}

export function normalizeMobile(raw: string) {
  return raw.replace(/\D/g, '');
}

export function isValidBdMobile(mobile: string) {
  const normalized = normalizeMobile(mobile);
  return /^01[3-9]\d{8}$/.test(normalized);
}

export async function ensureAnonymousUser() {
  if (auth.currentUser) return auth.currentUser;
  const credential = await signInAnonymously(auth);
  return credential.user;
}

export function useRegistrationSettings() {
  const [settings, setSettings] = useState<RegistrationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'registrationSettings', SETTINGS_ID),
      (snapshot) => {
        setSettings(snapshot.exists() ? (snapshot.data() as RegistrationSettings) : null);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching registration settings:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { settings, loading };
}

export function useAdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'registrations'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setRegistrations(snapshot.docs.map((item) => item.data() as Registration));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching registrations:', error);
        setRegistrations([]);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const deleteRegistration = async (mobile: string) => {
    await deleteDoc(doc(db, 'registrations', mobile));
  };

  return { registrations, loading, deleteRegistration };
}

export async function submitRegistration(input: RegistrationInput) {
  const mobile = normalizeMobile(input.mobile);

  try {
    const existing = await getDoc(doc(db, 'registrations', mobile));
    if (existing.exists()) {
      throw new DuplicateRegistrationError();
    }
  } catch (error) {
    if (error instanceof DuplicateRegistrationError) throw error;
    // For non-admin users an existing doc is unreadable (permission-denied),
    // which itself proves the mobile is already taken.
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      throw new DuplicateRegistrationError();
    }
    throw error;
  }

  const user = await ensureAnonymousUser();

  await setDoc(doc(db, 'registrations', mobile), {
    name: input.name.trim(),
    mobile,
    school: input.school.trim(),
    branch: input.branch.trim(),
    roll: input.roll.trim(),
    shift: input.shift.trim(),
    whatsapp: normalizeMobile(input.whatsapp),
    createdAt: Date.now(),
    uid: user.uid,
  });
}

export async function saveRegistrationSettings(settings: RegistrationSettings) {
  await setDoc(doc(db, 'registrationSettings', SETTINGS_ID), {
    ...settings,
    updatedAt: Date.now(),
    updatedBy: auth.currentUser?.email ?? null,
  } satisfies RegistrationSettings);
}

export function isRegistrationWindowOpen(settings: RegistrationSettings | null) {
  if (!settings || !settings.enabled) return false;
  const now = Date.now();
  if (settings.opensAt != null && now < settings.opensAt) return false;
  if (settings.closesAt != null && now > settings.closesAt) return false;
  return true;
}

export function registrationWindowStatus(settings: RegistrationSettings | null) {
  if (!settings || !settings.enabled) return 'disabled' as const;
  const now = Date.now();
  if (settings.opensAt != null && now < settings.opensAt) return 'not-open' as const;
  if (settings.closesAt != null && now > settings.closesAt) return 'closed' as const;
  return 'open' as const;
}
