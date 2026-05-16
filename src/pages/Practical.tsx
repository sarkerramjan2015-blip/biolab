import { Download, ExternalLink, FileText, PlayCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Seo from '@/src/components/Seo';
import { usePracticals } from '@/lib/practicals';

function canEmbed(url?: string) {
  return Boolean(url && (url.includes('youtube.com/embed') || url.includes('drive.google.com/file')));
}

export default function Practical() {
  const { practicals, loading } = usePracticals();
  const sheets = practicals.filter((practical) => practical.sheetUrl);
  const videos = practicals.filter((practical) => practical.videoUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl"
    >
      <Seo
        title="Practical"
        description="BIO LAB biology practical sheets and video tutorials for SSC and HSC students."
      />

      <section className="premium-shell space-y-8 p-4 sm:p-6 lg:p-8">
        <header className="premium-panel rounded-2xl p-5 sm:p-7">
          <p className="premium-kicker text-xs font-extrabold uppercase tracking-[0.2em]">
            <Sparkles className="h-3.5 w-3.5" />
            Practical Lab
          </p>
          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white sm:text-5xl">
              Practical sheet ও video tutorial
            </h1>
            <div className="grid grid-cols-2 gap-2">
              <div className="premium-stat min-w-[110px] rounded-2xl px-4 py-3 text-center">
                <p className="text-2xl font-extrabold text-slate-950 dark:text-white">{sheets.length}</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Sheets
                </p>
              </div>
              <div className="premium-stat min-w-[110px] rounded-2xl px-4 py-3 text-center">
                <p className="text-2xl font-extrabold text-slate-950 dark:text-white">{videos.length}</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Videos
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
              Practical Sheet Section
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white">
              Sheets
            </h2>
          </div>

          {loading ? (
            <p className="text-sm font-semibold text-slate-500">Loading sheets...</p>
          ) : sheets.length === 0 ? (
            <Card className="premium-card premium-card-teal rounded-2xl p-6">
              <p className="font-bold text-slate-700 dark:text-slate-200">এখনও কোনো practical sheet publish করা হয়নি।</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sheets.map((practical) => (
                <Card
                  key={practical.id}
                  className="premium-card premium-card-teal rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-extrabold text-slate-950 dark:text-white">{practical.title}</h3>
                  <p className="mt-2 text-sm font-bold text-slate-500">
                    Class: {practical.level} | Subject: {practical.subject}
                  </p>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
                    {practical.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a href={practical.sheetUrl} target="_blank" rel="noreferrer">
                      <Button className="h-10 rounded-xl bg-teal-600 px-4 font-bold text-white hover:bg-teal-700">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Sheet
                      </Button>
                    </a>
                    <a href={practical.sheetUrl} download>
                      <Button variant="outline" className="h-10 rounded-xl font-bold">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-300">
              Practical Video Section
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white">
              Video Tutorials
            </h2>
          </div>

          {loading ? (
            <p className="text-sm font-semibold text-slate-500">Loading videos...</p>
          ) : videos.length === 0 ? (
            <Card className="premium-card premium-card-indigo rounded-2xl p-6">
              <p className="font-bold text-slate-700 dark:text-slate-200">এখনও কোনো practical video publish করা হয়নি।</p>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {videos.map((practical) => (
                <Card
                  key={`${practical.id}-video`}
                  className="premium-card premium-card-indigo rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-2xl"
                >
                  {canEmbed(practical.videoUrl) ? (
                    <div className="aspect-video overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      <iframe
                        title={practical.videoTitle ?? practical.title}
                        src={practical.videoUrl}
                        className="h-full w-full"
                        allowFullScreen
                      />
                    </div>
                  ) : practical.thumbnailUrl ? (
                    <img
                      src={practical.thumbnailUrl}
                      alt=""
                      className="aspect-video w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="grid aspect-video place-items-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                      <PlayCircle className="h-12 w-12" />
                    </div>
                  )}
                  <h3 className="mt-5 text-xl font-extrabold text-slate-950 dark:text-white">
                    {practical.videoTitle ?? practical.title}
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
                    {practical.description}
                  </p>
                  {practical.videoUrl && (
                    <a href={practical.videoUrl} target="_blank" rel="noreferrer">
                      <Button className="mt-5 h-10 rounded-xl bg-indigo-600 px-4 font-bold text-white hover:bg-indigo-700">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Watch Video
                      </Button>
                    </a>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      </section>
    </motion.div>
  );
}
