import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Eye, Loader2, Search, Trophy, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import Seo from '@/src/components/Seo';
import {
  fetchQuestionsByIds,
  useAttemptAnswers,
  useExamAttempts,
  type ExamAttempt,
  type McqQuestion,
} from '@/lib/exams';
import { formatExamTime, type AnswerOption, type ExamLevel, type ExamSubject } from '@/src/data/exam';

function formatDate(timestamp?: number) {
  if (!timestamp) {
    return 'Not submitted';
  }

  return new Intl.DateTimeFormat('en-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}

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

function AttemptDetailSheet({
  attempt,
  open,
  onOpenChange,
}: {
  attempt: ExamAttempt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { answers, loading: answersLoading } = useAttemptAnswers(attempt?.id ?? null);
  const [questions, setQuestions] = useState<McqQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  useEffect(() => {
    if (!attempt) {
      setQuestions([]);
      setQuestionsLoading(false);
      return;
    }

    let cancelled = false;
    setQuestionsLoading(true);

    fetchQuestionsByIds(attempt.questionIds)
      .then((nextQuestions) => {
        if (!cancelled) {
          const questionMap = new Map(nextQuestions.map((question) => [question.id, question]));
          setQuestions(
            attempt.questionIds
              .map((questionId) => questionMap.get(questionId))
              .filter(Boolean) as McqQuestion[],
          );
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

  const answerMap = useMemo(() => new Map(answers.map((answer) => [answer.questionId, answer])), [answers]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="!w-full max-w-none overflow-y-auto sm:!max-w-3xl">
        <SheetHeader className="border-b border-slate-200 dark:border-slate-800">
          <SheetTitle className="text-xl font-extrabold">Full Answer Report</SheetTitle>
          <SheetDescription>
            {attempt ? `${attempt.studentName} | ${attempt.examName}` : 'Select an attempt to inspect.'}
          </SheetDescription>
        </SheetHeader>

        {!attempt ? null : (
          <div className="space-y-5 px-4 pb-6">
            <section className="grid gap-3 sm:grid-cols-2">
              {[
                ['Student', attempt.studentName],
                ['Email', attempt.studentEmail ?? 'No email'],
                ['Phone', attempt.studentPhone ?? 'No phone'],
                ['Submitted', formatDate(attempt.submittedAt)],
                ['Score', `${attempt.score ?? 0}/${attempt.totalQuestions}`],
                ['Time Taken', formatExamTime(attempt.timeTakenSeconds ?? 0)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/40">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-bold text-slate-950 dark:text-white">{value}</p>
                </div>
              ))}
            </section>

            {answersLoading || questionsLoading ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading full report...
              </div>
            ) : (
              <section className="space-y-3">
                {questions.map((question, index) => {
                  const answer = answerMap.get(question.id);
                  const isCorrect = Boolean(answer?.isCorrect);

                  return (
                    <Card
                      key={question.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
                          Question {index + 1}
                        </p>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                          isCorrect
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                        }`}>
                          {isCorrect ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : <XCircle className="mr-1 h-3.5 w-3.5" />}
                          {isCorrect ? 'Correct' : 'Wrong'}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-extrabold leading-7 text-slate-950 dark:text-white">
                        {question.questionText}
                      </h3>
                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/40">
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Student Answer</p>
                          <p className="mt-2 font-semibold text-slate-700 dark:text-slate-200">
                            {getOptionText(question, answer?.selectedOption)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                            Correct Answer
                          </p>
                          <p className="mt-2 font-semibold text-emerald-900 dark:text-emerald-100">
                            {getOptionText(question, question.correctOption)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/40">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Explanation</p>
                        <p className="mt-2 text-sm font-medium leading-7 text-slate-700 dark:text-slate-200">
                          {question.explanation}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </section>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function AdminExamReport() {
  const { attempts, loading } = useExamAttempts();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | ExamLevel>('all');
  const [subjectFilter, setSubjectFilter] = useState<'all' | ExamSubject>('all');
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);

  const filteredAttempts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return attempts.filter((attempt) => {
      const matchesLevel = levelFilter === 'all' || attempt.level === levelFilter;
      const matchesSubject = subjectFilter === 'all' || attempt.subject === subjectFilter;
      const matchesSearch = !normalizedSearch
        || attempt.studentName.toLowerCase().includes(normalizedSearch)
        || attempt.studentEmail?.toLowerCase().includes(normalizedSearch)
        || attempt.studentPhone?.toLowerCase().includes(normalizedSearch)
        || attempt.examName.toLowerCase().includes(normalizedSearch);

      return matchesLevel && matchesSubject && matchesSearch;
    });
  }, [attempts, levelFilter, searchTerm, subjectFilter]);

  const stats = useMemo(() => {
    if (attempts.length === 0) {
      return { total: 0, averageScore: 0, passRate: 0, averageTime: 0 };
    }

    const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.percentage ?? 0), 0);
    const passed = attempts.filter((attempt) => (attempt.percentage ?? 0) >= 40).length;
    const totalTime = attempts.reduce((sum, attempt) => sum + (attempt.timeTakenSeconds ?? 0), 0);

    return {
      total: attempts.length,
      averageScore: Number((totalScore / attempts.length).toFixed(1)),
      passRate: Number(((passed / attempts.length) * 100).toFixed(1)),
      averageTime: Math.round(totalTime / attempts.length),
    };
  }, [attempts]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Seo title="Admin Exam Report" description="Review BIO LAB submitted exam attempts and student performance." />

      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-500">Performance</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">Exam Reports</h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Submitted Attempts', stats.total],
          ['Average Score', `${stats.averageScore}%`],
          ['Pass Rate', `${stats.passRate}%`],
          ['Average Time', formatExamTime(stats.averageTime)],
        ].map(([label, value]) => (
          <Card key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">{value}</p>
          </Card>
        ))}
      </section>

      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_220px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search student, email, phone, or exam"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value as 'all' | ExamLevel)} className="h-11 rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
            <option value="all">All Levels</option>
            <option value="SSC">SSC</option>
            <option value="HSC">HSC</option>
          </select>
          <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value as 'all' | ExamSubject)} className="h-11 rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
            <option value="all">All Subjects</option>
            <option value="Biology">Biology</option>
            <option value="Udbid Biggan">Udbid Biggan</option>
            <option value="Prani Biggan">Prani Biggan</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <p className="p-6 text-sm font-semibold text-slate-500">Loading reports...</p>
        ) : filteredAttempts.length === 0 ? (
          <p className="p-6 font-semibold text-slate-600 dark:text-slate-300">No submitted attempts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-950/40">
                <tr>
                  {[
                    'Student',
                    'Class',
                    'Exam Type',
                    'Subject',
                    'Chapter',
                    'Score',
                    'Correct',
                    'Wrong',
                    'Percentage',
                    'Date',
                    'Action',
                  ].map((label) => (
                    <th key={label} className="whitespace-nowrap px-4 py-3">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="align-top">
                    <td className="min-w-56 px-4 py-4">
                      <p className="font-bold text-slate-950 dark:text-white">{attempt.studentName}</p>
                      <p className="mt-1 text-xs text-slate-500">{attempt.studentEmail ?? 'No email'}</p>
                      <p className="mt-1 text-xs text-slate-500">{attempt.studentPhone ?? 'No phone'}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">{attempt.level}</td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {attempt.testType === 'chapter_wise' ? 'Chapter Wise' : 'Full Book'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">{attempt.subject}</td>
                    <td className="whitespace-nowrap px-4 py-4">{attempt.chapterName ?? '-'}</td>
                    <td className="whitespace-nowrap px-4 py-4 font-bold">{attempt.score ?? 0}/{attempt.totalQuestions}</td>
                    <td className="whitespace-nowrap px-4 py-4">{attempt.correctCount ?? 0}</td>
                    <td className="whitespace-nowrap px-4 py-4">{attempt.wrongCount ?? 0}</td>
                    <td className="whitespace-nowrap px-4 py-4">{attempt.percentage ?? 0}%</td>
                    <td className="min-w-40 px-4 py-4">
                      <p>{formatDate(attempt.submittedAt)}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatExamTime(attempt.timeTakenSeconds ?? 0)}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <Button type="button" variant="outline" onClick={() => setSelectedAttempt(attempt)} className="rounded-xl font-bold">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AttemptDetailSheet
        attempt={selectedAttempt}
        open={Boolean(selectedAttempt)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAttempt(null);
          }
        }}
      />
    </div>
  );
}
