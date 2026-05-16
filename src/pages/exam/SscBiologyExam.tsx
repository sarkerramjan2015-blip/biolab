import { useState } from 'react';
import { BookCopy, Clock3, Layers3, LockKeyhole, Shuffle } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import Seo from '@/src/components/Seo';
import StartExamButton from '@/src/components/exam/StartExamButton';
import { sscExamChapters } from '@/src/data/exam';

const sscStats = [
  {
    label: 'Exam',
    value: '25 MCQ',
    icon: <Shuffle className="h-4 w-4" />,
  },
  {
    label: 'Time',
    value: '15 min',
    icon: <Clock3 className="h-4 w-4" />,
  },
  {
    label: 'Chapter',
    value: '1/day',
    icon: <LockKeyhole className="h-4 w-4" />,
  },
];

export default function SscBiologyExam() {
  const [showChapters, setShowChapters] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl"
    >
      <Seo
        title="SSC Biology Exam"
        description="Choose SSC Biology chapter wise MCQ tests or a full book model test in BIO LAB."
      />

      <section className="premium-shell space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="premium-panel rounded-2xl p-5 sm:p-7">
          <p className="premium-kicker text-xs font-extrabold uppercase tracking-[0.2em]">
            SSC Biology
          </p>
          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white sm:text-5xl">
                MCQ test type বেছে নাও
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Chapter pool থেকে প্রতিটি student-এর জন্য প্রশ্ন auto-shuffle হবে।
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {sscStats.map((stat) => (
                <div key={stat.label} className="premium-stat min-w-[92px] rounded-2xl px-3 py-3 text-center">
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
          <Card className="premium-card premium-card-teal rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg">
              <Layers3 className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-extrabold text-slate-950 dark:text-white">Chapter Wise MCQ Test</h2>
            <p className="mt-2 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
              নির্দিষ্ট chapter বেছে ২৫টি shuffled MCQ practice করো।
            </p>
            <button
              type="button"
              onClick={() => setShowChapters((current) => !current)}
              className="mt-5 text-sm font-bold text-teal-700 transition-colors hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-200"
            >
              {showChapters ? 'Hide chapters' : 'Show chapters'}
            </button>
          </Card>

          <Card className="premium-card premium-card-indigo rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
              <BookCopy className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-extrabold text-slate-950 dark:text-white">Full Book MCQ Test</h2>
            <p className="mt-2 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
              পুরো SSC Biology বই থেকে random model test।
            </p>
            <StartExamButton
              config={{ level: 'SSC', subject: 'Biology', testType: 'full_book' }}
              className="mt-5 h-11 rounded-xl bg-indigo-600 px-5 font-bold text-white hover:bg-indigo-700"
            />
          </Card>
        </section>

        {showChapters && (
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sscExamChapters.map((chapter) => (
              <Card
                key={chapter.id}
                className="premium-card premium-card-teal rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-2xl"
              >
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                  {chapter.name}
                </p>
                <h3 className="mt-2 min-h-12 text-lg font-extrabold leading-6 text-slate-950 dark:text-white">
                  {chapter.title}
                </h3>
                <StartExamButton
                  config={{
                    level: 'SSC',
                    subject: 'Biology',
                    testType: 'chapter_wise',
                    chapterName: chapter.name,
                  }}
                  className="mt-5 h-10 w-full rounded-xl bg-teal-600 font-bold text-white hover:bg-teal-700"
                />
              </Card>
            ))}
          </section>
        )}
      </section>
    </motion.div>
  );
}
