import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useChapters, ChapterDoc, useResourceControls } from '@/lib/content';
import {
  botanyChapters as hardcodedBotany,
  sscBiologyChapters as hardcodedSsc,
  zoologyChapters as hardcodedZoology,
} from '../data/resources';
import { localAssetChapters } from '../data/localResources';
import Seo from '@/src/components/Seo';

type SubjectKey = 'botany' | 'zoology' | 'ssc';
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
  const { chapters, loading } = useChapters();
  const { hiddenUrls } = useResourceControls();

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

  const pdfCount = [...botanyChapters, ...zoologyChapters, ...sscBiologyChapters].reduce(
    (sum, chapter) => sum + chapter.writers.filter((writer) => writer.pdfUrl).length,
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mx-auto max-w-7xl space-y-8 sm:space-y-10"
    >
      <Seo
        title="Resource Hub"
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
                Open Access Archive
              </motion.div>
              <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-5xl">
                সব Biology PDF, solve sheet আর class resource এক জায়গায়।
              </h1>
              <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                HSC Botany, HSC Zoology এবং SSC Biology chapter অনুযায়ী সাজানো হয়েছে। আপাতত asset folder-এর
                PDF গুলো সরাসরি reader ও download flow-তে যুক্ত করা আছে।
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'PDF', value: pdfCount },
                { label: 'HSC', value: botanyChapters.length + zoologyChapters.length },
                { label: 'SSC', value: sscBiologyChapters.length },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/70 bg-white/80 p-4 text-center shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60"
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

      {loading && (
        <div className="rounded-2xl border border-teal-100 bg-teal-50/80 px-4 py-3 text-sm font-bold text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
          Admin content sync হচ্ছে, local PDF archive ready আছে।
        </div>
      )}

      <Tabs defaultValue="botany" className="w-full">
          <TabsList className="sticky top-16 z-20 mb-8 flex h-auto w-full justify-start gap-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-lg shadow-slate-200/30 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none md:top-0 md:justify-center">
            <TabsTrigger value="botany" className="min-w-max rounded-xl px-5 py-3 text-sm font-bold transition-all data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/20 sm:px-8 sm:text-base">
              <span className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" /> উদ্ভিদবিজ্ঞান
              </span>
            </TabsTrigger>
            <TabsTrigger value="zoology" className="min-w-max rounded-xl px-5 py-3 text-sm font-bold transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 sm:px-8 sm:text-base">
              <span className="flex items-center gap-2">
                <Microscope className="h-5 w-5" /> প্রাণিবিজ্ঞান
              </span>
            </TabsTrigger>
            <TabsTrigger value="ssc" className="min-w-max rounded-xl px-5 py-3 text-sm font-bold transition-all data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/20 sm:px-8 sm:text-base">
              <span className="flex items-center gap-2">
                <Book className="h-5 w-5" /> SSC Biology
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="botany" className="focus:outline-none">
            <ChapterGrid chapters={botanyChapters} colorTheme="teal" />
          </TabsContent>

          <TabsContent value="zoology" className="focus:outline-none">
            <ChapterGrid chapters={zoologyChapters} colorTheme="indigo" />
          </TabsContent>

          <TabsContent value="ssc" className="focus:outline-none">
            <ChapterGrid chapters={sscBiologyChapters} colorTheme="amber" />
          </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function ChapterGrid({ chapters, colorTheme }: { chapters: ChapterDoc[]; colorTheme: ColorTheme }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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

  const availablePdfs = chapter.writers.filter((writer) => writer.pdfUrl).length;

  const handleDownload = (writer: ChapterDoc['writers'][number]) => {
    if (!writer.pdfUrl) {
      window.alert('এই chapter-এর PDF এখনো upload করা হয়নি।');
      return;
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
    <Card className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 ${themeStyles.card}`}>
      <div className={`h-1.5 w-full bg-gradient-to-r ${themeStyles.gradient}`} />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={`mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] ${themeStyles.text}`}>
              <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${themeStyles.gradient}`} />
              অধ্যায় {chapter.id}
            </p>
            <h3 className="text-xl font-extrabold leading-snug tracking-normal text-slate-950 dark:text-white sm:text-2xl">
              {chapter.title}
            </h3>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              {subjectLabels[chapter.subject as SubjectKey] ?? chapter.subject}
            </p>
          </div>
          <div className={`shrink-0 rounded-xl border px-3 py-2 text-center text-xs font-bold ${themeStyles.badge}`}>
            <span className="block text-base leading-none">{availablePdfs}</span>
            PDF
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {chapter.writers.map((writer, index) => {
            const title = writer.resourceTitle ?? writer.name;
            const hasPdf = Boolean(writer.pdfUrl);

            return (
              <div
                key={`${writer.pdfUrl ?? writer.name}-${index}`}
                className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition-colors hover:border-slate-200 hover:bg-white dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-950"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="line-clamp-2 text-sm font-bold leading-6 text-slate-900 dark:text-slate-100">
                      {title}
                    </h4>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {writer.resourceTitle ? writer.name : hasPdf ? 'PDF resource' : 'Coming soon'}
                      {writer.sizeLabel ? ` • ${writer.sizeLabel}` : ''}
                    </p>
                  </div>
                  {writer.resourceKind && (
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${themeStyles.badge}`}>
                      {writer.resourceKind}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {hasPdf ? (
                    <Link
                      to="/reader"
                      state={{ pdfUrl: writer.pdfUrl, title: `${chapter.title} - ${title}` }}
                      className="min-w-0"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <FileText className="mr-1.5 h-3.5 w-3.5" /> পড়ো
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 rounded-xl border border-dashed border-slate-300 bg-slate-100 text-xs font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-800/70"
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
                    className="h-10 w-full rounded-xl border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:text-slate-950 disabled:opacity-35 dark:border-slate-700 dark:bg-slate-900 dark:hover:text-white"
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
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <span className={`inline-flex items-center text-xs font-extrabold uppercase tracking-[0.16em] ${themeStyles.text}`}>
            Chapter Resources <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Card>
  );
}
