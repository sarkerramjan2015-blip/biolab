import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Book,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  Microscope,
  Play,
  SearchCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useChapters, ChapterDoc, useResourceControls, trackPdfDownload } from '@/lib/content';
import { useAuth } from '@/lib/auth';
import {
  botanyChapters as hardcodedBotany,
  sscBiologyChapters as hardcodedSsc,
  zoologyChapters as hardcodedZoology,
} from '../data/resources';
import { localAssetChapters } from '../data/localResources';
import Seo from '@/src/components/Seo';

type SubjectKey = 'botany' | 'zoology' | 'ssc';
type LevelKey = 'hsc' | 'ssc';
type HscSubjectKey = Exclude<SubjectKey, 'ssc'>;
type ColorTheme = 'teal' | 'indigo' | 'amber';

const subjectLabels: Record<SubjectKey, string> = {
  botany: 'উদ্ভিদবিজ্ঞান',
  zoology: 'প্রাণিবিজ্ঞান',
  ssc: 'SSC Biology',
};

function toChapterDocs(chapters: Omit<ChapterDoc, 'subject'>[], subject: SubjectKey): ChapterDoc[] {
  return chapters.map((chapter) => ({ ...chapter, subject }));
}

function mergeChapters(chapters: ChapterDoc[]) {
  const grouped = new Map<number, ChapterDoc>();

  chapters.forEach((chapter) => {
    const current = grouped.get(chapter.id);

    if (!current) {
      grouped.set(chapter.id, { ...chapter, writers: [...chapter.writers] });
      return;
    }

    const seen = new Set(
      current.writers.map((writer) => writer.pdfUrl ?? `${writer.name}-${writer.resourceTitle ?? ''}`),
    );
    const nextWriters = chapter.writers.filter((writer) => {
      const key = writer.pdfUrl ?? `${writer.name}-${writer.resourceTitle ?? ''}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    current.writers = [...current.writers, ...nextWriters];
    if (!current.title || current.title.startsWith('অধ্যায়')) {
      current.title = chapter.title;
    }
  });

  return [...grouped.values()].sort((a, b) => a.id - b.id);
}

function filterHiddenResources(chapters: ChapterDoc[], hiddenUrls: Set<string>) {
  return chapters
    .map((chapter) => ({
      ...chapter,
      writers: chapter.writers.filter((writer) => !writer.pdfUrl || !hiddenUrls.has(writer.pdfUrl)),
    }))
    .filter((chapter) => chapter.writers.length > 0);
}

export default function ResourceHub() {
  const { chapters } = useChapters();
  const { hiddenUrls } = useResourceControls();
  const [selectedLevel, setSelectedLevel] = useState<LevelKey | null>(null);
  const [selectedHscSubject, setSelectedHscSubject] = useState<HscSubjectKey | null>(null);

  const botanyChapters = filterHiddenResources(mergeChapters([
    ...toChapterDocs(localAssetChapters.botany, 'botany'),
    ...toChapterDocs(hardcodedBotany, 'botany'),
    ...chapters.filter((chapter) => chapter.subject === 'botany'),
  ]), hiddenUrls);
  const zoologyChapters = filterHiddenResources(mergeChapters([
    ...toChapterDocs(localAssetChapters.zoology, 'zoology'),
    ...toChapterDocs(hardcodedZoology, 'zoology'),
    ...chapters.filter((chapter) => chapter.subject === 'zoology'),
  ]), hiddenUrls);
  const sscBiologyChapters = filterHiddenResources(mergeChapters([
    ...toChapterDocs(localAssetChapters.ssc, 'ssc'),
    ...toChapterDocs(hardcodedSsc, 'ssc'),
    ...chapters.filter((chapter) => chapter.subject === 'ssc'),
  ]), hiddenUrls);

  const countPdfs = (items: ChapterDoc[]) => items.reduce(
    (sum, chapter) => sum + chapter.writers.filter((writer) => writer.pdfUrl).length,
    0,
  );
  const botanyPdfCount = countPdfs(botanyChapters);
  const zoologyPdfCount = countPdfs(zoologyChapters);
  const sscPdfCount = countPdfs(sscBiologyChapters);
  const hscPdfCount = botanyPdfCount + zoologyPdfCount;
  const pdfCount = hscPdfCount + sscPdfCount;

  const selectLevel = (level: LevelKey) => {
    setSelectedLevel(level);
    if (level === 'hsc') {
      setSelectedHscSubject(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mx-auto max-w-7xl space-y-8 sm:space-y-10"
    >
      <Seo
        title="স্পেশাল PDF কালেকশন"
        description="Browse BIO LAB chapter-wise botany, zoology, and SSC biology PDFs, solve sheets, and solve class videos."
      />
      <header className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="bio-grid bio-surface px-5 py-8 sm:px-8 md:px-10 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-700 shadow-sm backdrop-blur dark:border-teal-900/60 dark:bg-slate-950/60 dark:text-teal-300"
              >
                <SearchCheck className="h-4 w-4" />
                স্পেশাল PDF কালেকশন
              </motion.div>
              <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-5xl">
                Biology preparation-এর সব দরকারি resource এক স্পেশাল কালেকশনে।
              </h1>
              <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                HSC Botany, HSC Zoology এবং SSC Biology chapter অনুযায়ী compact ভাবে সাজানো। দ্রুত খুঁজে পড়া,
                reader-এ খোলা, আর download করার flow একই জায়গায় রাখা হয়েছে।
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'PDF', value: pdfCount },
                { label: 'HSC Chapters', value: botanyChapters.length + zoologyChapters.length },
                { label: 'SSC Chapters', value: sscBiologyChapters.length },
              ].map((item) => (
                <div
                  key={item.label}
                  className="archive-resource rounded-2xl border border-white/70 bg-white/80 p-3 text-center shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <p className="text-2xl font-extrabold text-slate-950 dark:text-white">{item.value}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="collection-level-heading" className="space-y-6">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-teal-600 dark:text-teal-300">
            Choose your level
          </p>
          <h2 id="collection-level-heading" className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
            কোন Biology collection দেখতে চাও?
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
            Level বেছে নাও—তারপর chapter অনুযায়ী সাজানো PDF, note এবং solve resource দেখো।
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <motion.button
            type="button"
            aria-pressed={selectedLevel === 'hsc'}
            onClick={() => selectLevel('hsc')}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.985 }}
            className={`group relative min-h-44 overflow-hidden rounded-[1.75rem] border p-5 text-left shadow-xl transition-colors duration-300 sm:p-6 ${
              selectedLevel === 'hsc'
                ? 'border-teal-400 bg-gradient-to-br from-teal-600 via-cyan-600 to-indigo-700 text-white shadow-teal-500/25 ring-4 ring-teal-500/10'
                : 'border-teal-100 bg-white text-slate-950 shadow-slate-200/60 hover:border-teal-300 dark:border-teal-950 dark:bg-slate-900 dark:text-white dark:shadow-black/20 dark:hover:border-teal-700'
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute -right-12 -top-12 h-40 w-40 rounded-full blur-2xl transition-opacity ${
                selectedLevel === 'hsc' ? 'bg-white/20' : 'bg-teal-200/60 dark:bg-teal-900/30'
              }`}
            />
            <span
              aria-hidden="true"
              className={`absolute -bottom-16 left-12 h-32 w-56 rounded-full blur-3xl ${
                selectedLevel === 'hsc' ? 'bg-indigo-400/35' : 'bg-cyan-100/70 dark:bg-cyan-950/30'
              }`}
            />
            <span className="relative flex h-full flex-col">
              <span className="flex items-start justify-between gap-4">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm ${
                    selectedLevel === 'hsc'
                      ? 'border-white/25 bg-white/15'
                      : 'border-teal-100 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-300'
                  }`}
                >
                  <GraduationCap className="h-6 w-6" />
                </span>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-transform duration-300 group-hover:translate-x-1 ${
                    selectedLevel === 'hsc'
                      ? 'border-white/25 bg-white/15'
                      : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </span>
              </span>
              <span className={`mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] ${
                selectedLevel === 'hsc' ? 'text-cyan-100' : 'text-teal-600 dark:text-teal-300'
              }`}>
                Higher Secondary
              </span>
              <span className="mt-1 text-2xl font-extrabold tracking-tight sm:text-[1.7rem]">HSC Biology</span>
              <span className={`mt-1.5 text-sm font-semibold ${
                selectedLevel === 'hsc' ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
              }`}>
                উদ্ভিদবিজ্ঞান ও প্রাণিবিজ্ঞান
              </span>
              <span className={`mt-auto pt-4 text-[11px] font-bold uppercase tracking-[0.15em] ${
                selectedLevel === 'hsc' ? 'text-white/75' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {botanyChapters.length + zoologyChapters.length} Chapters · {hscPdfCount} PDFs
              </span>
            </span>
          </motion.button>

          <motion.button
            type="button"
            aria-pressed={selectedLevel === 'ssc'}
            onClick={() => selectLevel('ssc')}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.985 }}
            className={`group relative min-h-44 overflow-hidden rounded-[1.75rem] border p-5 text-left shadow-xl transition-colors duration-300 sm:p-6 ${
              selectedLevel === 'ssc'
                ? 'border-amber-400 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white shadow-orange-500/25 ring-4 ring-amber-500/10'
                : 'border-amber-100 bg-white text-slate-950 shadow-slate-200/60 hover:border-amber-300 dark:border-amber-950 dark:bg-slate-900 dark:text-white dark:shadow-black/20 dark:hover:border-amber-700'
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute -right-12 -top-12 h-40 w-40 rounded-full blur-2xl ${
                selectedLevel === 'ssc' ? 'bg-white/20' : 'bg-amber-200/60 dark:bg-amber-900/30'
              }`}
            />
            <span
              aria-hidden="true"
              className={`absolute -bottom-16 left-12 h-32 w-56 rounded-full blur-3xl ${
                selectedLevel === 'ssc' ? 'bg-rose-400/35' : 'bg-orange-100/70 dark:bg-orange-950/30'
              }`}
            />
            <span className="relative flex h-full flex-col">
              <span className="flex items-start justify-between gap-4">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm ${
                    selectedLevel === 'ssc'
                      ? 'border-white/25 bg-white/15'
                      : 'border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300'
                  }`}
                >
                  <Book className="h-6 w-6" />
                </span>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-transform duration-300 group-hover:translate-x-1 ${
                    selectedLevel === 'ssc'
                      ? 'border-white/25 bg-white/15'
                      : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </span>
              </span>
              <span className={`mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] ${
                selectedLevel === 'ssc' ? 'text-amber-100' : 'text-amber-600 dark:text-amber-300'
              }`}>
                Secondary
              </span>
              <span className="mt-1 text-2xl font-extrabold tracking-tight sm:text-[1.7rem]">SSC Biology</span>
              <span className={`mt-1.5 text-sm font-semibold ${
                selectedLevel === 'ssc' ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
              }`}>
                এক বিষয়ের সম্পূর্ণ chapter collection
              </span>
              <span className={`mt-auto pt-4 text-[11px] font-bold uppercase tracking-[0.15em] ${
                selectedLevel === 'ssc' ? 'text-white/75' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {sscBiologyChapters.length} Chapters · {sscPdfCount} PDFs
              </span>
            </span>
          </motion.button>
        </div>

        {selectedLevel === 'hsc' && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 rounded-[2rem] border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-6"
          >
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
                  HSC Biology
                </p>
                <h3 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl">
                  এবার বিষয় নির্বাচন করো
                </h3>
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                ১ম পত্র অথবা ২য় পত্র
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <SubjectButton
                active={selectedHscSubject === 'botany'}
                icon={<GraduationCap className="h-6 w-6" />}
                title="উদ্ভিদবিজ্ঞান"
                subtitle="HSC Biology 1st Paper"
                meta={`${botanyChapters.length} Chapters · ${botanyPdfCount} PDFs`}
                colorTheme="teal"
                onClick={() => setSelectedHscSubject('botany')}
              />
              <SubjectButton
                active={selectedHscSubject === 'zoology'}
                icon={<Microscope className="h-6 w-6" />}
                title="প্রাণিবিজ্ঞান"
                subtitle="HSC Biology 2nd Paper"
                meta={`${zoologyChapters.length} Chapters · ${zoologyPdfCount} PDFs`}
                colorTheme="indigo"
                onClick={() => setSelectedHscSubject('zoology')}
              />
            </div>

            {selectedHscSubject === 'botany' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pt-1">
                <ChapterGrid chapters={botanyChapters} colorTheme="teal" />
              </motion.div>
            )}

            {selectedHscSubject === 'zoology' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pt-1">
                <ChapterGrid chapters={zoologyChapters} colorTheme="indigo" />
              </motion.div>
            )}
          </motion.div>
        )}

        {selectedLevel === 'ssc' && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 rounded-[2rem] border border-amber-200/80 bg-amber-50/40 p-4 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/10 sm:p-6"
          >
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">
                SSC Biology
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl">
                Chapter অনুযায়ী resource
              </h3>
            </div>
            <ChapterGrid chapters={sscBiologyChapters} colorTheme="amber" />
          </motion.div>
        )}
      </section>
    </motion.div>
  );
}

function SubjectButton({
  active,
  icon,
  title,
  subtitle,
  meta,
  colorTheme,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  meta: string;
  colorTheme: Exclude<ColorTheme, 'amber'>;
  onClick: () => void;
}) {
  const activeStyles = colorTheme === 'teal'
    ? 'border-teal-400 bg-teal-600 text-white shadow-teal-500/20 ring-teal-500/10'
    : 'border-indigo-400 bg-indigo-600 text-white shadow-indigo-500/20 ring-indigo-500/10';
  const idleStyles = colorTheme === 'teal'
    ? 'border-teal-100 bg-white text-slate-950 hover:border-teal-300 dark:border-teal-950 dark:bg-slate-950 dark:text-white dark:hover:border-teal-700'
    : 'border-indigo-100 bg-white text-slate-950 hover:border-indigo-300 dark:border-indigo-950 dark:bg-slate-950 dark:text-white dark:hover:border-indigo-700';
  const iconStyles = colorTheme === 'teal'
    ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
    : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300';

  return (
    <motion.button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className={`group flex min-h-24 items-center gap-3.5 rounded-2xl border p-3.5 text-left shadow-lg transition-colors duration-300 ${
        active ? `${activeStyles} ring-4` : `${idleStyles} shadow-slate-200/40 dark:shadow-black/20`
      }`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
        active ? 'bg-white/15 text-white' : iconStyles
      }`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-extrabold sm:text-lg">{title}</span>
        <span className={`mt-0.5 block text-xs font-semibold ${
          active ? 'text-white/75' : 'text-slate-500 dark:text-slate-400'
        }`}>
          {subtitle}
        </span>
        <span className={`mt-2 block text-[10px] font-extrabold uppercase tracking-[0.14em] ${
          active ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'
        }`}>
          {meta}
        </span>
      </span>
      <ChevronRight className={`h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 ${
        active ? 'text-white' : 'text-slate-400'
      }`} />
    </motion.button>
  );
}

function ChapterGrid({ chapters, colorTheme }: { chapters: ChapterDoc[]; colorTheme: ColorTheme }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-2.5">
      {chapters.map((chapter, index) => (
        <motion.div
          key={chapter.docId || `${chapter.subject}-${chapter.id}-${index}`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.04, 0.32), duration: 0.35 }}
        >
          <ChapterCard chapter={chapter} colorTheme={colorTheme} />
        </motion.div>
      ))}
    </div>
  );
}

function ChapterCard({ chapter, colorTheme }: { chapter: ChapterDoc; colorTheme: ColorTheme }) {
  const { user } = useAuth();
  const themeStyles = {
    teal: {
      card: 'hover:border-teal-300 hover:shadow-teal-500/10',
      gradient: 'from-teal-500 to-emerald-400',
      text: 'text-teal-700 dark:text-teal-300',
      badge: 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900',
    },
    indigo: {
      card: 'hover:border-indigo-300 hover:shadow-indigo-500/10',
      gradient: 'from-indigo-500 to-sky-400',
      text: 'text-indigo-700 dark:text-indigo-300',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900',
    },
    amber: {
      card: 'hover:border-amber-300 hover:shadow-amber-500/10',
      gradient: 'from-amber-500 to-rose-400',
      text: 'text-amber-700 dark:text-amber-300',
      badge: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    },
  }[colorTheme];

  const availableResources = chapter.writers.filter((writer) => writer.pdfUrl).length;
  const visibleWriters = chapter.writers.filter((writer) => writer.pdfUrl || writer.solve || writer.video);
  const pendingWriterCount = chapter.writers.length - visibleWriters.length;

  const handleDownload = (writer: ChapterDoc['writers'][number]) => {
    if (!writer.pdfUrl) {
      window.alert('এই chapter-এর PDF এখনো upload করা হয়নি।');
      return;
    }

    if (user) {
      trackPdfDownload({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        pdfUrl: writer.pdfUrl,
        pdfTitle: `${chapter.title} - ${writer.resourceTitle ?? writer.name}`,
        subject: chapter.subject,
        chapter: chapter.id,
      });
    }

    const link = document.createElement('a');
    link.href = writer.pdfUrl;
    link.download = `${chapter.title}_${writer.resourceTitle ?? writer.name}.pdf`;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className={`archive-card group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 ${themeStyles.card}`}>
      <div className={`h-1 w-full bg-gradient-to-r ${themeStyles.gradient}`} />
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <div className="mb-2.5 flex items-start justify-between gap-2.5">
          <div className="min-w-0">
            <p className={`mb-1 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] ${themeStyles.text}`}>
              <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${themeStyles.gradient}`} />
              অধ্যায় {chapter.id}
            </p>
            <h3 className="text-sm font-extrabold leading-snug tracking-normal text-slate-950 dark:text-white sm:text-base">
              {chapter.title}
            </h3>
            <p className="mt-1 text-[10px] font-semibold text-slate-500">
              {subjectLabels[chapter.subject as SubjectKey] ?? chapter.subject}
            </p>
          </div>
          <div className={`shrink-0 rounded-lg border px-2 py-1.5 text-center text-[10px] font-bold ${themeStyles.badge}`}>
            <span className="block text-sm leading-none">{availableResources}</span>
            Files
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          {visibleWriters.map((writer, index) => {
            const title = writer.resourceTitle ?? writer.name;
            const hasPdf = Boolean(writer.pdfUrl);
            const isPdf = !writer.fileType || writer.fileType === 'pdf';

            return (
              <div
                key={`${writer.pdfUrl ?? writer.name}-${index}`}
                className="archive-resource rounded-xl border border-slate-100 bg-slate-50/80 p-2 transition-colors hover:border-slate-200 hover:bg-white dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-950"
              >
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="line-clamp-1 text-[13px] font-bold leading-5 text-slate-900 dark:text-slate-100">
                      {title}
                    </h4>
                    <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                      {writer.resourceTitle ? writer.name : hasPdf ? 'PDF resource' : 'Coming soon'}
                      {writer.sizeLabel ? ` • ${writer.sizeLabel}` : ''}
                    </p>
                  </div>
                  {writer.resourceKind && (
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${themeStyles.badge}`}>
                      {writer.resourceKind}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {hasPdf && isPdf ? (
                    <Link
                      to={{
                        pathname: '/reader',
                        search: `?pdf=${encodeURIComponent(writer.pdfUrl!)}&title=${encodeURIComponent(`${chapter.title} - ${title}`)}&subject=${encodeURIComponent(chapter.subject)}&chapter=${encodeURIComponent(chapter.id)}`,
                      }}
                      state={{
                        pdfUrl: writer.pdfUrl,
                        title: `${chapter.title} - ${title}`,
                        subject: chapter.subject,
                        chapter: chapter.id,
                      }}
                      className="min-w-0"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 w-full rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <FileText className="mr-1.5 h-3.5 w-3.5" /> পড়ো
                      </Button>
                    </Link>
                  ) : hasPdf ? (
                    <a href={writer.pdfUrl} target="_blank" rel="noreferrer" className="min-w-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 w-full rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <FileText className="mr-1.5 h-3.5 w-3.5" /> Open
                      </Button>
                    </a>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 rounded-lg border border-dashed border-slate-300 bg-slate-100 text-[11px] font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-800/70"
                      disabled
                    >
                      Coming Soon
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(writer)}
                    disabled={!hasPdf}
                    className="h-7 w-full rounded-lg border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-600 hover:text-slate-950 disabled:opacity-35 dark:border-slate-700 dark:bg-slate-900 dark:hover:text-white"
                    aria-label={`Download ${title}`}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>

                {(writer.solve || writer.video) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {writer.solve && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Solve
                      </span>
                    )}
                    {writer.video && (
                      <Link to="/video">
                        <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2.5 py-1 text-[11px] font-bold text-white ${themeStyles.gradient}`}>
                          <Play className="h-3 w-3 fill-current" /> Video
                        </span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {pendingWriterCount > 0 && (
            <div className="archive-resource rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400">
              আরও {pendingWriterCount}টি resource শিগগিরই যোগ হবে
            </div>
          )}
        </div>

        <div className="mt-2.5 border-t border-slate-100 pt-2 dark:border-slate-800">
          <span className={`inline-flex items-center text-[10px] font-extrabold uppercase tracking-[0.16em] ${themeStyles.text}`}>
            Chapter Resources <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Card>
  );
}
