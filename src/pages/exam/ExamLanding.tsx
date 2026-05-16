import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock3, GraduationCap, LockKeyhole, Shuffle } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import Seo from '@/src/components/Seo';

const examTracks = [
  {
    title: 'SSC Biology',
    description: 'Chapter wise MCQ test এবং full book model test',
    path: '/exam/ssc-biology',
    icon: <BookOpen className="h-8 w-8" />,
    cardClassName: 'premium-card-teal',
    iconClassName: 'bg-teal-600 text-white',
  },
  {
    title: 'HSC Biology',
    description: 'উদ্ভিদ বিজ্ঞান ও প্রাণী বিজ্ঞান practice flow',
    path: '/exam/hsc-biology',
    icon: <GraduationCap className="h-8 w-8" />,
    cardClassName: 'premium-card-indigo',
    iconClassName: 'bg-indigo-600 text-white',
  },
];

const examStats = [
  {
    label: 'Questions',
    value: '25',
    icon: <Shuffle className="h-4 w-4" />,
  },
  {
    label: 'Timer',
    value: '15 min',
    icon: <Clock3 className="h-4 w-4" />,
  },
  {
    label: 'Chapter limit',
    value: '1/day',
    icon: <LockKeyhole className="h-4 w-4" />,
  },
];

export default function ExamLanding() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl"
    >
      <Seo
        title="Exam"
        description="BIO LAB exam hub for SSC Biology and HSC Biology chapter wise MCQ practice and full book model tests."
      />

      <section className="premium-shell space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="premium-panel rounded-2xl p-5 sm:p-7">
          <p className="premium-kicker text-xs font-extrabold uppercase tracking-[0.2em]">
            Exam Center
          </p>
          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h1 className="text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-5xl">
                কোন exam flow দিয়ে শুরু করবে?
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Website public থাকছে। MCQ শুরু করার সময় student login লাগবে, তারপর rules দেখে timed exam শুরু হবে।
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {examStats.map((stat) => (
                <div
                  key={stat.label}
                  className="premium-stat min-w-[92px] rounded-2xl px-3 py-3 text-center"
                >
                  <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    {stat.icon}
                  </span>
                  <p className="mt-2 text-lg font-extrabold text-slate-950 dark:text-white">{stat.value}</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {examTracks.map((track) => (
            <Link key={track.title} to={track.path} className="block">
              <Card
                className={`premium-card ${track.cardClassName} group h-full rounded-2xl p-0 transition-all hover:-translate-y-1 hover:shadow-2xl`}
              >
                <div className="flex h-full flex-col justify-between gap-8 p-6 sm:p-8">
                  <div>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${track.iconClassName}`}>
                      {track.icon}
                    </div>
                    <h2 className="mt-6 text-2xl font-extrabold text-slate-950 dark:text-white">{track.title}</h2>
                    <p className="mt-2 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
                      {track.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center text-sm font-bold text-slate-900 dark:text-white">
                    Open section
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </section>
      </section>
    </motion.div>
  );
}
