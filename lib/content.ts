import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, writeBatch, query, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Chapter, botanyChapters, zoologyChapters, sscBiologyChapters } from '@/src/data/resources';
import { isAdminUser } from './admin';

export type ChapterDoc = Chapter & { subject: string; docId?: string; createdAt?: number };

export function useChapters() {
  const [chapters, setChapters] = useState<ChapterDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'chapters'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as ChapterDoc));
      setChapters(data);
      setLoading(false);
      
      // Seed data if completely empty
      if (data.length === 0 && !snapshot.metadata.fromCache) {
        seedInitialData();
      }
    }, (error) => {
      console.error("Error fetching chapters:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const seedInitialData = async () => {
    if (!isAdminUser(auth.currentUser)) {
      console.log("Not an admin, skipping initial data seed");
      return;
    }
    try {
      const batch = writeBatch(db);
      const all: ChapterDoc[] = [
        ...botanyChapters.map(c => ({ ...c, subject: 'botany' })),
        ...zoologyChapters.map(c => ({ ...c, subject: 'zoology' })),
        ...sscBiologyChapters.map(c => ({ ...c, subject: 'ssc' }))
      ];

      all.forEach((chapter, i) => {
        const ref = doc(collection(db, 'chapters'));
        batch.set(ref, { ...chapter, createdAt: Date.now() + i });
      });

      await batch.commit();
      console.log("Seeded initial data");
    } catch (e) {
      console.error("Error seeding initial data", e);
    }
  };

  const addChapter = async (chapter: Omit<ChapterDoc, 'docId' | 'createdAt'>) => {
    const ref = doc(collection(db, 'chapters'));
    await setDoc(ref, { ...chapter, createdAt: Date.now() });
  };

  const updateChapter = async (docId: string, chapter: Partial<ChapterDoc>) => {
    const ref = doc(db, 'chapters', docId);
    await setDoc(ref, chapter, { merge: true });
  };

  const deleteChapter = async (docId: string) => {
    await deleteDoc(doc(db, 'chapters', docId));
  };

  return { chapters, loading, addChapter, updateChapter, deleteChapter };
}
