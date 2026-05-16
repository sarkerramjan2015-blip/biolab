import { useMemo, useState } from 'react';
import { ExternalLink, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Seo from '@/src/components/Seo';
import {
  usePracticals,
  type Practical,
  type PracticalInput,
} from '@/lib/practicals';
import type { ContentStatus, ExamLevel } from '@/src/data/exam';

type PracticalFormState = {
  title: string;
  level: ExamLevel;
  subject: string;
  description: string;
  sheetUrl: string;
  videoTitle: string;
  videoUrl: string;
  thumbnailUrl: string;
  status: ContentStatus;
};

const initialFormState: PracticalFormState = {
  title: '',
  level: 'SSC',
  subject: 'Biology',
  description: '',
  sheetUrl: '',
  videoTitle: '',
  videoUrl: '',
  thumbnailUrl: '',
  status: 'active',
};

function toFormState(practical: Practical): PracticalFormState {
  return {
    title: practical.title,
    level: practical.level,
    subject: practical.subject,
    description: practical.description,
    sheetUrl: practical.sheetUrl ?? '',
    videoTitle: practical.videoTitle ?? '',
    videoUrl: practical.videoUrl ?? '',
    thumbnailUrl: practical.thumbnailUrl ?? '',
    status: practical.status,
  };
}

function toPracticalInput(formState: PracticalFormState): PracticalInput {
  return {
    title: formState.title.trim(),
    level: formState.level,
    subject: formState.subject.trim(),
    description: formState.description.trim(),
    sheetUrl: formState.sheetUrl.trim() || undefined,
    videoTitle: formState.videoTitle.trim() || undefined,
    videoUrl: formState.videoUrl.trim() || undefined,
    thumbnailUrl: formState.thumbnailUrl.trim() || undefined,
    status: formState.status,
  };
}

export default function AdminPractical() {
  const { practicals, loading, addPractical, updatePractical, deletePractical } = usePracticals(true);
  const [formState, setFormState] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredPracticals = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return practicals.filter((practical) => (
      !normalizedSearch
      || practical.title.toLowerCase().includes(normalizedSearch)
      || practical.subject.toLowerCase().includes(normalizedSearch)
      || practical.description.toLowerCase().includes(normalizedSearch)
    ));
  }, [practicals, searchTerm]);

  const stats = {
    total: practicals.length,
    active: practicals.filter((practical) => practical.status === 'active').length,
    sheets: practicals.filter((practical) => practical.sheetUrl).length,
    videos: practicals.filter((practical) => practical.videoUrl).length,
  };

  const resetForm = () => {
    setEditingId(null);
    setFormState(initialFormState);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.title.trim() || !formState.subject.trim() || !formState.description.trim()) {
      window.alert('Title, subject, and description are required.');
      return;
    }

    if (!formState.sheetUrl.trim() && !formState.videoUrl.trim()) {
      window.alert('Add at least one sheet or video URL.');
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
      return;
    }

    try {
      await deletePractical(practical.id);
    } catch (error) {
      console.error('Failed to delete practical:', error);
      window.alert('Practical delete failed. Please check admin permissions.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Seo title="Admin Practical" description="Manage BIO LAB practical sheets and tutorial videos." />

      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-500">Practical Content</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">Practical Library</h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total', stats.total],
          ['Active', stats.active],
          ['Sheets', stats.sheets],
          ['Videos', stats.videos],
        ].map(([label, value]) => (
          <Card key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">{value}</p>
          </Card>
        ))}
      </section>

      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              {editingId ? 'Edit Practical' : 'New Practical'}
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
              {editingId ? 'Update Content' : 'Add Content'}
            </h2>
          </div>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl font-bold">
              Cancel edit
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1.5 text-sm font-semibold">
              <span>Title</span>
              <input required value={formState.title} onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" />
            </label>
            <label className="space-y-1.5 text-sm font-semibold">
              <span>Level</span>
              <select value={formState.level} onChange={(event) => setFormState((current) => ({ ...current, level: event.target.value as ExamLevel }))} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
                <option value="SSC">SSC</option>
                <option value="HSC">HSC</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-semibold">
              <span>Subject</span>
              <input required value={formState.subject} onChange={(event) => setFormState((current) => ({ ...current, subject: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" />
            </label>
          </div>

          <label className="block space-y-1.5 text-sm font-semibold">
            <span>Description</span>
            <textarea required value={formState.description} onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))} className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold">
              <span>Sheet URL</span>
              <input value={formState.sheetUrl} onChange={(event) => setFormState((current) => ({ ...current, sheetUrl: event.target.value }))} placeholder="https://..." className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" />
            </label>
            <label className="space-y-1.5 text-sm font-semibold">
              <span>Video Title</span>
              <input value={formState.videoTitle} onChange={(event) => setFormState((current) => ({ ...current, videoTitle: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" />
            </label>
            <label className="space-y-1.5 text-sm font-semibold">
              <span>Video URL</span>
              <input value={formState.videoUrl} onChange={(event) => setFormState((current) => ({ ...current, videoUrl: event.target.value }))} placeholder="https://..." className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" />
            </label>
            <label className="space-y-1.5 text-sm font-semibold">
              <span>Thumbnail URL</span>
              <input value={formState.thumbnailUrl} onChange={(event) => setFormState((current) => ({ ...current, thumbnailUrl: event.target.value }))} placeholder="https://..." className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" />
            </label>
          </div>

          <label className="block max-w-xs space-y-1.5 text-sm font-semibold">
            <span>Status</span>
            <select value={formState.status} onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value as ContentStatus }))} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <Button type="submit" disabled={saving} className="h-11 rounded-xl bg-orange-600 px-5 font-bold text-white hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            {editingId ? 'Update Practical' : 'Save Practical'}
          </Button>
        </form>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search title, subject, or description" className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 dark:border-slate-700 dark:bg-slate-950" />
        </label>
      </Card>

      <section className="space-y-3">
        {loading ? (
          <p className="text-sm font-semibold text-slate-500">Loading practicals...</p>
        ) : filteredPracticals.length === 0 ? (
          <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="font-semibold text-slate-600 dark:text-slate-300">No practicals found.</p>
          </Card>
        ) : (
          filteredPracticals.map((practical) => (
            <Card key={practical.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{practical.level}</span>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">{practical.subject}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${practical.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}>{practical.status}</span>
                  </div>
                  <h2 className="mt-3 text-lg font-extrabold text-slate-950 dark:text-white">{practical.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">{practical.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {practical.sheetUrl && (
                      <a href={practical.sheetUrl} target="_blank" rel="noreferrer">
                        <Button type="button" variant="outline" className="rounded-xl font-bold">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Sheet
                        </Button>
                      </a>
                    )}
                    {practical.videoUrl && (
                      <a href={practical.videoUrl} target="_blank" rel="noreferrer">
                        <Button type="button" variant="outline" className="rounded-xl font-bold">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Video
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => { setEditingId(practical.id); setFormState(toFormState(practical)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-xl font-bold">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button type="button" variant="outline" onClick={() => void updatePractical(practical.id, { status: practical.status === 'active' ? 'inactive' : 'active' })} className="rounded-xl font-bold">
                    {practical.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => void handleDelete(practical)} className="rounded-xl font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
