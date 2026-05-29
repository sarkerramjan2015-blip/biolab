import { useEffect, useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Seo from '@/src/components/Seo';
import { useAuth } from '@/lib/auth';
import PageNavActions from '@/src/components/navigation/PageNavActions';
import {
  fetchQuestionsByIds,
  useAttemptAnswers,
  useExamAttempt,
  type McqQuestion,
} from '@/lib/exams';
import { formatExamTime, type AnswerOption } from '@/src/data/exam';

function getOptionText(question: McqQuestion, option: AnswerOption | null | undefined) {
  if (!option) {
    return 'Not answered';
  }

  return {
    A: question.optionA,
    B: question.optionB,
    C: question.optionC,
    D: question.optionD,
  }[option];
}

export default function ExamResult() {
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attempt');
  const { user, loading: authLoading } = useAuth();
  const { attempt, loading: attemptLoading } = useExamAttempt(attemptId);
  const { answers, loading: answersLoading } = useAttemptAnswers(attemptId);
  const [questions, setQuestions] = useState<McqQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  useEffect(() => {
    if (!attempt) {
      return;
    }

    let cancelled = false;
    setQuestionsLoading(true);

    fetchQuestionsByIds(attempt.questionIds)
      .then((nextQuestions) => {
        if (!cancelled) {
          setQuestions(nextQuestions);
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
  }, [attempt]);

  const questionMap = useMemo(() => new Map(questions.map((question) => [question.id, question])), [questions]);
  const answerMap = useMemo(() => new Map(answers.map((answer) => [answer.questionId, answer])), [answers]);
  const wrongAnswers = useMemo(
    () => attempt?.questionIds
      .map((questionId) => ({
        question: questionMap.get(questionId),
        answer: answerMap.get(questionId),
      }))
      .filter((item) => item.question && !item.answer?.isCorrect) ?? [],
    [answerMap, attempt, questionMap],
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

  if (attempt && attempt.status !== 'submitted') {
    return <Navigate to={`/exam/session?attempt=${attempt.id}`} replace />;
  }

  if (authLoading || attemptLoading || answersLoading || questionsLoading || !attempt) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
          Loading result...
        </div>
      </div>
    );
  }

  const percentage = attempt.percentage ?? 0;
  const passed = percentage >= 40;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <Seo
        title="Exam Result"
        description="BIO LAB MCQ exam result summary and wrong answer analysis."
      />

      <main className="mx-auto max-w-6xl space-y-6">
        <PageNavActions backPath="/exam" />
        <header>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
            Result Summary
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-5xl">
            {attempt.examName}
          </h1>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Student Name', attempt.studentName],
            ['Total Questions', attempt.totalQuestions],
            ['Correct Answers', attempt.correctCount ?? 0],
            ['Wrong Answers', attempt.wrongCount ?? 0],
            ['Score', `${attempt.score ?? 0}/${attempt.totalQuestions}`],
            ['Percentage', `${percentage}%`],
            ['Status', passed ? 'Passed' : 'Needs Improvement'],
            ['Time Taken', formatExamTime(attempt.timeTakenSeconds ?? 0)],
          ].map(([label, value]) => (
            <Card
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white">{value}</p>
            </Card>
          ))}
        </section>

        <Card className={`rounded-2xl border p-5 shadow-sm ${
          passed
            ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'
            : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            {passed ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            <p className="font-extrabold">
              {passed ? 'ভালো হয়েছে।' : 'আরও practice দরকার।'}
            </p>
          </div>
        </Card>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-700 dark:text-red-300">
              Wrong Answer Analysis
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white">
              কোথায় ভুল হয়েছে
            </h2>
          </div>

          {wrongAnswers.length === 0 ? (
            <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="font-bold text-slate-700 dark:text-slate-200">সব answer সঠিক হয়েছে।</p>
            </Card>
          ) : (
            wrongAnswers.map(({ question, answer }, index) => question && (
              <Card
                key={question.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-700 dark:text-red-300">
                  Question {index + 1}
                </p>
                <h3 className="mt-3 text-base font-extrabold leading-7 text-slate-950 dark:text-white">
                  {question.questionText}
                </h3>
                {question.questionImageUrl && (
                  <img src={question.questionImageUrl} alt="Question" className="mt-3 max-h-48 w-full rounded-lg object-contain object-left" />
                )}
                <div className="mt-4 grid gap-3 text-sm font-medium sm:grid-cols-2">
                  <div className="rounded-xl bg-red-50 p-4 text-red-900 dark:bg-red-950/30 dark:text-red-100">
                    <p className="text-xs font-bold uppercase tracking-[0.16em]">Your Answer</p>
                    <p className="mt-2">{getOptionText(question, answer?.selectedOption)}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
                    <p className="text-xs font-bold uppercase tracking-[0.16em]">Correct Answer</p>
                    <p className="mt-2">{getOptionText(question, question.correctOption)}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/40">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Explanation</p>
                  <p className="mt-2 text-sm font-medium leading-7 text-slate-700 dark:text-slate-200">
                    {question.explanation}
                  </p>
                  {question.explanationImageUrl && (
                    <img src={question.explanationImageUrl} alt="Explanation" className="mt-3 max-h-48 w-full rounded-lg object-contain object-left" />
                  )}
                </div>
              </Card>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
