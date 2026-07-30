import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Eye,
  FileText,
  FlaskConical,
  Plus,
  Radio,
  UploadCloud,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useChapters, useResourceControls } from '@/lib/content';
import { isLocalAdminPreviewEnabled } from '@/lib/admin';
import { useMcqQuestions, useExamAttempts } from '@/lib/exams';
import { usePracticals } from '@/lib/practicals';
import Seo from '@/src/components/Seo';
import adminImage from '../../img/pic.jpeg';
import { buildAdminResources, getAdminResourceStats } from './adminResourceData';

export default function AdminDashboard() {
  const { chapters } = useChapters();
  const { hiddenUrls } = useResourceControls();
  const { questions } = useMcqQuestions();
  const { practicals } = usePracticals(true);
  const { attempts } = useExamAttempts(true);
  const localAdminPreview = isLocalAdminPreviewEnabled();

  const resources = useMemo(
    () => buildAdminResources(chapters, hiddenUrls),
    [chapters, hiddenUrls],
  );
  const resourceStats = useMemo(() => getAdminResourceStats(resources), [resources]);
  const submittedAttempts = attempts.filter((attempt) => attempt.status === 'submitted');
  const runningAttempts = attempts.filter((attempt) => attempt.status === 'running');
  const uniqueStudents = new Set(attempts.map((attempt) => attempt.userId)).size;
  const recentAttempts = [...attempts]
    .sort((a, b) => (b.submittedAt ?? b.startedAt) - (a.submittedAt ?? a.startedAt))
    .slice(0, 5);

  const quickActions = [
    {
      title: 'PDF / নোট প্রকাশ',
      description: 'নতুন study resource upload করুন',
      path: '/admin/resources?new=1',
      icon: UploadCloud,
      card: 'border-orange-200 from-orange-50 dark:border-orange-900/60 dark:from-orange-950/30',
      iconTone: 'bg-orange-600',
      arrowTone: 'text-orange-500',
    },
    {
      title: 'Practical class',
      description: 'PDF note ও YouTube video যোগ করুন',
      path: '/admin/practical#new',
      icon: FlaskConical,
      card: 'border-teal-200 from-teal-50 dark:border-teal-900/60 dark:from-teal-950/30',
      iconTone: 'bg-teal-600',
      arrowTone: 'text-teal-500',
    },
    {
      title: 'MCQ প্রশ্ন যোগ করুন',
      description: 'Question bank-এ নতুন প্রশ্ন প্রকাশ করুন',
      path: '/admin/mcq#new',
      icon: ClipboardList,
      card: 'border-indigo-200 from-indigo-50 dark:border-indigo-900/60 dark:from-indigo-950/30',
      iconTone: 'bg-indigo-600',
      arrowTone: 'text-indigo-500',
    },
    {
      title: 'সব PDF manage',
      description: 'Level, subject ও chapter অনুযায়ী দেখুন',
      path: '/admin/resources',
      icon: FileText,
      card: 'border-sky-200 from-sky-50 dark:border-sky-900/60 dark:from-sky-950/30',
      iconTone: 'bg-sky-600',
      arrowTone: 'text-sky-500',
    },
    {
      title: 'Exam result',
      description: 'পরীক্ষার্থী ও score দেখুন',
      path: '/admin/exam-report',
      icon: BarChart3,
      card: 'border-rose-200 from-rose-50 dark:border-rose-900/60 dark:from-rose-950/30',
      iconTone: 'bg-rose-600',
      arrowTone: 'text-rose-500',
    },
    {
      title: 'Student website',
      description: 'শিক্ষার্থীরা কী দেখছে preview করুন',
      path: '/dashboard',
      icon: Eye,
      card: 'border-amber-200 from-amber-50 dark:border-amber-900/60 dark:from-amber-950/30',
      iconTone: 'bg-amber-500',
      arrowTone: 'text-amber-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl space-y-8"
    >
      <Seo
        title="Admin Dashboard"
        description="BIO LAB admin control center for resources, quizzes, practical classes, and exam results."
      />

      <header className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="bio-grid overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="flex h-full flex-col justify-between gap-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-orange-500">Admin Home</p>
              <h1 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
                আজকের সব কাজ এক জায়গায়
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500 dark:text-slate-400">
                নিচের Quick Actions থেকে প্রয়োজনীয় কাজটি বেছে নিন। প্রতিটি management section এখন আলাদা ও গুছানো।
              </p>
            </div>
            <Button
              render={<Link to="/admin/resources?new=1" />}
              className="h-11 w-fit rounded-xl bg-orange-600 px-5 font-bold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700"
            >
              <Plus className="mr-2 h-4 w-4" /> নতুন Resource
            </Button>
          </div>
        </div>
        <div className="relative hidden overflow-hidden rounded-[1.75rem] border border-orange-100 bg-orange-50 shadow-sm dark:border-orange-900/50 dark:bg-orange-950/30 lg:block">
          <img src={adminImage} alt="BIO LAB mentor and admin profile" className="h-full min-h-56 w-full object-cover object-top" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-200">BIO LAB Admin</p>
            <p className="mt-1 text-sm font-semibold">সহজ control, গুছানো content.</p>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-500">Quick actions</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white">কোন কাজটি করতে চান?</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">সব upload ও management কাজ এখান থেকেই শুরু করা যাবে।</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className={`group flex min-h-32 items-start gap-4 rounded-2xl border bg-gradient-to-br to-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:to-slate-900 ${action.card}`}
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${action.iconTone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold text-slate-950 dark:text-white">{action.title}</span>
                  <span className="mt-1 block text-sm font-medium leading-6 text-slate-500">{action.description}</span>
                </span>
                <ChevronRight className={`mt-3 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 ${action.arrowTone}`} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Overview</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white">এক নজরে BIO LAB</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {[
            { label: 'Visible PDF', value: resourceStats.visible, icon: FileText, tone: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' },
            { label: 'Active MCQ', value: questions.filter((item) => item.status === 'active').length, icon: BookOpen, tone: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' },
            { label: 'Practical', value: practicals.filter((item) => item.status === 'active').length, icon: FlaskConical, tone: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300' },
            { label: 'চলমান Exam', value: runningAttempts.length, icon: Radio, tone: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
            { label: 'জমা Exam', value: submittedAttempts.length, icon: BarChart3, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
            { label: 'শিক্ষার্থী', value: uniqueStudents, icon: Users, tone: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-950 dark:text-white">{item.value}</p>
                </div>
                <p className="mt-3 text-xs font-bold text-slate-500">{item.label}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">সাম্প্রতিক পরীক্ষার্থী</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">এই তালিকা realtime update হয়</p>
          </div>
          <Button render={<Link to="/admin/exam-report" />} variant="outline" className="rounded-xl font-bold">
            সব ফলাফল
          </Button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentAttempts.length === 0 ? (
            <p className="p-5 text-sm font-medium text-slate-500">এখনো কেউ পরীক্ষা দেয়নি।</p>
          ) : recentAttempts.map((attempt) => (
            <div key={attempt.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-extrabold text-slate-950 dark:text-white">{attempt.studentName}</p>
                <p className="mt-1 truncate text-xs font-medium text-slate-500">{attempt.examName}</p>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                attempt.status === 'running'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}>
                {attempt.status === 'running' ? 'পরীক্ষা চলছে' : `${attempt.percentage ?? 0}%`}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['১. কাজ বেছে নিন', 'Quick Actions থেকে প্রয়োজনীয় section খুলুন।'],
            ['২. তথ্য দিন', 'Form পূরণ করে Save বা Publish করুন।'],
            ['৩. দেখে নিন', 'নিজস্ব management page থেকেই content যাচাই করুন।'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="font-extrabold text-slate-950 dark:text-white">{title}</p>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </Card>

      {localAdminPreview && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Local preview চলছে। Live পরিবর্তনের জন্য Google Login এবং admin permission প্রয়োজন।
        </div>
      )}
    </motion.div>
  );
}
