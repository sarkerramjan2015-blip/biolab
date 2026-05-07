import { Play, Pause, Volume2, SkipForward, Maximize, Settings, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Seo from '@/src/components/Seo';

export default function VideoPlayerPage() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6">
      <Seo
        title="Solve Classes"
        description="Watch BIO LAB biology solve classes with playlists, class notes, and chapter-focused learning flow."
      />
      {/* Video Section */}
      <div className="flex-1 space-y-6">
        {/* Mock Video Player */}
        <div className="aspect-video bg-black rounded-2xl overflow-hidden relative group shadow-lg">
          {/* Mock Video Poster */}
          <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center text-slate-500">
             <div className="text-6xl mb-4 opacity-50">🧬</div>
             <p className="text-lg font-medium">কোষ বিভাজন - পর্ব ১</p>
          </div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-teal-600/90 hover:bg-teal-500 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-xl backdrop-blur-sm">
               <Play className="w-10 h-10 text-white ml-2" fill="currentColor" />
            </div>
          </div>

          {/* Fake Player Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 pb-4 pt-12 px-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/20 rounded-full relative cursor-pointer">
              <div className="absolute top-0 left-0 h-full bg-teal-500 rounded-full w-1/3"></div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4 text-white">
                <Pause className="w-5 h-5 cursor-pointer hover:text-teal-400" fill="currentColor" />
                <SkipForward className="w-5 h-5 cursor-pointer hover:text-teal-400" />
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 cursor-pointer hover:text-teal-400" />
                  <span className="text-xs font-mono">12:30 / 45:10</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-white">
                <Settings className="w-5 h-5 cursor-pointer hover:text-teal-400" />
                <Maximize className="w-5 h-5 cursor-pointer hover:text-teal-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="inline-block px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-[10px] font-bold rounded uppercase tracking-wider mb-3">
                উদ্ভিদবিজ্ঞান • অধ্যায় ২
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-2">মাইটোসিস কোষ বিভাজনের পর্যায়সমূহ</h1>
              <p className="text-slate-500 text-sm">প্রোফেজ, প্রো-মেটাফেজ, মেটাফেজ এবং অ্যানাফেজ দশার বিস্তারিত আলোচনা।</p>
            </div>
            <Button variant="outline" className="hidden sm:flex rounded-lg gap-2 border-slate-200 dark:border-slate-700 text-xs font-bold uppercase">
              <FileText className="w-4 h-4" /> ক্লাস নোটস
            </Button>
          </div>
        </div>
      </div>

      {/* Playlist Sidebar */}
      <div className="w-full xl:w-96 flex flex-col shrink-0 space-y-4">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 px-2 content-center items-center flex justify-between uppercase tracking-widest">
          <span>প্লেলিস্ট (কোষ বিভাজন)</span>
          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600">৩/১২</span>
        </h3>
        
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex-1 max-h-[600px] flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-2 flex flex-col gap-1">
              {[
                { id: 1, title: 'কোষ বিভাজনের ভূমিকা ও প্রকারভেদ', duration: '24:10', current: false, watched: true },
                { id: 2, title: 'অ্যামাইটোসিস ও কোষ চক্র', duration: '35:20', current: false, watched: true },
                { id: 3, title: 'মাইটোসিস কোষ বিভাজনের পর্যায়সমূহ', duration: '45:10', current: true, watched: false },
                { id: 4, title: 'মিয়োসিস - প্রোফেজ ১ এর উপপর্যায়', duration: '52:05', current: false, watched: false },
                { id: 5, title: 'ক্রসিং ওভার ও এর গুরুত্ব', duration: '31:40', current: false, watched: false },
                { id: 6, title: 'অধ্যায় ২ - এমসিকিউ সলভ ক্লাস', duration: '1:10:00', current: false, watched: false },
              ].map((vid) => (
                <div 
                  key={vid.id}
                  className={`flex gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${
                    vid.current 
                      ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <div className="w-24 h-16 bg-slate-800 rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden group">
                    {vid.current ? (
                      <div className="w-full h-full bg-teal-600/20 absolute inset-0 flex items-center justify-center">
                        <Play className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="currentColor" />
                      </div>
                    ) : (
                       <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className={`text-sm font-medium line-clamp-2 leading-tight mb-1 ${vid.current ? 'text-teal-700 dark:text-teal-300' : 'text-slate-700 dark:text-slate-300'}`}>
                      {vid.id}. {vid.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{vid.duration}</span>
                      {vid.watched && <CheckCircle2 className="w-3 h-3 text-teal-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
