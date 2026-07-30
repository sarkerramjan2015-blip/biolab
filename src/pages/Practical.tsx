import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Microscope,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Seo from '@/src/components/Seo';
import { getPracticalNoteUrl, usePracticals, type Practical } from '@/lib/practicals';
import {
  practicalCatalog,
  type PracticalCatalogEntry,
  type PracticalSubject,
} from '@/src/data/practicalCatalog';
import type { ExamLevel } from '@/src/data/exam';

type PracticalDisplayItem = PracticalCatalogEntry & {
  firestoreId?: string;
  description: string;
  noteTitle?: string;
  noteUrl?: string;
  videoTitle?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
};

const subjectLabels: Record<PracticalSubject, string> = {
  Biology: 'SSC Biology',
  Botany: 'উদ্ভিদবিজ্ঞান',
  Zoology: 'প্রাণিবিজ্ঞান',
};

function normalizeTitle(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

function mergeCatalogWithContent(practicals: Practical[]): PracticalDisplayItem[] {
  const usedIds = new Set<string>();

  const catalogItems = practicalCatalog.flatMap((entry) => {
    const match = practicals.find((practical) => (
      practical.catalogId === entry.catalogId
      || (
        !practical.isCustom
        &&
        practical.level === entry.level
        && practical.subject === entry.subject
        && normalizeTitle(practical.title) === normalizeTitle(entry.title)
      )
    ));

    if (match) {
      usedIds.add(match.id);
    }

    if (match?.hidden) {
      return [];
    }

    return [{
      ...entry,
      firestoreId: match?.id,
      title: match?.title || entry.title,
      description: match?.description || 'এই practical-এর video lecture এবং special note এখানে পাওয়া যাবে।',
      noteTitle: match?.noteTitle,
      noteUrl: match ? getPracticalNoteUrl(match) : undefined,
      videoTitle: match?.videoTitle,
      videoUrl: match?.videoUrl,
      thumbnailUrl: match?.thumbnailUrl,
    }];
  });

  const customItems = practicals
    .filter((practical) => !usedIds.has(practical.id))
    .map((practical, index): PracticalDisplayItem => ({
      catalogId: practical.catalogId || `custom-${practical.id}`,
      firestoreId: practical.id,
      title: practical.title,
      level: practical.level,
      subject: practical.subject as PracticalSubject,
      sortOrder: practical.sortOrder ?? 1000 + index,
      description: practical.description,
      noteTitle: practical.noteTitle,
      noteUrl: getPracticalNoteUrl(practical),
      videoTitle: practical.videoTitle,
      videoUrl: practical.videoUrl,
      thumbnailUrl: practical.thumbnailUrl,
    }))
    .filter((practical) => (
      practical.subject in subjectLabels
      && !practicals.find((item) => item.id === practical.firestoreId)?.hidden
    ));

  return [...catalogItems, ...customItems];
}

export default function Practical() {
  const { practicals, loading } = usePracticals();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLevel = searchParams.get('level') as ExamLevel | null;
  const selectedSubject = searchParams.get('subject') as PracticalSubject | null;
  const selectedCatalogId = searchParams.get('item');
  const items = mergeCatalogWithContent(practicals);

  const selectedItem = items.find((item) => item.catalogId === selectedCatalogId);
  const visibleItems = items
    .filter((item) => item.level === selectedLevel && item.subject === selectedSubject)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const noteCount = items.filter((item) => item.noteUrl).length;
  const videoCount = items.filter((item) => item.videoUrl).length;

  const selectLevel = (level: ExamLevel) => {
    const next = new URLSearchParams();
    next.set('level', level);
    if (level === 'SSC') {
      next.set('subject', 'Biology');
    }
    setSearchParams(next);
  };

  const selectSubject = (subject: PracticalSubject) => {
    const next = new URLSearchParams(searchParams);
    next.set('subject', subject);
    next.delete('item');
    setSearchParams(next);
  };

  const selectItem = (catalogId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('item', catalogId);
    setSearchParams(next);
  };

  const clearItem = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('item');
    setSearchParams(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl space-y-8"
    >
      <Seo
        title="Biology Practical Lab"
        description="SSC and HSC biology practical video lectures and special notes."
      />

      <header className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="bio-grid bio-surface px-5 py-8 sm:px-8 md:px-10 md:py-10">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700 shadow-sm backdrop-blur dark:border-orange-900/60 dark:bg-slate-950/60 dark:text-orange-300">
                <Sparkles className="h-4 w-4" />
                Practical Lab
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight text-slate-950 dark:text-white sm:text-5xl">
                Biology practical শেখা হবে আরও সহজে।
              </h1>
              <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                Level ও subject বেছে syllabus-এর practical খুঁজে নাও। প্রতিটি practical-এর video lecture এবং special note একই জায়গায়।
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Practicals', value: practicalCatalog.length },
                { label: 'Notes', value: noteCount },
                { label: 'Videos', value: videoCount },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/70 bg-white/80 p-3 text-center shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="text-2xl font-extrabold text-slate-950 dark:text-white">{stat.value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="practical-level-heading" className="space-y-5">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-300">Step 01</p>
          <h2 id="practical-level-heading" className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
            তোমার Biology level বেছে নাও
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <LevelButton
            active={selectedLevel === 'HSC'}
            level="HSC"
            title="HSC Biology"
            subtitle="উদ্ভিদবিজ্ঞান ও প্রাণিবিজ্ঞান"
            count={practicalCatalog.filter((item) => item.level === 'HSC').length}
            onClick={() => selectLevel('HSC')}
          />
          <LevelButton
            active={selectedLevel === 'SSC'}
            level="SSC"
            title="SSC Biology"
            subtitle="সম্পূর্ণ Biology practical collection"
            count={practicalCatalog.filter((item) => item.level === 'SSC').length}
            onClick={() => selectLevel('SSC')}
          />
        </div>
      </section>

      {selectedLevel === 'HSC' && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60 sm:p-6"
        >
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">Step 02 · HSC Biology</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">বিষয় নির্বাচন করো</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SubjectButton
              active={selectedSubject === 'Botany'}
              subject="Botany"
              title="উদ্ভিদবিজ্ঞান"
              subtitle="HSC Biology ১ম পত্র"
              count={practicalCatalog.filter((item) => item.subject === 'Botany').length}
              onClick={() => selectSubject('Botany')}
            />
            <SubjectButton
              active={selectedSubject === 'Zoology'}
              subject="Zoology"
              title="প্রাণিবিজ্ঞান"
              subtitle="HSC Biology ২য় পত্র"
              count={practicalCatalog.filter((item) => item.subject === 'Zoology').length}
              onClick={() => selectSubject('Zoology')}
            />
          </div>
        </motion.section>
      )}

      {selectedLevel && selectedSubject && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                Step {selectedLevel === 'HSC' ? '03' : '02'} · Practical list
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">
                {subjectLabels[selectedSubject]} practical
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-500">{visibleItems.length}টি practical</p>
          </div>

          {loading ? (
            <Card className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
              <p className="font-semibold text-slate-500">Practical resource loading...</p>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {visibleItems.map((item, index) => {
                const active = selectedItem?.catalogId === item.catalogId;
                return (
                  <button
                    key={item.catalogId}
                    type="button"
                    aria-pressed={active}
                    onClick={() => selectItem(item.catalogId)}
                    className={`group flex min-h-32 items-start gap-4 rounded-2xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                      active
                        ? 'border-indigo-400 bg-indigo-50 ring-4 ring-indigo-500/10 dark:border-indigo-600 dark:bg-indigo-950/30'
                        : 'border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700'
                    }`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                      active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-extrabold leading-6 text-slate-950 dark:text-white">{item.title}</span>
                      <span className="mt-3 flex flex-wrap gap-2">
                        <AvailabilityPill available={Boolean(item.videoUrl)} label="Video" />
                        <AvailabilityPill available={Boolean(item.noteUrl)} label="Special Note" />
                      </span>
                    </span>
                    <ChevronRight className="mt-2 h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
                  </button>
                );
              })}
            </div>
          )}
        </motion.section>
      )}

      {selectedItem && (
        <motion.section
          id="practical-resources"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-teal-50 shadow-xl shadow-indigo-100/40 dark:border-indigo-900 dark:from-indigo-950/30 dark:via-slate-900 dark:to-teal-950/20 dark:shadow-none"
        >
          <div className="border-b border-indigo-100 p-5 dark:border-indigo-900/60 sm:p-7">
            <Button type="button" variant="ghost" onClick={clearItem} className="-ml-3 rounded-xl font-bold text-slate-600 dark:text-slate-300">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Practical list
            </Button>
            <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
              {selectedItem.level} · {subjectLabels[selectedItem.subject]}
            </p>
            <h2 className="mt-2 max-w-4xl text-2xl font-extrabold leading-tight text-slate-950 dark:text-white sm:text-3xl">
              {selectedItem.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
              {selectedItem.description}
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:p-7 md:grid-cols-2">
            <ResourceOption
              icon={<PlayCircle className="h-7 w-7" />}
              title="Video Lecture of This Practical"
              description={selectedItem.videoTitle || 'ধাপে ধাপে practical-টি video-তে শিখে নাও।'}
              available={Boolean(selectedItem.videoUrl)}
              href={selectedItem.videoUrl}
              tone="indigo"
            />
            <ResourceOption
              icon={<FileText className="h-7 w-7" />}
              title="Special Note"
              description={selectedItem.noteTitle || 'প্রয়োজনীয় উপকরণ, কার্যপদ্ধতি, পর্যবেক্ষণ ও ফলাফল।'}
              available={Boolean(selectedItem.noteUrl)}
              href={selectedItem.noteUrl
                ? `/reader?${new URLSearchParams({
                    pdf: selectedItem.noteUrl,
                    title: selectedItem.noteTitle || selectedItem.title,
                    subject: subjectLabels[selectedItem.subject],
                    chapter: 'Practical',
                  }).toString()}`
                : undefined}
              tone="teal"
              internal
            />
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}

function LevelButton({
  active,
  level,
  title,
  subtitle,
  count,
  onClick,
}: {
  active: boolean;
  level: ExamLevel;
  title: string;
  subtitle: string;
  count: number;
  onClick: () => void;
}) {
  const isHsc = level === 'HSC';
  return (
    <motion.button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className={`group relative min-h-40 overflow-hidden rounded-[1.6rem] border p-5 text-left shadow-xl transition-colors ${
        active
          ? isHsc
            ? 'border-teal-400 bg-gradient-to-br from-teal-600 via-cyan-600 to-indigo-700 text-white shadow-teal-500/20'
            : 'border-amber-400 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white shadow-orange-500/20'
          : isHsc
            ? 'border-teal-100 bg-white text-slate-950 hover:border-teal-300 dark:border-teal-950 dark:bg-slate-900 dark:text-white'
            : 'border-amber-100 bg-white text-slate-950 hover:border-amber-300 dark:border-amber-950 dark:bg-slate-900 dark:text-white'
      }`}
    >
      <span className={`absolute -right-10 -top-12 h-36 w-36 rounded-full blur-2xl ${active ? 'bg-white/20' : isHsc ? 'bg-teal-100/80 dark:bg-teal-950/50' : 'bg-amber-100/80 dark:bg-amber-950/50'}`} />
      <span className="relative flex h-full flex-col">
        <span className="flex items-start justify-between">
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${active ? 'border-white/25 bg-white/15' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'}`}>
            {isHsc ? <GraduationCap className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
          </span>
          <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </span>
        <span className="mt-4 text-2xl font-extrabold">{title}</span>
        <span className={`mt-1 text-sm font-semibold ${active ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{subtitle}</span>
        <span className={`mt-auto pt-3 text-[11px] font-bold uppercase tracking-[0.15em] ${active ? 'text-white/75' : 'text-slate-400'}`}>{count} Practicals</span>
      </span>
    </motion.button>
  );
}

function SubjectButton({
  active,
  subject,
  title,
  subtitle,
  count,
  onClick,
}: {
  active: boolean;
  subject: Exclude<PracticalSubject, 'Biology'>;
  title: string;
  subtitle: string;
  count: number;
  onClick: () => void;
}) {
  const isBotany = subject === 'Botany';
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`group flex items-center gap-4 rounded-2xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 ${
        active
          ? isBotany
            ? 'border-teal-400 bg-teal-600 text-white shadow-teal-500/20'
            : 'border-indigo-400 bg-indigo-600 text-white shadow-indigo-500/20'
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950'
      }`}
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-white/15' : isBotany ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'}`}>
        <Microscope className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-extrabold">{title}</span>
        <span className={`mt-0.5 block text-sm font-semibold ${active ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{subtitle} · {count}টি</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function AvailabilityPill({ available, label }: { available: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
      available
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
    }`}>
      {available ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
      {label}
    </span>
  );
}

function ResourceOption({
  icon,
  title,
  description,
  available,
  href,
  tone,
  internal = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  available: boolean;
  href?: string;
  tone: 'indigo' | 'teal';
  internal?: boolean;
}) {
  const content = (
    <Card className={`group h-full rounded-2xl border p-5 transition-all ${
      available
        ? tone === 'indigo'
          ? 'border-indigo-200 bg-white hover:-translate-y-1 hover:border-indigo-400 hover:shadow-xl dark:border-indigo-900 dark:bg-slate-900'
          : 'border-teal-200 bg-white hover:-translate-y-1 hover:border-teal-400 hover:shadow-xl dark:border-teal-900 dark:bg-slate-900'
        : 'border-slate-200 bg-slate-50/80 opacity-75 dark:border-slate-800 dark:bg-slate-950/50'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
          tone === 'indigo'
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
            : 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
        }`}>{icon}</span>
        <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] ${
          available
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
        }`}>{available ? 'Available' : 'Coming Soon'}</span>
      </div>
      <h3 className="mt-5 text-xl font-extrabold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      <div className={`mt-5 inline-flex items-center text-sm font-extrabold ${
        available
          ? tone === 'indigo' ? 'text-indigo-700 dark:text-indigo-300' : 'text-teal-700 dark:text-teal-300'
          : 'text-slate-400'
      }`}>
        {available ? (tone === 'indigo' ? 'Watch lecture' : 'Open special note') : 'Resource will be added'}
        {available && <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />}
      </div>
    </Card>
  );

  if (!available || !href) {
    return <div aria-disabled="true">{content}</div>;
  }

  return internal
    ? <Link to={href}>{content}</Link>
    : <a href={href} target="_blank" rel="noreferrer">{content}</a>;
}
