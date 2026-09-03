import { Link } from 'react-router-dom';
import { ArrowLeft, Microscope } from 'lucide-react';
import Seo from '@/src/components/Seo';
import SiteFooter from '@/src/components/site/SiteFooter';
import StudentRegistrationForm from '@/src/components/site/StudentRegistrationForm';

export default function RegistrationPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Seo
        title="রেজিস্ট্রেশন - BIO LAB"
        description="BIO LAB রেজিস্ট্রেশন ফর্ম — SSC ও HSC শিক্ষার্থীদের জন্য জীববিজ্ঞান সংবর্ধনা রেজিস্ট্রেশন।"
      />

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/88 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/88">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <div className="rounded-2xl bg-teal-600 p-2.5 text-white shadow-lg shadow-teal-600/20 transition-transform group-hover:scale-105">
              <Microscope className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold leading-none tracking-normal text-slate-950 dark:text-white sm:text-2xl">
                BIO LAB
              </span>
              <span className="mt-1 text-[10px] font-bold text-teal-700 dark:text-teal-300 sm:text-xs">
                জীববিজ্ঞানে সহজ সমাধান
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:border-teal-200 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-900 dark:hover:text-teal-300"
          >
            <ArrowLeft className="h-4 w-4" />
            হোমে ফিরুন
          </Link>
        </div>
      </header>

      <main>
        <StudentRegistrationForm />
      </main>
      <SiteFooter />
    </div>
  );
}
