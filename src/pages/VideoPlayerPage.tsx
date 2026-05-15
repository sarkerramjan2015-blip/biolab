import { CheckCircle2, FileText, Maximize, Pause, Play, Settings, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Seo from '@/src/components/Seo';

const playlist = [
  { id: 1, title: 'কোষ বিভাজনের ভূমিকা ও প্রকারভেদ', duration: '24:10', current: false, watched: true },
  { id: 2, title: 'অ্যামাইটোসিস ও কোষ চক্র', duration: '35:20', current: false, watched: true },
  { id: 3, title: 'মাইটোসিস কোষ বিভাজনের পর্যায়সমূহ', duration: '45:10', current: true, watched: false },
  { id: 4, title: 'মিয়োসিস - প্রোফেজ ১ এর উপপর্যায়', duration: '52:05', current: false, watched: false },
  { id: 5, title: 'ক্রসিং ওভার ও এর গুরুত্ব', duration: '31:40', current: false, watched: false },
  { id: 6, title: 'অধ্যায় ২ - MCQ solve class', duration: '1:10:00', current: false, watched: false },
];

export default function VideoPlayerPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 xl:flex-row xl:gap-6">
      <Seo
        title="Solve Classes"
        description="Watch BIO LAB biology solve classes with playlists, class notes, and chapter-focused learning flow."
      />

      <div className="min-w-0 flex-1 space-y-5 sm:space-y-6">
        <div className="group relative aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-xl">
          <div className="bio-grid absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-teal-200 shadow-2xl backdrop-blur sm:h-20 sm:w-20">
              <Play className="h-8 w-8 fill-current sm:h-10 sm:w-10" />
            </div>
            <p className="px-4 text-base font-bold text-slate-100 sm:text-lg">কোষ বিভাজন - পর্ব ১</p>
            <p className="mt-2 px-4 text-xs font-medium text-slate-400 sm:text-sm">Solve class preview</p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-teal-600/90 shadow-xl backdrop-blur-sm transition-transform hover:scale-110 hover:bg-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-300/60 sm:h-20 sm:w-20"
              aria-label="Play solve class"
            >
              <Play className="ml-1 h-8 w-8 text-white sm:h-10 sm:w-10" fill="currentColor" />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 bg-gradient-to-t from-black/90 px-4 pb-4 pt-12 opacity-0 transition-opacity group-hover:opacity-100 sm:px-6">
            <div className="relative h-1.5 w-full cursor-pointer rounded-full bg-white/20">
              <div className="absolute left-0 top-0 h-full w-1/3 rounded-full bg-teal-500" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 text-white sm:gap-4">
                <Pause className="h-5 w-5 cursor-pointer hover:text-teal-300" fill="currentColor" />
                <SkipForward className="h-5 w-5 cursor-pointer hover:text-teal-300" />
                <div className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 cursor-pointer hover:text-teal-300" />
                  <span className="font-mono text-xs">12:30 / 45:10</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white sm:gap-4">
                <Settings className="h-5 w-5 cursor-pointer hover:text-teal-300" />
                <Maximize className="h-5 w-5 cursor-pointer hover:text-teal-300" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="mb-3 inline-block rounded-full bg-teal-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                উদ্ভিদবিজ্ঞান • অধ্যায় ২
              </div>
              <h1 className="text-xl font-extrabold leading-snug text-slate-900 dark:text-white md:text-2xl">
                মাইটোসিস কোষ বিভাজনের পর্যায়সমূহ
              </h1>
              <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
                প্রোফেজ, প্রো-মেটাফেজ, মেটাফেজ এবং অ্যানাফেজ দশার বিস্তারিত আলোচনা।
              </p>
            </div>
            <Button variant="outline" className="rounded-xl border-slate-200 text-xs font-bold uppercase dark:border-slate-700 sm:flex">
              <FileText className="mr-2 h-4 w-4" /> ক্লাস নোটস
            </Button>
          </div>
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col space-y-4 xl:w-96">
        <h3 className="flex items-center justify-between px-2 text-sm font-extrabold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          <span>প্লেলিস্ট</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800">
            ৩/১২
          </span>
        </h3>

        <Card className="flex max-h-[640px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-1.5 p-2">
              {playlist.map((video) => (
                <button
                  type="button"
                  key={video.id}
                  className={`group flex w-full cursor-pointer gap-3 rounded-2xl border p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300/70 ${
                    video.current
                      ? 'border-teal-100 bg-teal-50 dark:border-teal-900 dark:bg-teal-900/20'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-900">
                    <Play
                      className={`h-6 w-6 ${
                        video.current ? 'text-teal-400 opacity-100' : 'text-white opacity-0 transition-opacity group-hover:opacity-100'
                      }`}
                      fill="currentColor"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <h4 className={`mb-1 line-clamp-2 text-sm font-bold leading-tight ${video.current ? 'text-teal-700 dark:text-teal-300' : 'text-slate-700 dark:text-slate-300'}`}>
                      {video.id}. {video.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{video.duration}</span>
                      {video.watched && <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
