import { ArrowLeft, DownloadCloud, FileText, Maximize2 } from 'lucide-react';
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
  const { pdfUrl, title = 'BIO LAB PDF Reader' } = (state ?? {}) as PdfRouteState;

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
      className="flex h-[calc(100vh-6rem)] min-h-[620px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:h-[calc(100vh-4rem)]"
    >
      <Seo
        title="PDF Reader"
        description="Read BIO LAB chapter-wise biology PDFs with a focused web reader and download support."
      />
      <div className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Link to="/resources">
            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="line-clamp-1 text-sm font-extrabold text-slate-950 dark:text-white sm:text-base">
              {title}
            </h1>
            <p className="mt-0.5 hidden text-xs font-semibold text-slate-500 sm:block">
              BIO LAB resource viewer
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            disabled={!pdfUrl}
            className="h-10 rounded-xl bg-teal-600 px-3 text-xs font-bold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50 sm:px-4"
          >
            <DownloadCloud className="mr-1.5 h-4 w-4" />
            <span>Download</span>
          </Button>
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 dark:border-slate-700">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </div>

      <div className="bio-surface flex-1 overflow-auto p-3 sm:p-5">
        {pdfUrl ? (
          <iframe
            title={title}
            src={pdfUrl}
            className="mx-auto h-full min-h-[560px] w-full max-w-6xl rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800"
          />
        ) : (
          <div className="grid h-full min-h-[520px] place-items-center">
            <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                <FileText className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-2xl font-extrabold text-slate-950 dark:text-white">
                Resource বেছে নাও
              </h2>
              <p className="mt-3 text-sm font-medium leading-7 text-slate-500 dark:text-slate-400">
                PDF reader সরাসরি Resource Hub থেকে খোলা হলে selected file এখানে দেখা যাবে।
              </p>
              <Link to="/resources" className="mt-6 inline-block">
                <Button className="rounded-xl bg-teal-600 px-6 font-bold text-white hover:bg-teal-700">
                  Resource Hub
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
