import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  Layers,
  Library,
  LogOut,
  Menu,
  Microscope,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth';
import Seo from '@/src/components/Seo';
import mentorPhoto from '../img/pic.jpeg';
import SiteFooter from '@/src/components/site/SiteFooter';

const studentBenefits = [
  {
    icon: <Library className="h-5 w-5" />,
    title: 'Chapter অনুযায়ী resource',
    description: 'প্রয়োজনের PDF দ্রুত খুঁজে পাওয়া যায়, তাই পড়ার সময় নষ্ট হয় না।',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: 'এক জায়গায় পড়া ও download',
    description: 'PDF reader, preview, এবং download flow একই জায়গায় রাখা হয়েছে।',
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: 'পরীক্ষাভিত্তিক প্রস্তুতি',
    description: 'SSC ও HSC-এর জন্য গোছানো note, solve sheet, এবং focused resource পাওয়া যায়।',
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Mentor-guided direction',
    description: 'অভিজ্ঞ শিক্ষকের বাছাই করা উপকরণ দিয়ে পড়ার ধারাবাহিকতা ধরে রাখা সহজ হয়।',
  },
];

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, login, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (await login()) {
      navigate('/dashboard');
    }
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'স্পেশাল PDF কালেকশন', path: '/resources' },
    { name: 'Mentor', path: '/mentors' },
    { name: 'Admin Portal', path: '/admin/dashboard' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Seo
        title="BIO LAB - SSC ও HSC Biology Preparation"
        description="BIO LAB এ SSC ও HSC biology chapter-wise PDF, solve class, mentor guidance, and smart study dashboard একসাথে পাওয়া যায়."
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
                জীববিজ্ঞানে বিশুদ্ধ প্রস্তুতি
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold text-slate-600 dark:text-slate-300 lg:flex">
            {navItems.map((item) => (
              <Link key={item.name} to={item.path} className="transition-colors hover:text-teal-700 dark:hover:text-teal-300">
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {!loading && !user ? (
              <>
                <Button
                  onClick={handleLogin}
                  variant="ghost"
                  className="hidden font-bold text-slate-600 hover:text-teal-700 dark:text-slate-300 sm:inline-flex"
                >
                  Log in
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="h-10 rounded-xl bg-teal-600 px-4 font-bold text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 sm:px-5"
                >
                  Get Started <ArrowRight className="ml-2 hidden h-4 w-4 sm:inline" />
                </Button>
              </>
            ) : user ? (
              <>
                <div className="hidden max-w-44 items-center gap-2 text-sm font-bold sm:flex">
                  {user.photoURL && (
                    <img src={user.photoURL} alt="Profile" className="h-8 w-8 rounded-full border-2 border-teal-500" />
                  )}
                  <span className="truncate text-slate-700 dark:text-slate-200">{user.displayName}</span>
                </div>
                <Button onClick={logout} variant="outline" size="icon" className="hidden rounded-xl border-slate-200 dark:border-slate-800 sm:flex">
                  <LogOut className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </Button>
                <Link to="/dashboard">
                  <Button className="h-10 rounded-xl bg-teal-600 px-4 font-bold text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 sm:px-5">
                    Dashboard <ArrowRight className="ml-2 hidden h-4 w-4 sm:inline" />
                  </Button>
                </Link>
              </>
            ) : null}
            <button
              className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="rounded-xl px-3 py-3 font-bold text-slate-600 hover:bg-slate-50 hover:text-teal-700 dark:text-slate-300 dark:hover:bg-slate-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section className="hero-surface relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pb-14 sm:pt-20 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mx-auto max-w-5xl text-center"
            >
              <div className="shine-chip relative mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-teal-100 shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4" />
                PDF-first SSC & HSC Biology Platform
              </div>

              <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-normal sm:text-6xl lg:text-7xl">
                <span className="text-white">Biology প্রস্তুতি এখন </span>
                <span className="bg-gradient-to-r from-teal-200 via-cyan-100 to-indigo-200 bg-clip-text text-transparent">
                  আরও পরিষ্কার, দ্রুত, সুন্দর।
                </span>
              </h1>
              <div className="hero-brand-frame mx-auto mt-5 max-w-xl px-5 py-4 sm:px-8 sm:py-5">
                <div className="hero-brand-window">
                  <div className="hero-brand-track">
                    <div className="hero-brand-slide">
                      <p className="hero-brand-title text-3xl font-extrabold tracking-normal sm:text-5xl">BIO LAB</p>
                    </div>
                    <div className="hero-brand-slide">
                      <p className="hero-brand-subtitle text-xl font-bold text-teal-100 sm:text-3xl">
                        জীববিজ্ঞানে বিশুদ্ধ প্রস্তুতি
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mx-auto mt-6 max-w-3xl text-base font-medium leading-8 text-slate-200 sm:text-xl sm:leading-9">
                দাগানো PDF, solve sheet, mentor guidance আর chapter-wise archive এক জায়গায়। মোবাইল, ট্যাব আর
                ডেস্কটপে একইভাবে পড়ার মতো করে BIO LAB সাজানো হয়েছে।
              </p>

              <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row">
                <Link to="/resources" className="w-full sm:w-auto">
                  <Button size="lg" className="h-12 w-full rounded-xl bg-teal-600 px-7 text-base font-extrabold text-white shadow-xl shadow-teal-600/20 hover:bg-teal-700 sm:h-14">
                    রিসোর্স দেখো <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="h-12 w-full rounded-xl border-white/30 bg-white/10 px-7 text-base font-extrabold text-white backdrop-blur hover:bg-white/20 sm:h-14">
                    পড়া শুরু করো
                  </Button>
                </Link>
              </div>

              <div className="mx-auto mt-9 grid max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
                {[
                  'Real PDF reader',
                  'Chapter wise archive',
                  'Mentor guided flow',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white shadow-sm backdrop-blur">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-200" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            <FeatureCard
              icon={<Library className="h-7 w-7 text-teal-700" />}
              title="সাজানো আর্কাইভ"
              description="HSC Botany, Zoology আর SSC chapter অনুযায়ী PDF সাজানো, যাতে প্রয়োজনের ফাইল খুঁজে পেতে সময় নষ্ট না হয়।"
            />
            <FeatureCard
              icon={<Layers className="h-7 w-7 text-indigo-700" />}
              title="ফোকাসড রিডার"
              description="ওয়েবসাইটের ভিতরেই PDF পড়া, নতুন tab-এ খোলা, এবং এক ক্লিকে download করার flow রাখা হয়েছে।"
            />
            <FeatureCard
              icon={<FileText className="h-7 w-7 text-amber-700" />}
              title="সহজ PDF download"
              description="প্রতিটি PDF card-এ পড়ার এবং download করার আলাদা button আছে, তাই student দ্রুত নিজের প্রয়োজনের resource নিতে পারবে।"
            />
          </div>
        </section>

        <section className="bg-slate-50 py-12 dark:bg-slate-950 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">
                Student Benefits
              </p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-5xl">
                একজন student BIO LAB থেকে কী সুবিধা পাবে
              </h2>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {studentBenefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                    {benefit.icon}
                  </span>
                  <h3 className="mt-4 text-base font-extrabold text-slate-950 dark:text-white">{benefit.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-12 dark:bg-slate-950 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-center lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <img src={mentorPhoto} alt="BIO LAB mentor" className="h-72 w-full object-cover object-top sm:h-96 lg:h-[420px]" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">
                Mentor led Biology
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-5xl">
                জাহিদুল হাসানের অভিজ্ঞতায় গড়া structured Biology learning library।
              </h2>
              <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                Botany-তে BSc ও MSc সম্পন্ন, সামসুল হক খান স্কুল অ্যান্ড কলেজের সহকারী শিক্ষক জাহিদুল হাসান
                প্রায় ১৫ বছর ধরে জীববিজ্ঞান পড়াচ্ছেন। তার বাছাই করা SSC ও HSC resource BIO LAB-এ chapter অনুযায়ী
                সাজানো হয়েছে, যেন student সহজে পড়তে, revise করতে, এবং download করতে পারে।
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: <GraduationCap className="h-5 w-5" />, text: 'BSc, MSc in Botany' },
                  { icon: <Award className="h-5 w-5" />, text: 'প্রায় ১৫ বছরের অভিজ্ঞতা' },
                  { icon: <Users className="h-5 w-5" />, text: 'সহকারী শিক্ষক' },
                  { icon: <CheckCircle2 className="h-5 w-5" />, text: 'SSC + HSC focused' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 font-bold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                      {item.icon}
                    </span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-teal-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-teal-900 dark:hover:bg-slate-950 dark:hover:shadow-none">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {icon}
      </div>
      <h3 className="text-xl font-extrabold tracking-normal text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-3 text-sm font-medium leading-7 text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}
