import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, writeBatch, query, orderBy, where, addDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Chapter, botanyChapters, zoologyChapters, sscBiologyChapters } from '@/src/data/resources';
import { useAuth } from './auth';

export type ChapterDoc = Chapter & { subject: string; docId?: string; createdAt?: number };
export type ResourceControl = {
  pdfUrl: string;
  hidden: boolean;
  updatedAt: number;
  updatedBy?: string | null;
};

function resourceControlId(pdfUrl: string) {
  return encodeURIComponent(pdfUrl).replace(/\./g, '%2E');
}

export function useChapters() {
  const [chapters, setChapters] = useState<ChapterDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

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
  }, [isAdmin]);

  const seedInitialData = async () => {
    if (!isAdmin) {
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

export function useResourceControls() {
  const [controls, setControls] = useState<ResourceControl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'resourceControls'), (snapshot) => {
      setControls(snapshot.docs.map((item) => item.data() as ResourceControl));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching resource controls:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hiddenUrls = new Set(
    controls
      .filter((control) => control.hidden)
      .map((control) => control.pdfUrl),
  );

  const setResourceHidden = async (pdfUrl: string, hidden: boolean) => {
    const ref = doc(db, 'resourceControls', resourceControlId(pdfUrl));
    await setDoc(ref, {
      pdfUrl,
      hidden,
      updatedAt: Date.now(),
      updatedBy: auth.currentUser?.email ?? null,
    } satisfies ResourceControl);
  };

  return { controls, hiddenUrls, loading, setResourceHidden };
}

export interface TrackPdfDownloadInput {
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  pdfUrl: string;
  pdfTitle: string;
  subject?: string;
  chapter?: string | number;
}

export async function trackPdfDownload({
  userId,
  userEmail,
  userName,
  pdfUrl,
  pdfTitle,
  subject,
  chapter,
}: TrackPdfDownloadInput) {
  try {
    const downloadsRef = collection(db, 'pdfDownloads');
    await addDoc(downloadsRef, {
      userId,
      userEmail: userEmail || null,
      userName: userName || null,
      pdfId: pdfUrl,
      pdfTitle,
      subject: subject || 'unknown',
      chapter: chapter !== undefined ? String(chapter) : 'unknown',
      downloadedAt: Date.now(),
      fileUrl: pdfUrl,
    });
    console.log('PDF view/download tracked successfully in Firestore');
  } catch (error) {
    console.error('Error tracking PDF download:', error);
  }
}

export function useStudentPdfDownloads(userId: string | undefined) {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setDownloads([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'pdfDownloads'),
      where('userId', '==', userId)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort client-side by downloadedAt descending
        list.sort((a: any, b: any) => (b.downloadedAt ?? 0) - (a.downloadedAt ?? 0));
        setDownloads(list);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching student PDF downloads:', error);
        setDownloads([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { downloads, loading };
}
