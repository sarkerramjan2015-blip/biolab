import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  DownloadCloud,
  FileText,
  Loader2,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import Seo from '@/src/components/Seo';
import { useAuth } from '@/lib/auth';
import { trackPdfDownload } from '@/lib/content';

GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

type PdfRouteState = {
  pdfUrl?: string;
  title?: string;
  subject?: string;
  chapter?: string | number;
};

type PdfFlipbookProps = {
  pdfUrl: string;
  title: string;
};

export default function PdfViewerPage() {
  const { user } = useAuth();
  const location = useLocation();
  const routeState = (location.state ?? {}) as PdfRouteState;
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const pdfUrl = routeState.pdfUrl ?? searchParams.get('pdf') ?? undefined;
  const title = routeState.title ?? searchParams.get('title') ?? 'BIO LAB PDF Reader';
  const subject = routeState.subject ?? searchParams.get('subject') ?? 'Reader View';
  const chapter = routeState.chapter ?? searchParams.get('chapter') ?? 'Reader View';

  useEffect(() => {
    if (user && pdfUrl) {
      trackPdfDownload({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        pdfUrl: pdfUrl,
        pdfTitle: title,
        subject: subject,
        chapter: chapter,
      });
    }
  }, [user, pdfUrl, title, subject, chapter]);

  const handleDownload = () => {
    if (!pdfUrl) {
      window.alert('এই PDF এখনো upload করা হয়নি।');
      return;
    }

    if (user) {
      trackPdfDownload({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        pdfUrl: pdfUrl,
        pdfTitle: title,
        subject: subject.includes('Download') ? subject : `${subject} (Download)`,
        chapter: chapter,
      });
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
      className="flex h-[calc(100vh-6rem)] min-h-[640px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:h-[calc(100vh-4rem)]"
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
              Flipbook reader
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
          <PdfFlipbook pdfUrl={pdfUrl} title={title} />
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
                স্পেশাল PDF কালেকশন থেকে কোনো PDF খুললে flipbook reader এখানে দেখা যাবে।
              </p>
              <Link to="/resources" className="mt-6 inline-block">
                <Button className="rounded-xl bg-teal-600 px-6 font-bold text-white hover:bg-teal-700">
                  স্পেশাল PDF কালেকশন
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PdfFlipbook({ pdfUrl, title }: PdfFlipbookProps) {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isSpread, setIsSpread] = useState(() => window.matchMedia('(min-width: 900px)').matches);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const absolutePdfUrl = useMemo(() => new URL(pdfUrl, window.location.origin).href, [pdfUrl]);
  const step = isSpread ? 2 : 1;
  const rightPage = isSpread && currentPage + 1 <= pageCount ? currentPage + 1 : null;
  const pageLabel = rightPage ? `${currentPage}-${rightPage}` : `${currentPage}`;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 900px)');
    const handleChange = (event: MediaQueryListEvent) => setIsSpread(event.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadingTask = getDocument(absolutePdfUrl);
    let fallbackTask: ReturnType<typeof getDocument> | null = null;

    setPdfDocument(null);
    setPageCount(0);
    setCurrentPage(1);
    setZoom(1);
    setError(null);

    loadingTask.promise
      .then((documentProxy) => {
        if (cancelled) {
          documentProxy.destroy();
          return;
        }

        setPdfDocument(documentProxy);
        setPageCount(documentProxy.numPages);
      })
      .catch(async (loadError: unknown) => {
        if (cancelled) {
          return;
        }

        try {
          const response = await fetch(absolutePdfUrl);

          if (!response.ok) {
            throw new Error(`PDF request failed with ${response.status}`);
          }

          const pdfBytes = new Uint8Array(await response.arrayBuffer());

          if (cancelled) {
            return;
          }

          fallbackTask = getDocument({ data: pdfBytes });
          const documentProxy = await fallbackTask.promise;

          if (cancelled) {
            documentProxy.destroy();
            return;
          }

          setPdfDocument(documentProxy);
          setPageCount(documentProxy.numPages);
        } catch (retryError: unknown) {
          if (!cancelled) {
            console.error('Failed to load PDF', { loadError, retryError });
            setError('PDF load করা যায়নি। আবার চেষ্টা করো।');
          }
        }
      });

    return () => {
      cancelled = true;
      loadingTask.destroy();
      fallbackTask?.destroy();
    };
  }, [absolutePdfUrl]);

  useEffect(() => {
    setCurrentPage((page) => {
      if (!isSpread || page % 2 === 1) {
        return page;
      }

      return Math.max(1, page - 1);
    });
  }, [isSpread]);

  const goToPage = (page: number) => {
    if (!pageCount) {
      return;
    }

    const clamped = Math.min(Math.max(page, 1), pageCount);
    const normalized = isSpread && clamped % 2 === 0 ? clamped - 1 : clamped;

    setDirection(normalized >= currentPage ? 1 : -1);
    setCurrentPage(normalized);
  };

  const goPrevious = () => goToPage(currentPage - step);
  const goNext = () => goToPage(currentPage + step);
  const zoomOut = () => setZoom((value) => Math.max(0.8, Number((value - 0.1).toFixed(1))));
  const zoomIn = () => setZoom((value) => Math.min(2, Number((value + 0.1).toFixed(1))));
  const resetZoom = () => setZoom(1);

  if (error) {
    return (
      <div className="grid h-full min-h-[520px] place-items-center">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm dark:border-red-950 dark:bg-slate-900">
          <p className="font-bold text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!pdfDocument) {
    return (
      <div className="grid h-full min-h-[520px] place-items-center text-sm font-bold text-slate-500">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
          Loading flipbook...
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
            Flipbook Mode
          </p>
          <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
            Page {pageLabel} of {pageCount}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomOut}
              disabled={zoom <= 0.8}
              className="h-8 w-8 rounded-lg"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <button
              type="button"
              onClick={resetZoom}
              className="min-w-14 rounded-lg px-2 py-1 text-xs font-extrabold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Reset zoom"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomIn}
              disabled={zoom >= 2}
              className="h-8 w-8 rounded-lg"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goPrevious}
            disabled={currentPage <= 1}
            className="h-10 rounded-xl border-slate-200 bg-white font-bold dark:border-slate-700 dark:bg-slate-900"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Prev
          </Button>
          <Input
            type="number"
            min={1}
            max={pageCount}
            value={currentPage}
            onChange={(event) => goToPage(Number(event.target.value))}
            className="h-10 w-20 rounded-xl border-slate-200 bg-white text-center font-bold dark:border-slate-700 dark:bg-slate-900"
            aria-label="Go to page"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
            disabled={currentPage + step > pageCount}
            className="h-10 rounded-xl border-slate-200 bg-white font-bold dark:border-slate-700 dark:bg-slate-900"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-auto rounded-3xl border border-white/70 bg-white/50 p-3 shadow-inner dark:border-slate-800 dark:bg-slate-950/30 sm:p-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${currentPage}-${isSpread}`}
            initial={{ opacity: 0, x: direction === 1 ? 18 : -18, rotateY: direction === 1 ? -8 : 8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: direction === 1 ? -18 : 18, rotateY: direction === 1 ? 8 : -8 }}
            transition={{ duration: 0.28 }}
            className={`relative grid w-full max-w-5xl gap-3 [perspective:1600px] ${
              isSpread ? 'grid-cols-2' : 'grid-cols-1 max-w-xl'
            }`}
            style={{
              width: `${zoom * 100}%`,
              maxWidth: isSpread ? `${64 * zoom}rem` : `${36 * zoom}rem`,
            }}
          >
            <RenderedPdfPage pdfDocument={pdfDocument} pageNumber={currentPage} title={title} zoom={zoom} />
            {isSpread && (
              rightPage ? (
                <RenderedPdfPage pdfDocument={pdfDocument} pageNumber={rightPage} title={title} zoom={zoom} />
              ) : (
                <div className="book-page hidden min-h-[520px] rounded-r-2xl border border-slate-200 bg-white/70 shadow-xl dark:border-slate-800 dark:bg-slate-900/70 sm:block" />
              )
            )}
            {isSpread && <span className="pointer-events-none absolute left-1/2 top-3 hidden h-[calc(100%-1.5rem)] w-px -translate-x-1/2 bg-slate-300/80 shadow-[0_0_24px_rgba(15,23,42,0.35)] dark:bg-slate-700 sm:block" />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function RenderedPdfPage({
  pdfDocument,
  pageNumber,
  title,
  zoom,
}: {
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
  title: string;
  zoom: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let renderTask: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']> | null = null;

    setRendering(true);

    pdfDocument.getPage(pageNumber).then((page) => {
      if (cancelled || !canvasRef.current) {
        return;
      }

      const viewport = page.getViewport({ scale: 1.25 * zoom });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        return;
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      renderTask = page.render({ canvasContext: context, viewport });

      renderTask.promise
        .then(() => {
          if (!cancelled) {
            setRendering(false);
          }
        })
        .catch((renderError: unknown) => {
          if (!cancelled) {
            console.error('Failed to render PDF page', renderError);
          }
        });
    });

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pageNumber, pdfDocument, zoom]);

  return (
    <div className="book-page relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)] dark:border-slate-800">
      {rendering && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-white/85 text-sm font-bold text-slate-500 backdrop-blur-sm dark:bg-slate-900/85">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
            Page {pageNumber}
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        aria-label={`${title} page ${pageNumber}`}
        className="block h-auto w-full bg-white"
      />
    </div>
  );
}
