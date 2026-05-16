import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Loader2, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Seo from '@/src/components/Seo';
import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import {
  DailyChapterAttemptLimitError,
  NotEnoughQuestionsError,
  startExamAttempt,
} from '@/lib/exams';
import {
  getExamName,
  parseExamConfig,
} from '@/src/data/exam';

const rules = [
  'Total questions: 25 MCQ',
  'Total time: 15 minutes',
  'Each question carries 1 mark',
  'Once an option is selected, it cannot be changed',
  'Page refresh, back, or exit may submit the exam',
  'Do not close the browser during exam',
  'Submit before time ends',
  'When time ends, exam will be submitted automatically',
];

export default function ExamRules() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const config = useMemo(() => parseExamConfig(searchParams), [searchParams]);
  const { user, login, loginError } = useAuth();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!config) {
    return <Navigate to="/exam" replace />;
  }

  const handleStart = async () => {
    if (!user) {
      const signedIn = await login();

      if (!signedIn) {
        return;
      }
    }

    const activeUser = user ?? auth.currentUser;

    if (!activeUser) {
      setError('Login complete হওয়ার পর আবার start করো।');
      return;
    }

    setStarting(true);
    setError(null);

    try {
      const { attemptId } = await startExamAttempt(config, activeUser);
      navigate(`/exam/session?attempt=${attemptId}`);
    } catch (startError) {
      if (startError instanceof NotEnoughQuestionsError) {
        setError(
          `এই exam-এর জন্য এখন ${startError.availableCount}টি active question আছে। শুরু করতে অন্তত 25টি active question লাগবে।`,
        );
      } else if (startError instanceof DailyChapterAttemptLimitError) {
        setError('এই chapter-এ আজ একবার exam দেওয়া হয়ে গেছে। আবার চেষ্টা করো আগামীকাল।');
      } else if (
        typeof startError === 'object'
        && startError !== null
        && 'code' in startError
        && startError.code === 'permission-denied'
      ) {
        setError('Exam permission এখনো allow হয়নি। একটু পরে আবার চেষ্টা করো।');
      } else {
        console.error('Failed to start exam:', startError);
        setError('Exam শুরু করা যায়নি। একটু পরে আবার চেষ্টা করো।');
      }
    } finally {
      setStarting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl"
    >
      <Seo
        title="Exam Rules"
        description="Read BIO LAB exam rules before starting the timed MCQ test."
      />

      <section className="premium-shell space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="premium-panel rounded-2xl p-5 sm:p-7">
          <p className="premium-kicker text-xs font-extrabold uppercase tracking-[0.2em]">
            Before You Begin
          </p>
          <h1 className="mt-4 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-5xl">
            {getExamName(config)}
          </h1>
        </header>

      <Card className="premium-card premium-card-teal rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Exam Rules</h2>
        <ol className="mt-5 space-y-3 text-sm font-medium leading-7 text-slate-700 dark:text-slate-200 sm:text-base">
          {rules.map((rule, index) => (
            <li key={rule} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-extrabold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                {index + 1}
              </span>
              <span>{rule}</span>
            </li>
          ))}
        </ol>
      </Card>

      {!user && (
        <Card className="premium-card premium-card-amber rounded-2xl p-5 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <LogIn className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-extrabold">Student login required before exam start</p>
              <p className="mt-1 text-sm font-medium leading-6">
                Website public, কিন্তু timed MCQ attempt শুরু করতে Google login লাগবে।
              </p>
            </div>
          </div>
        </Card>
      )}

      {(error || loginError) && (
        <Card className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800 shadow-sm dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm font-bold leading-6">{error ?? loginError}</p>
          </div>
        </Card>
      )}

        <Button
          type="button"
          onClick={handleStart}
          disabled={starting}
          className="h-12 w-full rounded-xl bg-teal-600 text-base font-extrabold text-white hover:bg-teal-700"
        >
          {starting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-5 w-5" />
          )}
          I Agree & Start Exam
        </Button>
      </section>
    </motion.div>
  );
}
