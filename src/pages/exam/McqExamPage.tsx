import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Loader2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Seo from '@/src/components/Seo';
import { useAuth } from '@/lib/auth';
import PageNavActions from '@/src/components/navigation/PageNavActions';
import {
  fetchQuestionsByIds,
  saveAttemptAnswerSelection,
  submitExamAttempt,
  useExamAttempt,
  type McqQuestion,
} from '@/lib/exams';
import {
  EXAM_DURATION_SECONDS,
  formatExamTime,
  type AnswerOption,
} from '@/src/data/exam';

const optionKeys: AnswerOption[] = ['A', 'B', 'C', 'D'];

function getOptionText(question: McqQuestion, option: AnswerOption) {
  return {
    A: question.optionA,
    B: question.optionB,
    C: question.optionC,
    D: question.optionD,
  }[option];
}

export default function McqExamPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attempt');
  const { user, loading: authLoading } = useAuth();
  const { attempt, loading: attemptLoading } = useExamAttempt(attemptId);
  const [questions, setQuestions] = useState<McqQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [optimisticAnswers, setOptimisticAnswers] = useState<Record<string, AnswerOption>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(EXAM_DURATION_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submissionInFlight = useRef(false);
  const questionIdsKey = attempt?.questionIds.join('|') ?? '';

  useEffect(() => {
    if (!attempt || !questionIdsKey) {
      return;
    }

    let cancelled = false;
    setQuestionsLoading(true);

    fetchQuestionsByIds(attempt.questionIds)
      .then((nextQuestions) => {
        if (!cancelled) {
          const questionMap = new Map(nextQuestions.map((question) => [question.id, question]));
          setQuestions(attempt.questionIds.map((questionId) => questionMap.get(questionId)).filter(Boolean) as McqQuestion[]);
        }
      })
      .catch((loadError) => {
        console.error('Failed to load exam questions:', loadError);
        if (!cancelled) {
          setError('Question load করা যায়নি।');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setQuestionsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt?.id, questionIdsKey]);

  useEffect(() => {
    setOptimisticAnswers({});
  }, [attempt?.id]);

  useEffect(() => {
    if (!attempt) {
      return;
    }

    setOptimisticAnswers((current) => {
      const next = { ...current };

      Object.keys(attempt.selectedAnswers).forEach((questionId) => {
        delete next[questionId];
      });

      return next;
    });
  }, [attempt?.id, attempt?.selectedAnswers]);

  useEffect(() => {
    if (!attempt || attempt.status !== 'running') {
      return;
    }

    const updateRemainingTime = () => {
      const elapsed = Math.floor((Date.now() - attempt.startedAt) / 1000);
      setRemainingSeconds(Math.max(0, attempt.durationSeconds - elapsed));
    };

    updateRemainingTime();
    const intervalId = window.setInterval(updateRemainingTime, 1000);

    return () => window.clearInterval(intervalId);
  }, [attempt?.durationSeconds, attempt?.id, attempt?.startedAt, attempt?.status]);

  useEffect(() => {
    if (!attempt || attempt.status !== 'running') {
      return;
    }

    const warning = 'Your exam is running. Leaving this page may submit your exam.';
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = warning;
      return warning;
    };
    const handlePopState = () => {
      const shouldLeave = window.confirm(warning);

      if (!shouldLeave) {
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [attempt?.id, attempt?.status]);

  const selectedAnswers = {
    ...(attempt?.selectedAnswers ?? {}),
    ...optimisticAnswers,
  };
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelect = async (questionId: string, option: AnswerOption) => {
    if (!attempt || attempt.status !== 'running' || selectedAnswers[questionId]) {
      return;
    }

    setOptimisticAnswers((current) => ({
      ...current,
      [questionId]: option,
    }));

    try {
      await saveAttemptAnswerSelection(attempt.id, questionId, option);
    } catch (selectionError) {
      console.error('Failed to save answer:', selectionError);
      setOptimisticAnswers((current) => {
        const next = { ...current };
        delete next[questionId];
        return next;
      });
      setError('Answer save করা যায়নি। আবার চেষ্টা করো।');
    }
  };

  const submitNow = async () => {
    if (!attempt || questions.length !== attempt.totalQuestions || submissionInFlight.current) {
      return;
    }

    submissionInFlight.current = true;
    setSubmitting(true);
    setError(null);

    try {
      await submitExamAttempt(attempt, questions, selectedAnswers);
      navigate(`/exam/result?attempt=${attempt.id}`, { replace: true });
    } catch (submitError) {
      console.error('Failed to submit exam:', submitError);
      setError(submitError instanceof Error ? submitError.message : 'Exam submit করা যায়নি।');
      submissionInFlight.current = false;
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (remainingSeconds === 0 && attempt?.status === 'running' && questions.length === attempt.totalQuestions) {
      void submitNow();
    }
  }, [attempt, questions.length, remainingSeconds]);

  const orderedQuestions = useMemo(() => questions, [questions]);
  const confirmLeaveExam = () => (
    attempt?.status !== 'running'
    || window.confirm('Your exam is running. Leaving this page may submit your exam.')
  );

  if (!attemptId) {
    return <Navigate to="/exam" replace />;
  }

  if (!authLoading && !user) {
    return <Navigate to="/exam" replace />;
  }

  if (!attemptLoading && !attempt) {
    return <Navigate to="/exam" replace />;
  }

  if (attempt && attempt.userId !== user?.uid) {
    return <Navigate to="/exam" replace />;
  }

  if (attempt?.status === 'submitted') {
    return <Navigate to={`/exam/result?attempt=${attempt.id}`} replace />;
  }

  if (authLoading || attemptLoading || questionsLoading || !attempt) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
          Loading exam...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Seo
        title={attempt.examName}
        description="Timed BIO LAB MCQ exam session."
      />

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-8">
          <div>
            <PageNavActions onBeforeNavigate={confirmLeaveExam} className="mb-3" />
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              {attempt.studentName}
            </p>
            <h1 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl">
              {attempt.examName}
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            <div className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
              <p className="text-[11px] font-bold uppercase text-slate-500">Timer</p>
              <p className="mt-1 flex items-center justify-center gap-1 text-lg font-extrabold">
                <Timer className="h-4 w-4 text-teal-600" />
                {formatExamTime(remainingSeconds)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
              <p className="text-[11px] font-bold uppercase text-slate-500">Questions</p>
              <p className="mt-1 text-lg font-extrabold">{attempt.totalQuestions}</p>
            </div>
            <div className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
              <p className="text-[11px] font-bold uppercase text-slate-500">Answered</p>
              <p className="mt-1 text-lg font-extrabold">{answeredCount}/{attempt.totalQuestions}</p>
            </div>
            <div className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
              <p className="text-[11px] font-bold uppercase text-slate-500">Marks</p>
              <p className="mt-1 text-lg font-extrabold">{attempt.totalQuestions}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <Card className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
            <div className="flex items-center gap-3 text-sm font-bold">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          </Card>
        )}

        {orderedQuestions.map((question, index) => {
          const selectedOption = selectedAnswers[question.id];

          return (
            <Card
              key={question.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                Question {index + 1}
              </p>
              <h2 className="mt-3 text-base font-extrabold leading-7 text-slate-950 dark:text-white sm:text-lg">
                {question.questionText}
              </h2>
              <div className="mt-5 grid gap-3">
                {optionKeys.map((option) => {
                  const isSelected = selectedOption === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={Boolean(selectedOption)}
                      onClick={() => void handleSelect(question.id, option)}
                      className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 text-teal-900 dark:border-teal-500 dark:bg-teal-950/40 dark:text-teal-100'
                          : selectedOption
                            ? 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-700 dark:hover:bg-teal-950/30'
                      }`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold dark:bg-slate-800">
                        {option}
                      </span>
                      <span>{getOptionText(question, option)}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}

        <div className="sticky bottom-4 pt-2">
          <Button
            type="button"
            onClick={() => void submitNow()}
            disabled={submitting}
            className="h-12 w-full rounded-xl bg-teal-600 text-base font-extrabold text-white shadow-xl shadow-teal-600/20 hover:bg-teal-700"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-5 w-5" />
            )}
            Submit Exam
          </Button>
        </div>
      </main>
    </div>
  );
}
