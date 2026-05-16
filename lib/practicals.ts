import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ContentStatus, ExamLevel } from '@/src/data/exam';

export type Practical = {
  id: string;
  title: string;
  level: ExamLevel;
  subject: string;
  description: string;
  sheetUrl?: string;
  videoTitle?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: ContentStatus;
  createdAt: number;
  updatedAt: number;
};

export type PracticalInput = Omit<Practical, 'id' | 'createdAt' | 'updatedAt'>;

export function usePracticals(includeInactive = false) {
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'practicals'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const nextPracticals = snapshot.docs
          .map((item) => ({ id: item.id, ...(item.data() as Omit<Practical, 'id'>) }))
          .filter((item) => includeInactive || item.status === 'active');

        setPracticals(nextPracticals);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching practicals:', error);
        setPracticals([]);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [includeInactive]);

  const addPractical = async (practical: PracticalInput) => {
    const now = Date.now();
    await addDoc(collection(db, 'practicals'), {
      ...practical,
      createdAt: now,
      updatedAt: now,
    });
  };

  const updatePractical = async (practicalId: string, practical: Partial<PracticalInput>) => {
    await updateDoc(doc(db, 'practicals', practicalId), {
      ...practical,
      updatedAt: Date.now(),
    });
  };

  const deletePractical = async (practicalId: string) => {
    await deleteDoc(doc(db, 'practicals', practicalId));
  };

  return {
    practicals,
    loading,
    addPractical,
    updatePractical,
    deletePractical,
  };
}
