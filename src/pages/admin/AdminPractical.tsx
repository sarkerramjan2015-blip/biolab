import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  Youtube,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Seo from '@/src/components/Seo';
import {
  getPracticalNoteUrl,
  usePracticals,
  type Practical,
  type PracticalInput,
} from '@/lib/practicals';
import type { ContentStatus, ExamLevel } from '@/src/data/exam';
import {
  getCatalogEntries,
  practicalCatalog,
  type PracticalSubject,
} from '@/src/data/practicalCatalog';
import { uploadAdminFile } from '@/lib/adminUpload';

type PracticalFormState = {
  catalogId: string;
  isCustom: boolean;
  title: string;
  level: ExamLevel;
  subject: PracticalSubject;
  sortOrder: number;
  description: string;
  noteTitle: string;
  noteUrl: string;
  videoTitle: string;
  videoUrl: string;
  thumbnailUrl: string;
  status: ContentStatus;
};

type ManagedPractical = {
  key: string;
  catalogId?: string;
  originalTitle: string;
  title: string;
  level: ExamLevel;
  subject: PracticalSubject;
  sortOrder: number;
  isCustom: boolean;
  hidden: boolean;
  practical?: Practical;
};

const initialFormState: PracticalFormState = {
  catalogId: '',
  isCustom: false,
  title: '',
  level: 'SSC',
  subject: 'Biology',
  sortOrder: 1,
  description: '',
  noteTitle: '',
  noteUrl: '',
  videoTitle: '',
  videoUrl: '',
  thumbnailUrl: '',
  status: 'active',
};

function toFormState(practical: Practical): PracticalFormState {
  return {
    catalogId: practical.catalogId ?? '',
    isCustom: practical.isCustom ?? !practical.catalogId,
    title: practical.title,
    level: practical.level,
    subject: practical.subject as PracticalSubject,
    sortOrder: practical.sortOrder ?? 1,
    description: practical.description,
    noteTitle: practical.noteTitle ?? '',
    noteUrl: getPracticalNoteUrl(practical) ?? '',
    videoTitle: practical.videoTitle ?? '',
    videoUrl: practical.videoUrl ?? '',
    thumbnailUrl: practical.thumbnailUrl ?? '',
    status: practical.status,
  };
}

function toPracticalInput(formState: PracticalFormState): PracticalInput {
  return {
    catalogId: formState.catalogId || undefined,
    isCustom: formState.isCustom || undefined,
    title: formState.title.trim(),
    level: formState.level,
    subject: formState.subject.trim(),
    sortOrder: formState.sortOrder,
    description: formState.description.trim(),
    noteTitle: formState.noteTitle.trim() || undefined,
    noteUrl: formState.noteUrl.trim() || undefined,
    videoTitle: formState.videoTitle.trim() || undefined,
    videoUrl: formState.videoUrl.trim() || undefined,
    thumbnailUrl: formState.thumbnailUrl.trim() || undefined,
    status: formState.status,
  };
}

function getYouTubeVideoId(value: string) {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.replace(/^www\./, '');
    let videoId = '';

    if (hostname === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] ?? '';
    } else if (
      hostname === 'youtube.com'
      || hostname === 'm.youtube.com'
      || hostname === 'youtube-nocookie.com'
    ) {
      videoId = url.searchParams.get('v') ?? '';

      if (!videoId) {
        const parts = url.pathname.split('/').filter(Boolean);
        if (['embed', 'shorts', 'live'].includes(parts[0])) {
          videoId = parts[1] ?? '';
        }
      }
    }

    return /^[\w-]{11}$/.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

export default function AdminPractical() {
  const { practicals, addPractical, updatePractical, deletePractical } = usePracticals(true);
  const [formState, setFormState] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNameTools, setShowNameTools] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [managingKey, setManagingKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<'noteUrl' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [noteFileName, setNoteFileName] = useState('');
  const noteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.location.hash === '#new') {
      window.setTimeout(() => document.querySelector('#new-practical')?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, []);

  const uploadFile = async (
    file: File,
  ) => {
    setUploadingField('noteUrl');
    setUploadProgress(0);
    try {
      const result = await uploadAdminFile(file, {
        folder: 'practicals/special-notes',
        allowedTypes: ['application/pdf'],
        maxSizeMb: 30,
        onProgress: setUploadProgress,
      });
      setFormState((current) => ({ ...current, noteUrl: result.downloadUrl }));
      setNoteFileName(file.name);
    } catch (error) {
      console.error('Practical file upload failed:', error);
      window.alert(error instanceof Error ? error.message : 'ফাইল upload করা যায়নি।');
    } finally {
      setUploadingField(null);
    }
  };

  const customPracticalCount = practicals.filter((practical) => practical.isCustom || !practical.catalogId).length;
  const stats = {
    total: practicalCatalog.length + customPracticalCount,
    active: practicalCatalog.length
      + practicals.filter((practical) => practical.isCustom && practical.status === 'active' && !practical.hidden).length
      - practicals.filter((practical) => practical.catalogId && practical.hidden).length,
    notes: practicals.filter((practical) => getPracticalNoteUrl(practical)).length,
    videos: practicals.filter((practical) => practical.videoUrl).length,
  };
  const catalogEntries = getCatalogEntries(formState.level, formState.subject);
  const customEntries = practicals
    .filter((item) => (
      item.isCustom
      && item.level === formState.level
      && item.subject === formState.subject
    ))
    .sort((a, b) => (a.sortOrder ?? 1000) - (b.sortOrder ?? 1000));
  const selectedCatalogEntry = catalogEntries.find((entry) => entry.catalogId === formState.catalogId);
  const selectedPracticalRecord = formState.isCustom
    ? practicals.find((item) => item.id === editingId)
    : practicals.find((item) => item.catalogId === formState.catalogId);
  const selectedManagedItem: ManagedPractical | null = formState.title
    ? {
        key: selectedPracticalRecord?.id ?? (formState.catalogId || 'new-custom'),
        catalogId: formState.catalogId || undefined,
        originalTitle: selectedCatalogEntry?.title ?? formState.title,
        title: formState.title,
        level: formState.level,
        subject: formState.subject,
        sortOrder: formState.sortOrder,
        isCustom: formState.isCustom,
        hidden: selectedPracticalRecord?.hidden ?? false,
        practical: selectedPracticalRecord,
      }
    : null;

  const youtubeVideoId = formState.videoUrl.trim()
    ? getYouTubeVideoId(formState.videoUrl)
    : null;

  const resetForm = () => {
    setEditingId(null);
    setFormState(initialFormState);
    setNoteFileName('');
    setShowNameTools(false);
    setRenameValue('');
  };

  const createOfficialRecord = (entry: ManagedPractical, overrides: Partial<PracticalInput>): PracticalInput => ({
    catalogId: entry.catalogId,
    title: entry.title,
    level: entry.level,
    subject: entry.subject,
    sortOrder: entry.sortOrder,
    description: 'এই practical-এর video lecture এবং special note এখানে পাওয়া যাবে।',
    status: 'active',
    ...overrides,
  });

  const saveManagedChange = async (item: ManagedPractical, changes: Partial<PracticalInput>) => {
    setManagingKey(item.key);
    try {
      if (item.practical) {
        await updatePractical(item.practical.id, changes);
      } else if (item.isCustom) {
        setFormState((current) => ({
          ...current,
          title: changes.title ?? current.title,
        }));
      } else {
        await addPractical(createOfficialRecord(item, changes));
      }
    } catch (error) {
      console.error('Failed to update practical list:', error);
      window.alert('পরিবর্তন save করা যায়নি। Admin login ও internet connection দেখুন।');
    } finally {
      setManagingKey(null);
    }
  };

  const saveRenamedPractical = async (item: ManagedPractical) => {
    const nextTitle = renameValue.trim();
    if (!nextTitle) {
      window.alert('Practical-এর নাম খালি রাখা যাবে না।');
      return;
    }
    await saveManagedChange(item, { title: nextTitle });
    setFormState((current) => ({ ...current, title: nextTitle }));
    setShowNameTools(false);
    setRenameValue('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.title.trim() || !formState.subject.trim()) {
      window.alert('Practical-এর নাম নির্বাচন করুন অথবা নতুন নাম লিখুন।');
      return;
    }

    if (formState.videoUrl.trim() && !getYouTubeVideoId(formState.videoUrl)) {
      window.alert('সঠিক YouTube link দিন। Video-টি YouTube-এ Unlisted করে Share link paste করুন।');
      return;
    }

    setSaving(true);

    try {
      const input = toPracticalInput(formState);

      if (editingId) {
        await updatePractical(editingId, input);
      } else {
        await addPractical(input);
      }

      resetForm();
    } catch (error) {
      console.error('Failed to save practical:', error);
      window.alert('Practical save failed. Please check admin permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (practical: Practical) => {
    const confirmed = window.confirm(`Delete "${practical.title}" permanently?`);

    if (!confirmed) {
      return false;
    }

    try {
      await deletePractical(practical.id);
      return true;
    } catch (error) {
      console.error('Failed to delete practical:', error);
      window.alert('Practical delete failed. Please check admin permissions.');
      return false;
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Seo title="Admin Practical" description="Manage BIO LAB practical sheets and tutorial videos." />

      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-500">প্র্যাকটিক্যাল ক্লাস</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">সহজে practical class প্রকাশ করুন</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
          Practical বেছে নিন, PDF upload করুন, YouTube link দিন—তারপর প্রকাশ করুন।
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          ['মোট practical', stats.total],
          ['প্রকাশিত', stats.active],
          ['Special Notes', stats.notes],
          ['Video', stats.videos],
        ].map(([label, value]) => (
          <Card key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500 sm:text-xs sm:tracking-[0.16em]">{label}</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">{value}</p>
          </Card>
        ))}
      </section>

      <Card id="new-practical" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              {editingId ? 'Practical পরিবর্তন করুন' : 'ধাপ ১ — নতুন practical'}
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
              {editingId ? 'তথ্য আপডেট করুন' : 'প্রয়োজনীয় তথ্য দিন'}
            </h2>
          </div>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl font-bold">
              Cancel edit
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50 sm:p-5">
            <div className="mb-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-600">ধাপ ১</p>
              <h3 className="mt-1 text-lg font-extrabold text-slate-950 dark:text-white">কোন practical প্রকাশ করবেন?</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5 text-sm font-semibold">
                <span>শ্রেণি</span>
                <select
                  value={formState.level}
                  onChange={(event) => {
                    const level = event.target.value as ExamLevel;
                    setEditingId(null);
                    setShowNameTools(false);
                    setFormState((current) => ({
                      ...current,
                      level,
                      subject: level === 'SSC' ? 'Biology' : 'Botany',
                      catalogId: '',
                      isCustom: false,
                      title: '',
                      sortOrder: 1,
                    }));
                  }}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="SSC">SSC Biology</option>
                  <option value="HSC">HSC Biology</option>
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-semibold">
                <span>বিষয়</span>
                <select
                  value={formState.subject}
                  onChange={(event) => {
                    setEditingId(null);
                    setShowNameTools(false);
                    setFormState((current) => ({
                      ...current,
                      subject: event.target.value as PracticalSubject,
                      catalogId: '',
                      isCustom: false,
                      title: '',
                      sortOrder: 1,
                    }));
                  }}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900"
                >
                  {formState.level === 'SSC' ? (
                    <option value="Biology">Biology</option>
                  ) : (
                    <>
                      <option value="Botany">উদ্ভিদবিজ্ঞান</option>
                      <option value="Zoology">প্রাণিবিজ্ঞান</option>
                    </>
                  )}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-semibold md:col-span-2">
                <span>Practical-এর নাম</span>
                <select
                  required
                  value={formState.isCustom
                    ? editingId ? `custom:${editingId}` : '__custom__'
                    : formState.catalogId}
                  onChange={(event) => {
                    setShowNameTools(false);
                    setRenameValue('');

                    if (event.target.value === '__custom__') {
                      setEditingId(null);
                      setFormState((current) => ({
                        ...current,
                        catalogId: '',
                        isCustom: true,
                        title: '',
                        sortOrder: catalogEntries.length + 1,
                        description: 'এই practical-এর video lecture এবং special note এখানে পাওয়া যাবে।',
                        noteTitle: '',
                        videoTitle: '',
                      }));
                      return;
                    }

                    if (event.target.value.startsWith('custom:')) {
                      const customId = event.target.value.slice('custom:'.length);
                      const existingCustom = practicals.find((item) => item.id === customId);
                      if (existingCustom) {
                        setEditingId(existingCustom.id);
                        setFormState(toFormState(existingCustom));
                        setNoteFileName('');
                      }
                      return;
                    }

                    const selected = catalogEntries.find((entry) => entry.catalogId === event.target.value);
                    const existing = practicals.find((item) => item.catalogId === event.target.value);

                    if (existing) {
                      setEditingId(existing.id);
                      setFormState(toFormState(existing));
                      setNoteFileName('');
                      return;
                    }

                    setEditingId(null);
                    setFormState((current) => ({
                      ...current,
                      catalogId: event.target.value,
                      isCustom: false,
                      title: selected?.title ?? '',
                      sortOrder: selected?.sortOrder ?? 1,
                      description: selected
                        ? 'এই practical-এর video lecture এবং special note এখানে পাওয়া যাবে।'
                        : '',
                      noteTitle: selected ? `${selected.title} — Special Note` : '',
                      videoTitle: selected ? `${selected.title} — Video Lecture` : '',
                    }));
                  }}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="">তালিকা থেকে practical বেছে নিন</option>
                  {catalogEntries.map((entry) => {
                    const savedEntry = practicals.find((item) => item.catalogId === entry.catalogId);
                    return (
                      <option key={entry.catalogId} value={entry.catalogId}>
                        {entry.sortOrder}. {savedEntry?.title || entry.title}{savedEntry?.hidden ? ' (Hidden)' : ''}
                      </option>
                    );
                  })}
                  {customEntries.length > 0 && (
                    <optgroup label="Admin-এর যোগ করা practical">
                      {customEntries.map((entry) => (
                        <option key={entry.id} value={`custom:${entry.id}`}>
                          {entry.title}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <option value="__custom__">＋ নতুন practical-এর নাম যোগ করুন</option>
                </select>
              </label>
            </div>
            {formState.isCustom && !editingId && (
              <label className="mt-4 block space-y-1.5 text-sm font-semibold">
                <span>নতুন practical-এর নাম</span>
                <input
                  required
                  value={formState.title}
                  onChange={(event) => setFormState((current) => ({
                    ...current,
                    title: event.target.value,
                    noteTitle: event.target.value ? `${event.target.value} — Special Note` : '',
                    videoTitle: event.target.value ? `${event.target.value} — Video Lecture` : '',
                  }))}
                  placeholder="Practical-এর নাম লিখুন"
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
            )}
            {selectedManagedItem && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold uppercase tracking-[0.14em]">নির্বাচিত practical</p>
                      <p className="mt-1 text-sm font-bold">{formState.title}</p>
                      {selectedManagedItem.hidden && (
                        <p className="mt-1 text-xs font-extrabold text-amber-700 dark:text-amber-300">এই practical এখন website-এ hidden</p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowNameTools((current) => !current);
                      setRenameValue(formState.title);
                    }}
                    className="shrink-0 rounded-xl border-emerald-300 bg-white font-bold text-emerald-800 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit name
                  </Button>
                </div>

                {showNameTools && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-3 dark:border-emerald-900 dark:bg-slate-900">
                    <label className="block space-y-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      <span>Practical-এর নাম পরিবর্তন করুন</span>
                      <input
                        value={renameValue}
                        onChange={(event) => setRenameValue(event.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
                      />
                    </label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        disabled={managingKey === selectedManagedItem.key}
                        onClick={() => void saveRenamedPractical(selectedManagedItem)}
                        className="rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700"
                      >
                        {managingKey === selectedManagedItem.key
                          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          : <Save className="mr-2 h-4 w-4" />}
                        নাম Save
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={managingKey === selectedManagedItem.key || (selectedManagedItem.isCustom && !selectedManagedItem.practical)}
                        onClick={() => void saveManagedChange(selectedManagedItem, {
                          hidden: !selectedManagedItem.hidden,
                          status: 'active',
                        })}
                        className="rounded-xl font-bold"
                      >
                        {selectedManagedItem.hidden
                          ? <Eye className="mr-2 h-4 w-4" />
                          : <EyeOff className="mr-2 h-4 w-4" />}
                        {selectedManagedItem.hidden ? 'Show' : 'Hide'}
                      </Button>
                      {!selectedManagedItem.isCustom && formState.title !== selectedManagedItem.originalTitle && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setRenameValue(selectedManagedItem.originalTitle);
                            void saveManagedChange(selectedManagedItem, { title: selectedManagedItem.originalTitle });
                            setFormState((current) => ({ ...current, title: selectedManagedItem.originalTitle }));
                            setShowNameTools(false);
                          }}
                          className="rounded-xl font-bold"
                        >
                          মূল নাম
                        </Button>
                      )}
                      {selectedManagedItem.isCustom && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={async () => {
                            if (!selectedManagedItem.practical) {
                              resetForm();
                              return;
                            }
                            const deleted = await handleDelete(selectedManagedItem.practical);
                            if (deleted) resetForm();
                          }}
                          className="rounded-xl font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      )}
                      <Button type="button" variant="ghost" onClick={() => setShowNameTools(false)} className="rounded-xl font-bold text-slate-600">
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-600">ধাপ ২</p>
              <h3 className="mt-1 text-lg font-extrabold text-slate-950 dark:text-white">PDF ও video যোগ করুন</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">দুটির যেকোনো একটি অথবা দুটিই যোগ করা যাবে।</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5 dark:border-teal-900 dark:bg-teal-950/20">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-slate-950 dark:text-white">Special Note PDF</h4>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-500">শুধু PDF file বেছে নিলেই upload হয়ে যাবে। সর্বোচ্চ ৩০ MB।</p>
                  </div>
                </div>

                {formState.noteUrl ? (
                  <div className="mt-5 rounded-xl border border-emerald-200 bg-white p-4 dark:border-emerald-900 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-5 w-5" />
                      PDF যোগ হয়েছে
                    </div>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">{noteFileName || 'আগের upload করা PDF'}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={() => noteInputRef.current?.click()} className="rounded-xl font-bold">
                        PDF বদলান
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setFormState((current) => ({ ...current, noteUrl: '' }));
                          setNoteFileName('');
                        }}
                        className="rounded-xl font-bold text-red-600"
                      >
                        সরিয়ে দিন
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={Boolean(uploadingField)}
                    onClick={() => noteInputRef.current?.click()}
                    className="mt-5 h-12 w-full rounded-xl border-teal-300 bg-white font-extrabold text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:bg-slate-900 dark:text-teal-300"
                  >
                    {uploadingField ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
                    {uploadingField ? `PDF upload হচ্ছে… ${uploadProgress}%` : 'PDF file বেছে নিন'}
                  </Button>
                )}
                <input
                  ref={noteInputRef}
                  type="file"
                  className="hidden"
                  accept="application/pdf,.pdf"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadFile(file);
                    event.target.value = '';
                  }}
                />
              </Card>

              <Card className="rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-950 dark:bg-red-950/20">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
                    <Youtube className="h-6 w-6" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-slate-950 dark:text-white">YouTube Video</h4>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                      YouTube-এ video-টি <strong>Unlisted</strong> করুন, তারপর Share link paste করুন।
                    </p>
                  </div>
                </div>
                <label className="mt-5 block space-y-1.5 text-sm font-semibold">
                  <span>YouTube link</span>
                  <input
                    type="url"
                    value={formState.videoUrl}
                    onChange={(event) => setFormState((current) => ({ ...current, videoUrl: event.target.value }))}
                    placeholder="https://youtu.be/..."
                    className={`h-12 w-full rounded-xl border bg-white px-3 dark:bg-slate-900 ${
                      formState.videoUrl.trim() && !youtubeVideoId
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                </label>
                {formState.videoUrl.trim() && (
                  <div className={`mt-3 flex items-center gap-2 rounded-xl p-3 text-sm font-bold ${
                    youtubeVideoId
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                  }`}>
                    {youtubeVideoId
                      ? <><CheckCircle2 className="h-5 w-5" /> YouTube link ঠিক আছে</>
                      : <><Youtube className="h-5 w-5" /> সঠিক YouTube Share link দিন</>}
                  </div>
                )}
              </Card>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
            <label className="block w-full max-w-sm space-y-1.5 text-sm font-semibold">
              <span>ওয়েবসাইটে দেখাবে?</span>
              <select value={formState.status} onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value as ContentStatus }))} className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
                <option value="active">হ্যাঁ, এখনই প্রকাশ করুন</option>
                <option value="inactive">না, draft হিসেবে রাখুন</option>
              </select>
            </label>

            <Button type="submit" disabled={saving || Boolean(uploadingField)} className="h-12 rounded-xl bg-orange-600 px-6 font-extrabold text-white hover:bg-orange-700">
              {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
              {editingId ? 'পরিবর্তন সেভ করুন' : 'Practical প্রকাশ করুন'}
            </Button>
          </section>
        </form>
      </Card>

      {/* Practical management actions now live beside the selected practical name.
      <section className="space-y-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Practical Management</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">Practical-এর নাম ও visibility</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">Syllabus practical hide করা যাবে; নিজের যোগ করা practical permanently delete করা যাবে।</p>
        </div>

        <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="space-y-1.5 text-sm font-semibold">
              <span>শ্রেণি</span>
              <select
                value={manageLevel}
                onChange={(event) => {
                  const level = event.target.value as ExamLevel;
                  setManageLevel(level);
                  setManageSubject(level === 'SSC' ? 'Biology' : 'Botany');
                }}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="SSC">SSC Biology</option>
                <option value="HSC">HSC Biology</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-semibold">
              <span>বিষয়</span>
              <select
                value={manageSubject}
                onChange={(event) => setManageSubject(event.target.value as PracticalSubject)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
              >
                {manageLevel === 'SSC' ? (
                  <option value="Biology">Biology</option>
                ) : (
                  <>
                    <option value="Botany">উদ্ভিদবিজ্ঞান</option>
                    <option value="Zoology">প্রাণিবিজ্ঞান</option>
                  </>
                )}
              </select>
            </label>
            <label className="relative block self-end">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Practical-এর নাম খুঁজুন"
                className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
          </div>
        </Card>

        {loading ? (
          <p className="text-sm font-semibold text-slate-500">Practical list loading...</p>
        ) : managedPracticals.length === 0 ? (
          <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="font-semibold text-slate-600 dark:text-slate-300">কোনো practical পাওয়া যায়নি।</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {managedPracticals.map((item) => {
              const isRenaming = renamingKey === item.key;
              const isManaging = managingKey === item.key;
              const noteUrl = item.practical ? getPracticalNoteUrl(item.practical) : undefined;

              return (
                <Card key={item.key} className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900 sm:p-5 ${
                  item.hidden
                    ? 'border-slate-200 opacity-70 dark:border-slate-800'
                    : 'border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {item.sortOrder}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.13em] ${
                          item.isCustom
                            ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        }`}>
                          {item.isCustom ? 'Admin Added' : 'Syllabus'}
                        </span>
                        {item.hidden && (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.13em] text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                            Hidden
                          </span>
                        )}
                      </div>

                      {isRenaming ? (
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(event) => setRenameValue(event.target.value)}
                            className="h-11 min-w-0 flex-1 rounded-xl border border-indigo-300 bg-white px-3 font-bold dark:border-indigo-700 dark:bg-slate-950"
                          />
                          <Button type="button" disabled={isManaging} onClick={() => void saveRenamedPractical(item)} className="rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700">
                            {isManaging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            নাম Save করুন
                          </Button>
                          <Button type="button" variant="ghost" onClick={() => setRenamingKey(null)} className="rounded-xl font-bold">Cancel</Button>
                        </div>
                      ) : (
                        <h3 className="mt-3 text-base font-extrabold leading-6 text-slate-950 dark:text-white sm:text-lg">{item.title}</h3>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {noteUrl && (
                          <a href={noteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-300">
                            <ExternalLink className="h-3.5 w-3.5" /> Note
                          </a>
                        )}
                        {item.practical?.videoUrl && (
                          <a href={item.practical.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-red-700 dark:text-red-300">
                            <ExternalLink className="h-3.5 w-3.5" /> Video
                          </a>
                        )}
                      </div>
                    </div>

                    {!isRenaming && (
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={() => editPracticalContent(item)} className="rounded-xl font-bold">
                          <Pencil className="mr-2 h-4 w-4" />
                          Content
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setRenamingKey(item.key);
                            setRenameValue(item.title);
                          }}
                          className="rounded-xl font-bold"
                        >
                          নাম Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isManaging}
                          onClick={() => void saveManagedChange(item, { hidden: !item.hidden, status: 'active' })}
                          className="rounded-xl font-bold"
                        >
                          {item.hidden ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
                          {item.hidden ? 'Show' : 'Hide'}
                        </Button>
                        {!item.isCustom && item.title !== item.originalTitle && (
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={isManaging}
                            onClick={() => void saveManagedChange(item, { title: item.originalTitle })}
                            className="rounded-xl font-bold text-indigo-700 dark:text-indigo-300"
                          >
                            মূল নাম
                          </Button>
                        )}
                        {item.isCustom && item.practical && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => void handleDelete(item.practical!)}
                            className="rounded-xl font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
      */}
    </div>
  );
}
