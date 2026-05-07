import { Maximize2, ZoomIn, ZoomOut, ArrowLeft, Bookmark, DownloadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import Seo from '@/src/components/Seo';

type PdfRouteState = {
  pdfUrl?: string;
  title?: string;
};

export default function PdfViewerPage() {
  const { state } = useLocation();
  const { pdfUrl, title = 'অধ্যায় ২: কোষ বিভাজন - আবুল হাসান স্যার' } = (state ?? {}) as PdfRouteState;

  const handleDownload = () => {
    if (!pdfUrl) {
      window.alert('এই PDF এখনো upload করা হয়নি।');
      return;
    }

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="h-[calc(100vh-2rem-64px)] md:h-[calc(100vh-4rem)] flex flex-col bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 w-full relative"
    >
      <Seo
        title="PDF Reader"
        description="Read BIO LAB chapter-wise biology PDFs with a focused web reader and download support."
      />
      {/* Top Toolbar */}
      <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/resources">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-sm md:text-base line-clamp-1">{title}</h2>
            <p className="text-xs text-slate-500 hidden md:block">উদ্ভিদবিজ্ঞান • ১২০ পৃষ্ঠা</p>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" className="text-slate-500 hidden md:flex">
            <ZoomOut className="w-5 h-5" />
          </Button>
          <span className="text-sm font-medium w-12 text-center text-slate-600 hidden md:block">100%</span>
          <Button variant="ghost" size="icon" className="text-slate-500 hidden md:flex">
            <ZoomIn className="w-5 h-5" />
          </Button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block"></div>
          
          <Button variant="default" size="sm" onClick={handleDownload} className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center font-bold px-4 md:mx-2 shadow-sm transition-all active:scale-95">
            <DownloadCloud className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">ডাউনলোড PDF</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="text-slate-500 hidden md:flex">
            <Bookmark className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-500">
            <Maximize2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-950 p-4 md:p-8 flex justify-center">
        {pdfUrl ? (
          <iframe
            title={title}
            src={pdfUrl}
            className="h-full min-h-[720px] w-full max-w-5xl rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800"
          />
        ) : (
        <div className="w-full max-w-[800px] h-[1200px] bg-white dark:bg-slate-900 shadow-xl rounded-xl p-12 flex flex-col relative border border-slate-200 dark:border-slate-800">
          
          <div className="absolute top-8 right-8 bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded w-fit uppercase">
            দাগানো
          </div>
          
          <h1 className="text-3xl font-bold text-center mt-12 mb-8 font-serif text-slate-900 dark:text-slate-100">অধ্যায় ২: কোষ বিভাজন</h1>
          
          <div className="space-y-6 text-slate-800 dark:text-slate-300 font-serif leading-relaxed text-lg">
             <p>কোষ বিভাজন একটি মৌলিক ও অত্যাবশ্যকীয় প্রক্রিয়া যার মাধ্যমে জীবের দৈহিক বৃদ্ধি ঘটে এবং বংশবৃদ্ধি হয়। যে প্রক্রিয়ায় একটি মাতৃকোষ বিভাজিত হয়ে দুটি বা চারটি অপত্য কোষ সৃষ্টি করে তাকে কোষ বিভাজন বলে।</p>
             <p className="bg-yellow-100 dark:bg-yellow-900/30 p-1 rounded">ওয়াল্টার ফ্লেমিং (১৮৮২) প্রথম সামুদ্রিক স্যালামান্ডার (Triton) এর কোষে কোষ বিভাজন লক্ষ্য করেন।</p>
             <p>কোষ বিভাজন প্রধানত তিন প্রকার: <br/>১. অ্যামাইটোসিস <br/>২. মাইটোসিস <br/>৩. মিয়োসিস</p>
             <h3 className="text-xl font-bold mt-8 mb-4">মাইটোসিস (Mitosis)</h3>
             <p className="bg-yellow-100 dark:bg-yellow-900/30 p-1 rounded inline">মাইটোসিস বিভাজনকে সমীকরণিক বিভাজন (Equational division) বলা হয়</p> 
             <span> কারণ এই বিভাজনে মাতৃকোষের প্রতিটি ক্রোমোজোম লম্বালম্বিভাবে দু'ভাগে বিভক্ত হয়। ফলে সৃষ্ট নতুন কোষ দুটির ক্রোমোজোম সংখ্যা মাতৃকোষের ক্রোমোজোম সংখ্যার সমান থাকে।</span>
          </div>
        </div>
        )}
      </div>

      {/* Bottom Nav Mock for pages */}
      <div className="h-14 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-4 shrink-0">
         <Button variant="outline" size="sm" className="rounded-full">পূর্ববর্তী</Button>
         <span className="text-sm font-medium">পৃষ্ঠা ১ / ১২০</span>
         <Button variant="outline" size="sm" className="rounded-full">পরবর্তী</Button>
      </div>
    </motion.div>
  );
}
