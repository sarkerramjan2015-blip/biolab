import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Database,
  Download,
  Eye,
  EyeOff,
  FileText,
  HardDrive,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useChapters, useResourceControls, type ChapterDoc } from '@/lib/content';
import { isLocalAdminPreviewEnabled } from '@/lib/admin';
import { storage } from '@/lib/firebase';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import Seo from '@/src/components/Seo';
import { localAssetChapters } from '@/src/data/localResources';
import type { WriterContent } from '@/src/data/resources';
import adminImage from '../../img/pic.jpeg';

const MAX_PDF_SIZE = 50 * 1024 * 1024;

type SubjectKey = 'botany' | 'zoology' | 'ssc';
type AdminResource = {
  key: string;
  origin: 'bundled' | 'uploaded';
  subject: string;
  chapterId: number;
  chapterTitle: string;
  writer: WriterContent;
  docId?: string;
  writerIndex?: number;
  hidden: boolean;
};

const subjectLabels: Record<SubjectKey, string> = {
  botany: 'উদ্ভিদবিজ্ঞান',
  zoology: 'প্রাণিবিজ্ঞান',
  ssc: 'SSC Biology',
};

const initialFormData = {
  subject: 'botany' as SubjectKey,
  id: '',
  title: '',
  writerName: 'জাহিদ স্যার',
  resourceTitle: '',
  resourceKind: 'pdf' as NonNullable<WriterContent['resourceKind']>,
  hasSolve: false,
  hasVideo: false,
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function safeStorageName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-\u0980-\u09FF]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function flattenBundledResources(hiddenUrls: Set<string>): AdminResource[] {
  return (Object.entries(localAssetChapters) as [SubjectKey, ChapterDoc[]][])
    .flatMap(([subject, chapters]) =>
      chapters.flatMap((chapter) =>
        chapter.writers
          .filter((writer) => Boolean(writer.pdfUrl))
          .map((writer, writerIndex) => ({
            key: `bundled-${writer.pdfUrl}`,
            origin: 'bundled' as const,
            subject,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            writer,
            writerIndex,
            hidden: Boolean(writer.pdfUrl && hiddenUrls.has(writer.pdfUrl)),
          })),
      ),
    );
}

function flattenUploadedResources(chapters: ChapterDoc[], hiddenUrls: Set<string>): AdminResource[] {
  return chapters.flatMap((chapter) =>
    chapter.writers
      .map((writer, writerIndex) => ({ writer, writerIndex }))
      .filter(({ writer }) => Boolean(writer.pdfUrl))
      .map(({ writer, writerIndex }) => ({
        key: `uploaded-${chapter.docId}-${writerIndex}-${writer.pdfUrl}`,
        origin: 'uploaded' as const,
        subject: chapter.subject,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        writer,
        docId: chapter.docId,
        writerIndex,
        hidden: Boolean(writer.pdfUrl && hiddenUrls.has(writer.pdfUrl)),
      })),
  );
}

export default function AdminDashboard() {
  const location = useLocation();
  const { chapters, loading, addChapter, updateChapter, deleteChapter } = useChapters();
  const { hiddenUrls, loading: controlsLoading, setResourceHidden } = useResourceControls();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const localAdminPreview = isLocalAdminPreviewEnabled();

  useEffect(() => {
    const openUploadSheet = () => setIsOpen(true);
    window.addEventListener('bio-admin-open-upload', openUploadSheet);

    return () => window.removeEventListener('bio-admin-open-upload', openUploadSheet);
  }, []);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    if (location.hash === '#upload-pdf') {
      setIsOpen(true);
      return;
    }

    const frame = window.setTimeout(() => {
      document.querySelector(location.hash)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);

    return () => window.clearTimeout(frame);
  }, [location.hash]);

  const resources = useMemo(() => {
    return [
      ...flattenBundledResources(hiddenUrls),
      ...flattenUploadedResources(chapters, hiddenUrls),
    ].sort((a, b) => {
      const subjectSort = a.subject.localeCompare(b.subject);
      if (subjectSort !== 0) {
        return subjectSort;
      }
      return a.chapterId - b.chapterId;
    });
  }, [chapters, hiddenUrls]);

  const stats = {
    total: resources.length,
    visible: resources.filter((resource) => !resource.hidden).length,
    hidden: resources.filter((resource) => resource.hidden).length,
    uploaded: resources.filter((resource) => resource.origin === 'uploaded').length,
    bundled: resources.filter((resource) => resource.origin === 'bundled').length,
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      window.alert('Only PDF files are allowed.');
      event.target.value = '';
      return;
    }

    if (selectedFile.size > MAX_PDF_SIZE) {
      window.alert('PDF size must be 50MB or less.');
      event.target.value = '';
      return;
    }

    setFile(selectedFile);
    setFormData((current) => ({
      ...current,
      resourceTitle: current.resourceTitle || selectedFile.name.replace(/\.pdf$/i, ''),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      window.alert('Please select a PDF file first.');
      return;
    }

    setUploading(true);
    setProgress(0);

    const storagePath = `pdfs/${Date.now()}_${safeStorageName(file.name) || 'resource.pdf'}`;

    try {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: 'application/pdf',
      });

      const pdfUrl = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          },
          (error) => reject(error),
          async () => {
            resolve(await getDownloadURL(uploadTask.snapshot.ref));
          },
        );
      });

      await addChapter({
        id: Number.parseInt(formData.id, 10) || 0,
        title: formData.title,
        subject: formData.subject,
        writers: [
          {
            name: formData.writerName,
            resourceTitle: formData.resourceTitle,
            resourceKind: formData.resourceKind,
            book: true,
            solve: formData.hasSolve,
            video: formData.hasVideo,
            pdfUrl,
            storagePath,
            sizeLabel: formatBytes(file.size),
          },
        ],
      });

      setIsOpen(false);
      setFormData(initialFormData);
      setFile(null);
      setProgress(0);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      window.alert('Failed to upload file. Please check admin permissions.');
    } finally {
      setUploading(false);
    }
  };

  const toggleHidden = async (resource: AdminResource) => {
    if (!resource.writer.pdfUrl) {
      return;
    }

    setBusyKey(resource.key);

    try {
      await setResourceHidden(resource.writer.pdfUrl, !resource.hidden);
    } catch (error) {
      console.error('Error updating resource visibility:', error);
      window.alert('Failed to update resource visibility. Please check admin permissions.');
    } finally {
      setBusyKey(null);
    }
  };

  const deleteUploadedResource = async (resource: AdminResource) => {
    if (resource.origin !== 'uploaded' || !resource.docId) {
      await toggleHidden(resource);
      return;
    }

    const title = resource.writer.resourceTitle ?? resource.chapterTitle;
    const confirmed = window.confirm(`Delete "${title}" permanently from BIO LAB?`);
    if (!confirmed) {
      return;
    }

    setBusyKey(resource.key);

    try {
      if (resource.writer.storagePath) {
        try {
          await deleteObject(ref(storage, resource.writer.storagePath));
        } catch (storageError) {
          console.warn('Storage file delete failed. Continuing with Firestore cleanup.', storageError);
        }
      }

      const chapter = chapters.find((item) => item.docId === resource.docId);
      if (!chapter) {
        throw new Error('Chapter document was not found.');
      }

      if (chapter.writers.length <= 1) {
        await deleteChapter(resource.docId);
      } else {
        await updateChapter(resource.docId, {
          writers: chapter.writers.filter((_, index) => index !== resource.writerIndex),
        });
      }

      if (resource.writer.pdfUrl && resource.hidden) {
        await setResourceHidden(resource.writer.pdfUrl, false);
      }
    } catch (error) {
      console.error('Error deleting PDF:', error);
      window.alert('Failed to delete PDF. Please check admin permissions.');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl space-y-8"
    >
      <Seo
        title="Admin Dashboard"
        description="BIO LAB admin dashboard for managing biology chapters, PDF uploads, mentors, and platform content."
      />

      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="bio-grid overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-orange-500">
                Full Access Control
              </p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-5xl">
                PDF Control Center
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
                Admin এখান থেকে সব PDF দেখতে, website থেকে hide/unhide করতে, আর Firebase Storage-এ নতুন PDF
                upload/delete করতে পারবে।
              </p>
            </div>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger render={
                <Button className="h-11 rounded-xl bg-orange-600 px-5 font-bold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700">
                  <Plus className="mr-2 h-4 w-4" /> Upload PDF
                </Button>
              } />
              <SheetContent className="!w-full max-w-none overflow-y-auto sm:!max-w-md">
                <SheetHeader className="mb-6">
                  <SheetTitle>Upload New PDF</SheetTitle>
                  <SheetDescription>Add a new PDF resource to BIO LAB.</SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-5 px-4 pb-4">
                  <div>
                    <label className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(event) => setFormData({ ...formData, subject: event.target.value as SubjectKey })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="botany">উদ্ভিদবিজ্ঞান (Botany)</option>
                      <option value="zoology">প্রাণিবিজ্ঞান (Zoology)</option>
                      <option value="ssc">SSC Biology</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Chapter No</label>
                      <input
                        type="number"
                        required
                        value={formData.id}
                        onChange={(event) => setFormData({ ...formData, id: event.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Type</label>
                      <select
                        value={formData.resourceKind}
                        onChange={(event) => setFormData({ ...formData, resourceKind: event.target.value as NonNullable<WriterContent['resourceKind']> })}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                      >
                        <option value="pdf">PDF</option>
                        <option value="note">Note</option>
                        <option value="solve">Solve</option>
                        <option value="exam">Exam</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Chapter Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">PDF Title</label>
                    <input
                      type="text"
                      required
                      value={formData.resourceTitle}
                      onChange={(event) => setFormData({ ...formData, resourceTitle: event.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Writer Name</label>
                    <input
                      type="text"
                      required
                      value={formData.writerName}
                      onChange={(event) => setFormData({ ...formData, writerName: event.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <input type="checkbox" checked={formData.hasSolve} onChange={(event) => setFormData({ ...formData, hasSolve: event.target.checked })} />
                      Solve sheet
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <input type="checkbox" checked={formData.hasVideo} onChange={(event) => setFormData({ ...formData, hasVideo: event.target.checked })} />
                      Has video
                    </label>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">PDF File</label>
                    <div className="rounded-2xl border-2 border-dashed border-slate-300 p-5 text-center transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label htmlFor="pdf-upload" className="flex cursor-pointer flex-col items-center gap-2">
                        <UploadCloud className="h-8 w-8 text-orange-500" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {file ? file.name : 'Click to select PDF'}
                        </span>
                        <span className="text-xs text-slate-500">PDF up to 50MB</span>
                      </label>
                    </div>
                    {progress > 0 && (
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div className="h-full rounded-full bg-orange-600 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                  <Button type="submit" disabled={uploading} className="h-11 w-full rounded-xl bg-orange-600 font-bold text-white hover:bg-orange-700">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save PDF'}
                  </Button>
                </form>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="relative hidden overflow-hidden rounded-2xl border border-orange-100 bg-orange-50 shadow-sm dark:border-orange-900/50 dark:bg-orange-950/30 lg:block">
          <img src={adminImage} alt="BIO LAB mentor and admin profile" className="h-full min-h-64 w-full object-cover object-top" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-200">BIO LAB Admin</p>
            <p className="mt-1 text-sm font-semibold">Resource quality starts here.</p>
          </div>
        </div>
      </header>

      {localAdminPreview && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-7 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Local admin preview on: তুমি admin dashboard দেখতে পারবে। Upload/delete live test করতে Firebase account-এ
          admin custom claim এবং deployed Firestore/Storage rules লাগবে।
        </div>
      )}

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-12 rounded-xl bg-orange-600 font-bold text-white hover:bg-orange-700"
        >
          <UploadCloud className="mr-2 h-4 w-4" /> Upload PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => document.querySelector('#pdf-resources')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="h-12 rounded-xl border-slate-200 font-bold dark:border-slate-700"
        >
          <FileText className="mr-2 h-4 w-4" /> PDF List
        </Button>
        <Link to="/resources" className="block">
          <Button type="button" variant="outline" className="h-12 w-full rounded-xl border-slate-200 font-bold dark:border-slate-700">
            <Eye className="mr-2 h-4 w-4" /> Student View
          </Button>
        </Link>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Total PDF', value: stats.total, icon: <FileText className="h-6 w-6" />, className: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40' },
          { label: 'Visible', value: stats.visible, icon: <Eye className="h-6 w-6" />, className: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40' },
          { label: 'Hidden', value: stats.hidden, icon: <EyeOff className="h-6 w-6" />, className: 'text-slate-600 bg-slate-100 dark:bg-slate-800' },
          { label: 'Uploaded', value: stats.uploaded, icon: <Database className="h-6 w-6" />, className: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
          { label: 'Bundled', value: stats.bundled, icon: <HardDrive className="h-6 w-6" />, className: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
        ].map((item) => (
          <Card key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${item.className}`}>
              {item.icon}
            </div>
            <p className="text-3xl font-extrabold text-slate-950 dark:text-white">{item.value}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
          </Card>
        ))}
      </div>

      <Card id="pdf-resources" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">All PDF Resources</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Bundled PDFs can be hidden from the website. Uploaded PDFs can be permanently deleted.
            </p>
          </div>
          {(loading || controlsLoading) && (
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Syncing
            </span>
          )}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {resources.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No PDF resources found.</div>
          ) : (
            resources.map((resource) => {
              const title = resource.writer.resourceTitle ?? resource.chapterTitle;
              const subject = subjectLabels[resource.subject as SubjectKey] ?? resource.subject;
              const isBusy = busyKey === resource.key;

              return (
                <div key={resource.key} className={`grid gap-4 p-5 transition-colors md:grid-cols-[minmax(0,1fr)_auto] md:items-center ${resource.hidden ? 'bg-slate-50/70 opacity-70 dark:bg-slate-950/40' : ''}`}>
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] ${resource.origin === 'uploaded' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                        {resource.origin}
                      </span>
                      {resource.hidden && (
                        <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Hidden
                        </span>
                      )}
                      {resource.writer.resourceKind && (
                        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                          {resource.writer.resourceKind}
                        </span>
                      )}
                    </div>
                    <h3 className="truncate text-base font-extrabold text-slate-950 dark:text-white sm:text-lg">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {subject} • Chapter {resource.chapterId}: {resource.chapterTitle}
                      {resource.writer.sizeLabel ? ` • ${resource.writer.sizeLabel}` : ''}
                    </p>
                    {resource.writer.sourcePath && (
                      <p className="mt-1 truncate text-xs font-medium text-slate-400">{resource.writer.sourcePath}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    {resource.writer.pdfUrl && (
                      <a href={resource.writer.pdfUrl} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-700">
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Open
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleHidden(resource)}
                      disabled={isBusy || !resource.writer.pdfUrl}
                      className="rounded-xl border-slate-200 dark:border-slate-700"
                    >
                      {isBusy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : resource.hidden ? <Eye className="mr-1.5 h-3.5 w-3.5" /> : <EyeOff className="mr-1.5 h-3.5 w-3.5" />}
                      {resource.hidden ? 'Show' : 'Hide'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteUploadedResource(resource)}
                      disabled={isBusy || !resource.writer.pdfUrl}
                      className={`rounded-xl ${resource.origin === 'uploaded' ? 'text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      {isBusy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : resource.origin === 'uploaded' ? <Trash2 className="mr-1.5 h-3.5 w-3.5" /> : <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />}
                      {resource.origin === 'uploaded' ? 'Delete' : 'Remove from site'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card id="admin-help" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-500">Admin Help</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white">Simple workflow</h2>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
            Mobile ready
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ['Upload', 'PDF select kore chapter info diye Save PDF.'],
            ['Hide/Show', 'PDF list theke website-e show/hide control koro.'],
            ['Delete', 'Uploaded PDF delete kora jabe; bundled PDF hide kora safe.'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="font-extrabold text-slate-950 dark:text-white">{title}</p>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
