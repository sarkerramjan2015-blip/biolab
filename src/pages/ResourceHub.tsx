import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, GraduationCap, Microscope, Book, Download, Play, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useChapters, ChapterDoc } from '@/lib/content';
import { botanyChapters as hardcodedBotany, zoologyChapters as hardcodedZoology, sscBiologyChapters as hardcodedSsc } from '../data/resources';
import Seo from '@/src/components/Seo';

export default function ResourceHub() {
  const { chapters, loading } = useChapters();

  // Merge hardcoded resources with any dynamically added chapters
  const dynamicBotany = chapters.filter(c => c.subject === 'botany');
  const botanyChapters = [...hardcodedBotany.map(c => ({...c, subject: 'botany'} as ChapterDoc)), ...dynamicBotany];
  
  const dynamicZoology = chapters.filter(c => c.subject === 'zoology');
  const zoologyChapters = [...hardcodedZoology.map(c => ({...c, subject: 'zoology'} as ChapterDoc)), ...dynamicZoology];
  
  const dynamicSsc = chapters.filter(c => c.subject === 'ssc');
  const sscBiologyChapters = [...hardcodedSsc.map(c => ({...c, subject: 'ssc'} as ChapterDoc)), ...dynamicSsc];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-12"
    >
      <Seo
        title="Resource Hub"
        description="Browse BIO LAB chapter-wise botany, zoology, and SSC biology PDFs, solve sheets, and solve class videos."
      />
      <header className="mb-12 relative">
        <div className="absolute -inset-x-8 -inset-y-8 bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-purple-500/10 blur-3xl rounded-full opacity-50 z-0"></div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 dark:bg-slate-800 text-white shadow-lg mb-6 shadow-slate-900/20"
          >
            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="text-sm font-bold tracking-widest uppercase">Open Access Archive</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">স্মার্ট <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-600">আর্কাইভ</span></h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed">সম্পূর্ণ দাগানো বইয়ের পিডিএফ, অধ্যায়ভিত্তিক সলভ শিট এবং এক্সক্লুসিভ সলভ ক্লাস।</p>
        </div>
      </header>

      {loading && chapters.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : (
        <Tabs defaultValue="botany" className="w-full">
          <TabsList className="mb-12 w-full justify-center overflow-x-auto h-auto p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-20 shadow-xl shadow-slate-200/20 dark:shadow-none">
            <TabsTrigger value="botany" className="rounded-xl px-8 py-4 text-base font-bold data-[state=active]:bg-teal-600 data-[state=active]:text-white dark:data-[state=active]:bg-teal-500 data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all duration-500">
              <span className="flex items-center gap-2"><GraduationCap className="w-5 h-5" /> উদ্ভিদবিজ্ঞান</span>
            </TabsTrigger>
            <TabsTrigger value="zoology" className="rounded-xl px-8 py-4 text-base font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-500 data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/30 transition-all duration-500">
              <span className="flex items-center gap-2"><Microscope className="w-5 h-5" /> প্রাণীবিজ্ঞান</span>
            </TabsTrigger>
            <TabsTrigger value="ssc" className="rounded-xl px-8 py-4 text-base font-bold data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:data-[state=active]:bg-purple-500 data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 transition-all duration-500">
              <span className="flex items-center gap-2"><Book className="w-5 h-5" /> SSC Biology</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="botany" className="focus:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {botanyChapters.map((chapter, i) => (
                <motion.div key={chapter.docId || `botany-${chapter.id}-${i}`} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: i * 0.1, duration: 0.5}}>
                  <ChapterCard chapter={chapter} colorTheme="teal" />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="zoology" className="focus:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {zoologyChapters.map((chapter, i) => (
                <motion.div key={chapter.docId || `zoology-${chapter.id}-${i}`} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: i * 0.1, duration: 0.5}}>
                  <ChapterCard chapter={chapter} colorTheme="indigo" />
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="ssc" className="focus:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sscBiologyChapters.map((chapter, i) => (
                 <motion.div key={chapter.docId || `ssc-${chapter.id}-${i}`} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: i * 0.1, duration: 0.5}}>
                   <ChapterCard chapter={chapter} colorTheme="purple" />
                 </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}

function ChapterCard({ chapter, colorTheme }: { chapter: ChapterDoc, colorTheme: 'teal' | 'indigo' | 'purple' }) {
  const themeStyles = {
    teal: {
      card: 'hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-teal-500/20',
      gradient: 'bg-gradient-to-r from-teal-500 to-emerald-400',
      text: 'text-teal-600',
      badge: 'bg-teal-50 border-teal-100',
    },
    indigo: {
      card: 'hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-indigo-500/20',
      gradient: 'bg-gradient-to-r from-indigo-500 to-blue-400',
      text: 'text-indigo-600',
      badge: 'bg-indigo-50 border-indigo-100',
    },
    purple: {
      card: 'hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-purple-500/20',
      gradient: 'bg-gradient-to-r from-purple-500 to-fuchsia-400',
      text: 'text-purple-600',
      badge: 'bg-purple-50 border-purple-100',
    },
  };

  const currentTheme = themeStyles[colorTheme];

  const handleDownload = (writer: ChapterDoc['writers'][number]) => {
    if (!writer.pdfUrl) {
      window.alert('এই chapter-এর PDF এখনো upload করা হয়নি।');
      return;
    }

    const link = document.createElement('a');
    link.href = writer.pdfUrl;
    link.download = `${chapter.title}_${writer.name}.pdf`;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className={`rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden flex flex-col h-full shadow-lg group transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl ${currentTheme.card} relative`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" />
      <div className={`h-2 w-full ${currentTheme.gradient}`}></div>
      <div className="p-6 md:p-8 flex flex-col flex-1 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h4 className={`text-sm font-bold ${currentTheme.text} dark:text-slate-300 mb-2 uppercase tracking-widest flex items-center gap-2`}>
              <div className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
              অধ্যায় {chapter.id}
            </h4>
            <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white leading-tight">
              {chapter.title}
            </h3>
          </div>
          <div className={`px-3 py-1 text-xs font-bold rounded-lg ${currentTheme.badge} border ${currentTheme.text} dark:bg-slate-800 dark:border-slate-700 shadow-sm shrink-0`}>
            {chapter.writers.length} Writers
          </div>
        </div>
        
        <div className="space-y-4 flex-1">
          {chapter.writers.map((writer, idx) => (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              key={idx} 
              className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 dark:bg-white/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${currentTheme.gradient}`}></div>
                  {writer.name}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {writer.book ? (
                  <div className="flex gap-1 flex-1">
                    <Link
                      to="/reader"
                      state={{ pdfUrl: writer.pdfUrl, title: `${chapter.title} - ${writer.name}` }}
                      className="flex-1"
                    >
                      <Button variant="secondary" size="sm" className="w-full h-8 text-[11px] font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 transition-all text-slate-700 dark:text-slate-300 group-hover:shadow hover:bg-slate-50 dark:hover:bg-slate-800">
                        <FileText className="w-3.5 h-3.5 mr-1" /> রিড
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(writer)} className="w-8 h-8 p-0 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" className="h-8 text-[11px] flex-1 rounded-xl opacity-40 bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600" disabled>
                    N/A
                  </Button>
                )}
                
                {writer.solve && (
                  <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm hover:border-slate-300 flex-1 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" /> সলভ
                  </Button>
                )}

                {writer.video && (
                  <Link to="/video" className="flex-1">
                    <Button variant="outline" size="sm" className={`w-full h-8 text-[11px] font-bold rounded-xl border border-transparent text-white ${currentTheme.gradient} shadow-md opacity-90 hover:opacity-100 hover:shadow-lg hover:-translate-y-0.5 transition-all`}>
                      <Play className="w-3 h-3 mr-1 fill-current" /> ভিডিও
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
             <span className={`text-xs font-bold uppercase tracking-widest ${currentTheme.text} flex items-center group-hover:text-slate-900 dark:group-hover:text-white transition-colors cursor-pointer`}>
               View All Details <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
             </span>
        </div>
      </div>
    </Card>
  );
}
