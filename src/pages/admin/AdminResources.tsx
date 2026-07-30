import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  GraduationCap,
  Leaf,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useChapters, useResourceControls } from '@/lib/content';
import { isLocalAdminPreviewEnabled } from '@/lib/admin';
import { uploadAdminFile } from '@/lib/adminUpload';
import Seo from '@/src/components/Seo';
import { localAssetChapters } from '@/src/data/localResources';
import {
  botanyChapters,
  sscBiologyChapters,
  zoologyChapters,
  type WriterContent,
} from '@/src/data/resources';
import {
  buildAdminResources,
  getAdminResourceStats,
  subjectLabels,
  type AdminResource,
  type ResourceSubject,
} from './adminResourceData';

type ResourceLevel = 'hsc' | 'ssc';
type VisibilityFilter = 'all' | 'visible' | 'hidden';

const initialFormData = {
  subject: 'botany' as ResourceSubject,
  chapterId: '1',
  newChapterId: '',
  newChapterTitle: '',
  writerName: 'জাহিদুল হাসান',
  resourceTitle: '',
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const syllabusChapters = {
  botany: [...botanyChapters, ...localAssetChapters.botany],
  zoology: [...zoologyChapters, ...localAssetChapters.zoology],
  ssc: [...sscBiologyChapters, ...localAssetChapters.ssc],
};

function getDefaultChapterId(subject: ResourceSubject) {
  const ids = syllabusChapters[subject].map((chapter) => chapter.id);
  return ids.length > 0 ? String(Math.min(...ids)) : 'new';
}

export default function AdminResources() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { chapters, loading, addChapter, updateChapter, deleteChapter } = useChapters();
  const { hiddenUrls, loading: controlsLoading, setResourceHidden } = useResourceControls();
  const [selectedLevel, setSelectedLevel] = useState<ResourceLevel>('hsc');
  const [selectedSubject, setSelectedSubject] = useState<ResourceSubject>('botany');
  const [resourceSearch, setResourceSearch] = useState('');
  const [visibility, setVisibility] = useState<VisibilityFilter>('all');
  const [openChapterKey, setOpenChapterKey] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [publishedResource, setPublishedResource] = useState<{ title: string; chapterTitle: string } | null>(null);
  const [fileMeta, setFileMeta] = useState<Pick<WriterContent, 'fileType' | 'mimeType' | 'originalFileName' | 'sizeLabel' | 'cloudinaryPublicId' | 'cloudinaryResourceType'>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localAdminPreview = isLocalAdminPreviewEnabled();

  const resources = useMemo(
    () => buildAdminResources(chapters, hiddenUrls),
    [chapters, hiddenUrls],
  );
  const stats = useMemo(() => getAdminResourceStats(resources), [resources]);

  const levelCounts = useMemo(() => ({
    hsc: resources.filter((resource) => resource.subject !== 'ssc').length,
    ssc: resources.filter((resource) => resource.subject === 'ssc').length,
  }), [resources]);

  const subjectCounts = useMemo(() => ({
    botany: resources.filter((resource) => resource.subject === 'botany').length,
    zoology: resources.filter((resource) => resource.subject === 'zoology').length,
    ssc: resources.filter((resource) => resource.subject === 'ssc').length,
  }), [resources]);

  const chapterOptions = useMemo(() => {
    const grouped = new Map<number, string>();

    syllabusChapters[formData.subject].forEach((chapter) => {
      grouped.set(chapter.id, chapter.title);
    });
    chapters
      .filter((chapter) => chapter.subject === formData.subject)
      .forEach((chapter) => {
        const current = grouped.get(chapter.id);
        if (!current || current.startsWith('অধ্যায়')) {
          grouped.set(chapter.id, chapter.title);
        }
      });

    return [...grouped.entries()]
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.id - b.id);
  }, [chapters, formData.subject]);

  const filteredResources = useMemo(() => {
    const search = resourceSearch.trim().toLowerCase();

    return resources.filter((resource) => {
      if (resource.subject !== selectedSubject) return false;

      const matchesSearch = !search || [
        resource.writer.resourceTitle,
        resource.chapterTitle,
        resource.writer.name,
      ].some((value) => value?.toLowerCase().includes(search));
      const matchesVisibility = visibility === 'all'
        || (visibility === 'hidden' ? resource.hidden : !resource.hidden);

      return matchesSearch && matchesVisibility;
    });
  }, [resourceSearch, resources, selectedSubject, visibility]);

  const chapterGroups = useMemo(() => {
    const grouped = new Map<string, {
      key: string;
      chapterId: number;
      chapterTitle: string;
      resources: AdminResource[];
    }>();

    filteredResources.forEach((resource) => {
      const key = `${resource.subject}-${resource.chapterId}-${resource.chapterTitle}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.resources.push(resource);
      } else {
        grouped.set(key, {
          key,
          chapterId: resource.chapterId,
          chapterTitle: resource.chapterTitle,
          resources: [resource],
        });
      }
    });

    return [...grouped.values()].sort((a, b) => a.chapterId - b.chapterId);
  }, [filteredResources]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setIsUploadOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const selectLevel = (level: ResourceLevel) => {
    setSelectedLevel(level);
    setSelectedSubject(level === 'hsc' ? 'botany' : 'ssc');
    setResourceSearch('');
    setVisibility('all');
    setOpenChapterKey(null);
  };

  const openUpload = () => {
    setFormData((current) => ({
      ...current,
      subject: selectedSubject,
      chapterId: getDefaultChapterId(selectedSubject),
    }));
    setIsUploadOpen(true);
  };

  const handleUploadOpenChange = (open: boolean) => {
    setIsUploadOpen(open);
    if (!open) setPublishedResource(null);
    if (!open && searchParams.get('new') === '1') {
      setSearchParams({}, { replace: true });
    }
  };

  const uploadResourceFile = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      window.alert('শুধু PDF file upload করুন।');
      return;
    }

    const resolvedChapterId = formData.chapterId === 'new'
      ? formData.newChapterId || 'new'
      : formData.chapterId;
    const cleanTitle = file.name
      .replace(/\.pdf$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    setUploading(true);
    setProgress(0);
    setSelectedFileName(file.name);
    setFormData((current) => ({
      ...current,
      resourceTitle: current.resourceTitle.trim() || cleanTitle,
    }));
    setUploadStatus('File upload হচ্ছে...');

    try {
      const result = await uploadAdminFile(file, {
        folder: `resources/${formData.subject}/chapter-${resolvedChapterId}`,
        allowedTypes: ['application/pdf'],
        maxSizeMb: 100,
        onProgress: setProgress,
      });

      setFileUrl(result.downloadUrl);
      setFileMeta({
        fileType: 'pdf',
        mimeType: file.type,
        originalFileName: file.name,
        sizeLabel: formatFileSize(result.bytes),
        cloudinaryPublicId: result.cloudinaryPublicId,
        cloudinaryResourceType: result.cloudinaryResourceType,
      });
      setProgress(100);
      setUploadStatus('Upload সম্পন্ন। এখন “Resource প্রকাশ করুন” চাপুন।');
    } catch (error) {
      console.error('Resource upload failed:', error);
      const message = error instanceof Error ? error.message : 'Upload ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
      setProgress(0);
      setUploadStatus(message);
      window.alert(message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!fileUrl.trim()) {
      window.alert('একটি resource file অথবা public link দিন।');
      return;
    }

    setUploading(true);

    try {
      const resolvedFileMeta = Object.keys(fileMeta).length > 0
        ? fileMeta
        : { fileType: 'pdf' as const };
      const selectedChapter = chapterOptions.find(
        (chapter) => String(chapter.id) === formData.chapterId,
      );
      const chapterId = formData.chapterId === 'new'
        ? Number.parseInt(formData.newChapterId, 10)
        : Number.parseInt(formData.chapterId, 10);
      const chapterTitle = formData.chapterId === 'new'
        ? formData.newChapterTitle.trim()
        : selectedChapter?.title ?? '';

      if (!chapterId || !chapterTitle) {
        window.alert('একটি chapter নির্বাচন করুন।');
        setUploading(false);
        return;
      }

      await addChapter({
        id: chapterId,
        title: chapterTitle,
        subject: formData.subject,
        writers: [{
          name: formData.writerName,
          resourceTitle: formData.resourceTitle,
          resourceKind: 'pdf',
          book: true,
          solve: false,
          video: false,
          pdfUrl: fileUrl.trim(),
          ...resolvedFileMeta,
        }],
      });

      const level = formData.subject === 'ssc' ? 'ssc' : 'hsc';
      setSelectedLevel(level);
      setSelectedSubject(formData.subject);
      setPublishedResource({
        title: formData.resourceTitle,
        chapterTitle,
      });
      setFormData((current) => ({
        ...current,
        resourceTitle: '',
      }));
      setFileUrl('');
      setFileMeta({});
      setProgress(0);
      setUploadStatus('');
      setSelectedFileName('');
      setAdvancedOpen(false);
    } catch (error) {
      console.error('Error adding resource:', error);
      window.alert('Resource save করা যায়নি। Admin permission পরীক্ষা করুন।');
    } finally {
      setUploading(false);
    }
  };

  const toggleHidden = async (resource: AdminResource) => {
    if (!resource.writer.pdfUrl) return;
    setBusyKey(resource.key);

    try {
      await setResourceHidden(resource.writer.pdfUrl, !resource.hidden);
    } catch (error) {
      console.error('Error updating resource visibility:', error);
      window.alert('Visibility update করা যায়নি। Admin permission পরীক্ষা করুন।');
    } finally {
      setBusyKey(null);
    }
  };

  const deleteUploadedResource = async (resource: AdminResource) => {
    if (resource.origin !== 'uploaded' || !resource.docId) return;

    const title = resource.writer.resourceTitle ?? resource.chapterTitle;
    if (!window.confirm(`“${title}” permanently delete করবেন?`)) return;
    setBusyKey(resource.key);

    try {
      const chapter = chapters.find((item) => item.docId === resource.docId);
      if (!chapter) throw new Error('Chapter document was not found.');

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
      console.error('Error deleting resource:', error);
      window.alert('Resource delete করা যায়নি। Admin permission পরীক্ষা করুন।');
    } finally {
      setBusyKey(null);
    }
  };

  const showFilteredChaptersOpen = Boolean(resourceSearch.trim()) || visibility !== 'all';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl space-y-6"
    >
      <Seo
        title="PDF ও Resources | Admin"
        description="Manage BIO LAB HSC and SSC Biology resources chapter by chapter."
      />

      <header className="bio-grid overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link to="/admin/dashboard" className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-500 hover:text-orange-600">
              Admin Home
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
              PDF ও Resources
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500">
              HSC ও SSC আলাদা section-এ সাজানো। Subject এবং chapter খুলে resource manage করুন।
            </p>
          </div>
          <Button
            type="button"
            onClick={openUpload}
            className="h-11 w-fit rounded-xl bg-orange-600 px-5 font-bold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700"
          >
            <Plus className="mr-2 h-4 w-4" /> নতুন Resource
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'মোট Resource', value: stats.total, tone: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' },
          { label: 'Visible', value: stats.visible, tone: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300' },
          { label: 'Hidden', value: stats.hidden, tone: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
          { label: 'Admin Upload', value: stats.uploaded, tone: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' },
        ].map((item) => (
          <Card key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${item.tone}`}>
              <FileText className="h-4 w-4" />
            </div>
            <p className="text-2xl font-extrabold text-slate-950 dark:text-white">{item.value}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{item.label}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-500">Step 1</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white">কোন level-এর resource?</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => selectLevel('hsc')}
            className={`flex items-center gap-4 rounded-2xl border p-5 text-left shadow-sm transition ${
              selectedLevel === 'hsc'
                ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-100 dark:bg-orange-950/30 dark:ring-orange-950'
                : 'border-slate-200 bg-white hover:border-orange-200 dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white">
              <GraduationCap className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-extrabold text-slate-950 dark:text-white">HSC Biology</span>
              <span className="mt-1 block text-sm font-medium text-slate-500">উদ্ভিদবিজ্ঞান ও প্রাণিবিজ্ঞান</span>
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-orange-700 shadow-sm dark:bg-slate-900 dark:text-orange-300">{levelCounts.hsc}</span>
          </button>
          <button
            type="button"
            onClick={() => selectLevel('ssc')}
            className={`flex items-center gap-4 rounded-2xl border p-5 text-left shadow-sm transition ${
              selectedLevel === 'ssc'
                ? 'border-teal-400 bg-teal-50 ring-2 ring-teal-100 dark:bg-teal-950/30 dark:ring-teal-950'
                : 'border-slate-200 bg-white hover:border-teal-200 dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white">
              <BookOpen className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-extrabold text-slate-950 dark:text-white">SSC Biology</span>
              <span className="mt-1 block text-sm font-medium text-slate-500">SSC syllabus-এর chapter ও PDF</span>
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-teal-700 shadow-sm dark:bg-slate-900 dark:text-teal-300">{levelCounts.ssc}</span>
          </button>
        </div>
      </section>

      {selectedLevel === 'hsc' && (
        <section className="space-y-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-500">Step 2 · Subject</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              { key: 'botany' as const, label: 'উদ্ভিদবিজ্ঞান', detail: 'HSC Biology 1st Paper', icon: Leaf, tone: 'teal' },
              { key: 'zoology' as const, label: 'প্রাণিবিজ্ঞান', detail: 'HSC Biology 2nd Paper', icon: FolderOpen, tone: 'indigo' },
            ]).map((subject) => {
              const Icon = subject.icon;
              const active = selectedSubject === subject.key;
              return (
                <button
                  key={subject.key}
                  type="button"
                  onClick={() => {
                    setSelectedSubject(subject.key);
                    setResourceSearch('');
                    setVisibility('all');
                    setOpenChapterKey(null);
                  }}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    active
                      ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30'
                      : 'border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${subject.tone === 'teal' ? 'bg-teal-600' : 'bg-indigo-600'}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold text-slate-950 dark:text-white">{subject.label}</span>
                    <span className="block text-xs font-medium text-slate-500">{subject.detail}</span>
                  </span>
                  <span className="text-sm font-extrabold text-slate-500">{subjectCounts[subject.key]}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">
              {selectedLevel === 'hsc' ? 'Step 3 · Chapter' : 'Step 2 · Chapter'}
            </p>
            <h2 className="mt-2 text-xl font-extrabold text-slate-950 dark:text-white">
              {subjectLabels[selectedSubject]} Resources
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Chapter খুললে তার সব PDF ও note দেখা যাবে।</p>
          </div>
          {(loading || controlsLoading) && (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-orange-600">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Sync হচ্ছে
            </span>
          )}
        </div>

        <div className="grid gap-3 border-b border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40 md:grid-cols-[minmax(0,1fr)_170px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={resourceSearch}
              onChange={(event) => setResourceSearch(event.target.value)}
              placeholder="নাম, chapter বা writer দিয়ে খুঁজুন"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm font-medium dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value as VisibilityFilter)}
            aria-label="Resource visibility"
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="all">সব Status</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div className="space-y-3 bg-slate-50/40 p-4 dark:bg-slate-950/20">
          {chapterGroups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <FileText className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">এই section-এ কোনো resource পাওয়া যায়নি।</p>
            </div>
          ) : chapterGroups.map((chapter, chapterIndex) => {
            const isOpen = showFilteredChaptersOpen
              || (openChapterKey === null ? chapterIndex === 0 : openChapterKey === chapter.key);
            const visibleCount = chapter.resources.filter((resource) => !resource.hidden).length;

            return (
              <div key={chapter.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    if (showFilteredChaptersOpen) return;
                    setOpenChapterKey(isOpen ? '' : chapter.key);
                  }}
                  className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  aria-expanded={isOpen}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 font-extrabold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                    {chapter.chapterId}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold text-slate-950 dark:text-white">{chapter.chapterTitle}</span>
                    <span className="mt-1 block text-xs font-bold text-slate-500">
                      {chapter.resources.length}টি resource · {visibleCount} visible
                    </span>
                  </span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="grid gap-3 border-t border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/30 lg:grid-cols-2">
                    {chapter.resources.map((resource) => {
                      const title = resource.writer.resourceTitle ?? resource.chapterTitle;
                      const isBusy = busyKey === resource.key;

                      return (
                        <article
                          key={resource.key}
                          className={`rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 ${resource.hidden ? 'opacity-65' : ''}`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                              resource.origin === 'uploaded'
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}>
                              {resource.origin === 'uploaded' ? 'Admin Upload' : 'Built-in'}
                            </span>
                            {resource.writer.resourceKind && (
                              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                                {resource.writer.resourceKind}
                              </span>
                            )}
                            {resource.hidden && (
                              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                Hidden
                              </span>
                            )}
                          </div>
                          <h3 className="mt-3 text-base font-extrabold text-slate-950 dark:text-white">{title}</h3>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {resource.writer.name}
                            {resource.writer.sizeLabel ? ` · ${resource.writer.sizeLabel}` : ''}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
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
                              {isBusy
                                ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                : resource.hidden
                                  ? <Eye className="mr-1.5 h-3.5 w-3.5" />
                                  : <EyeOff className="mr-1.5 h-3.5 w-3.5" />}
                              {resource.hidden ? 'Show' : 'Hide'}
                            </Button>
                            {resource.origin === 'uploaded' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteUploadedResource(resource)}
                                disabled={isBusy}
                                className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                              >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                              </Button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {localAdminPreview && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Local preview চলছে। Live upload, hide ও delete করতে Google Login এবং admin permission প্রয়োজন।
        </div>
      )}

      <Sheet open={isUploadOpen} onOpenChange={handleUploadOpenChange}>
        <SheetContent className="!w-full max-w-none overflow-y-auto sm:!max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle>নতুন Resource প্রকাশ করুন</SheetTitle>
            <SheetDescription>বিষয় ও chapter বেছে file দিন, তারপর প্রকাশ করুন।</SheetDescription>
          </SheetHeader>
          {publishedResource ? (
            <div className="px-4 pb-5">
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 text-center dark:border-teal-900 dark:bg-teal-950/30">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                  <CheckCircle2 className="h-7 w-7" />
                </span>
                <h3 className="mt-4 text-xl font-extrabold text-slate-950 dark:text-white">PDF প্রকাশ হয়েছে</h3>
                <p className="mt-2 font-bold text-slate-700 dark:text-slate-200">{publishedResource.title}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{publishedResource.chapterTitle}</p>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleUploadOpenChange(false)}
                  className="h-11 rounded-xl font-bold"
                >
                  Resource list দেখুন
                </Button>
                <Button
                  type="button"
                  onClick={() => setPublishedResource(null)}
                  className="h-11 rounded-xl bg-orange-600 font-bold text-white hover:bg-orange-700"
                >
                  আরেকটি PDF upload
                </Button>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5 px-4 pb-5">
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2 text-center text-[11px] font-extrabold text-slate-500 dark:bg-slate-950/50">
              <span className="rounded-lg bg-white px-2 py-2 text-orange-600 shadow-sm dark:bg-slate-900">১. জায়গা</span>
              <span className="px-2 py-2">২. PDF</span>
              <span className="px-2 py-2">৩. প্রকাশ</span>
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold text-slate-800 dark:text-slate-200">কোন level?</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: 'hsc' as const, label: 'HSC Biology', detail: '১ম ও ২য় পত্র' },
                  { key: 'ssc' as const, label: 'SSC Biology', detail: 'SSC syllabus' },
                ]).map((level) => {
                  const active = level.key === 'ssc'
                    ? formData.subject === 'ssc'
                    : formData.subject !== 'ssc';

                  return (
                    <button
                      key={level.key}
                      type="button"
                      onClick={() => {
                        const subject: ResourceSubject = level.key === 'ssc' ? 'ssc' : 'botany';
                        setFormData({
                          ...formData,
                          subject,
                          chapterId: getDefaultChapterId(subject),
                          newChapterId: '',
                          newChapterTitle: '',
                        });
                      }}
                      className={`rounded-xl border p-3 text-left transition ${
                        active
                          ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-100 dark:bg-orange-950/30 dark:ring-orange-950'
                          : 'border-slate-200 bg-white hover:border-orange-200 dark:border-slate-700 dark:bg-slate-900'
                      }`}
                    >
                      <span className="block text-sm font-extrabold text-slate-950 dark:text-white">{level.label}</span>
                      <span className="mt-0.5 block text-[11px] font-medium text-slate-500">{level.detail}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.subject !== 'ssc' && (
              <div>
                <label className="mb-2 block text-sm font-extrabold text-slate-800 dark:text-slate-200">কোন subject?</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: 'botany' as const, label: 'উদ্ভিদবিজ্ঞান' },
                    { key: 'zoology' as const, label: 'প্রাণিবিজ্ঞান' },
                  ]).map((subject) => (
                    <button
                      key={subject.key}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        subject: subject.key,
                        chapterId: getDefaultChapterId(subject.key),
                        newChapterId: '',
                        newChapterTitle: '',
                      })}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-extrabold transition ${
                        formData.subject === subject.key
                          ? 'border-teal-400 bg-teal-50 text-teal-800 dark:bg-teal-950/30 dark:text-teal-200'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      {subject.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-extrabold text-slate-800 dark:text-slate-200">কোন chapter-এ যাবে?</label>
              <select
                value={formData.chapterId}
                onChange={(event) => setFormData({
                  ...formData,
                  chapterId: event.target.value,
                  newChapterId: '',
                  newChapterTitle: '',
                })}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
              >
                {chapterOptions.map((chapter) => (
                  <option key={chapter.id} value={String(chapter.id)}>
                    অধ্যায় {chapter.id} — {chapter.title}
                  </option>
                ))}
                <option value="new">＋ নতুন chapter যোগ করুন</option>
              </select>
            </div>

            {formData.chapterId === 'new' && (
              <div className="grid grid-cols-[105px_minmax(0,1fr)] gap-2 rounded-xl border border-orange-200 bg-orange-50/60 p-3 dark:border-orange-900 dark:bg-orange-950/20">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">নম্বর</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.newChapterId}
                    onChange={(event) => setFormData({ ...formData, newChapterId: event.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">Chapter-এর নাম</label>
                  <input
                    type="text"
                    required
                    value={formData.newChapterTitle}
                    onChange={(event) => setFormData({ ...formData, newChapterTitle: event.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-extrabold text-slate-800 dark:text-slate-200">PDF file দিন</label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,application/pdf"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadResourceFile(file);
                  event.target.value = '';
                }}
              />
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (!uploading) fileInputRef.current?.click();
                }}
                onKeyDown={(event) => {
                  if ((event.key === 'Enter' || event.key === ' ') && !uploading) {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                  const file = event.dataTransfer.files?.[0];
                  if (file) void uploadResourceFile(file);
                }}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition ${
                  dragActive
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                    : fileUrl && selectedFileName
                      ? 'border-teal-300 bg-teal-50/70 dark:border-teal-800 dark:bg-teal-950/20'
                      : 'border-slate-300 bg-slate-50 hover:border-orange-300 hover:bg-orange-50/40 dark:border-slate-700 dark:bg-slate-950/50'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-500" />
                    <p className="mt-2 text-sm font-extrabold text-slate-800 dark:text-white">PDF upload হচ্ছে… {progress}%</p>
                  </>
                ) : fileUrl && selectedFileName ? (
                  <>
                    <CheckCircle2 className="mx-auto h-8 w-8 text-teal-600" />
                    <p className="mt-2 break-all text-sm font-extrabold text-slate-900 dark:text-white">{selectedFileName}</p>
                    <p className="mt-1 text-xs font-bold text-teal-700 dark:text-teal-300">Upload সম্পন্ন · বদলাতে click করুন</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="mx-auto h-8 w-8 text-orange-500" />
                    <p className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white">PDF এখানে ছাড়ুন অথবা click করুন</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">শুধু PDF · সর্বোচ্চ 100 MB</p>
                  </>
                )}
                {uploadStatus && !uploading && !selectedFileName && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">{uploadStatus}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-extrabold text-slate-800 dark:text-slate-200">PDF-এর নাম</label>
              <input
                type="text"
                required
                placeholder="File select করলে নাম automatic বসবে"
                value={formData.resourceTitle}
                onChange={(event) => setFormData({ ...formData, resourceTitle: event.target.value })}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAdvancedOpen((current) => !current)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
                aria-expanded={advancedOpen}
              >
                <Settings2 className="h-4 w-4" />
                Advanced options
                <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
              </button>
              {advancedOpen && (
                <div className="space-y-3 border-t border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">শিক্ষক / লেখক</label>
                    <input
                      type="text"
                      required
                      value={formData.writerName}
                      onChange={(event) => setFormData({ ...formData, writerName: event.target.value })}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                      <Link2 className="h-3.5 w-3.5" /> Public PDF link
                    </label>
                    <input
                      type="url"
                      placeholder="File আগে online থাকলে link paste করুন"
                      value={selectedFileName ? '' : fileUrl}
                      onChange={(event) => {
                        setSelectedFileName('');
                        setFileUrl(event.target.value);
                      }}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={uploading}
              className="h-12 w-full rounded-xl bg-orange-600 text-base font-extrabold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'PDF প্রকাশ করুন'}
            </Button>
          </form>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
