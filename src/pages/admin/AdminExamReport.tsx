import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  GraduationCap,
  Loader2,
  Medal,
  PlayCircle,
  RotateCcw,
  Search,
  Trophy,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react';
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

type AttemptStatusFilter = 'submitted' | 'running' | 'all';
type ResultSort = 'latest' | 'highest' | 'lowest';

function formatDate(timestamp?: number) {
  if (!timestamp) return 'এখনো জমা হয়নি';
  return new Intl.DateTimeFormat('bn-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}

function subjectLabel(subject: ExamSubject) {
  if (subject === 'Udbid Biggan') return 'উদ্ভিদবিজ্ঞান';
  if (subject === 'Prani Biggan') return 'প্রাণিবিজ্ঞান';
  return 'Biology';
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'S';
}

function getScoreTone(percentage = 0) {
  if (percentage >= 80) return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300';
  if (percentage >= 60) return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300';
  if (percentage >= 40) return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300';
  return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300';
}

function getOptionText(question: McqQuestion, option: AnswerOption | null | undefined) {
  if (!option) return 'উত্তর দেওয়া হয়নি';
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
      .catch((error) => {
        console.error('Failed to load answer report questions:', error);
        if (!cancelled) setQuestions([]);
      })
      .finally(() => {
        if (!cancelled) setQuestionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const answerMap = useMemo(
    () => new Map(answers.map((answer) => [answer.questionId, answer])),
    [answers],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="!w-full max-w-none overflow-y-auto p-0 sm:!max-w-3xl">
        <SheetHeader className="border-b border-slate-200 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-900">
          <SheetTitle className="text-xl font-extrabold">সম্পূর্ণ Answer Report</SheetTitle>
          <SheetDescription>
            {attempt ? `${attempt.studentName} · ${attempt.examName}` : 'একটি result নির্বাচন করুন।'}
          </SheetDescription>
        </SheetHeader>

        {attempt && (
          <div className="space-y-5 bg-slate-50/60 p-4 pb-8 dark:bg-slate-950/30 sm:p-5">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-center">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-extrabold text-white dark:bg-white dark:text-slate-950">
                    {getInitials(attempt.studentName)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-extrabold text-slate-950 dark:text-white">{attempt.studentName}</h2>
                    <p className="mt-1 truncate text-sm font-medium text-slate-500">{attempt.studentEmail ?? 'Email দেওয়া হয়নি'}</p>
                    <p className="mt-1 text-xs font-bold text-slate-400">{formatDate(attempt.submittedAt)}</p>
                  </div>
                </div>
                <div className={`rounded-2xl border p-4 text-center ${getScoreTone(attempt.percentage)}`}>
                  <p className="text-3xl font-extrabold">{attempt.percentage ?? 0}%</p>
                  <p className="mt-1 text-xs font-bold">Score {attempt.score ?? 0}/{attempt.totalQuestions}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 border-t border-slate-100 sm:grid-cols-4 dark:border-slate-800">
                {[
                  ['সঠিক', attempt.correctCount ?? 0, 'text-emerald-600'],
                  ['ভুল', attempt.wrongCount ?? 0, 'text-rose-600'],
                  ['উত্তর নেই', Math.max(0, attempt.totalQuestions - (attempt.correctCount ?? 0) - (attempt.wrongCount ?? 0)), 'text-amber-600'],
                  ['সময়', formatExamTime(attempt.timeTakenSeconds ?? 0), 'text-sky-600'],
                ].map(([label, value, tone]) => (
                  <div key={label} className="border-r border-slate-100 p-3 text-center last:border-r-0 dark:border-slate-800">
                    <p className={`text-lg font-extrabold ${tone}`}>{value}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-indigo-600">Exam</p>
              <h3 className="mt-2 font-extrabold text-slate-950 dark:text-white">{attempt.examName}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{attempt.level}</span>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">{subjectLabel(attempt.subject)}</span>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">{attempt.chapterName ?? 'Full Book'}</span>
                {attempt.studentPhone && <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">{attempt.studentPhone}</span>}
              </div>
            </section>

            {answersLoading || questionsLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                <Loader2 className="h-4 w-4 animate-spin" /> Answer report load হচ্ছে…
              </div>
            ) : questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                এই attempt-এর question details পাওয়া যায়নি।
              </div>
            ) : (
              <section className="space-y-3">
                {questions.map((question, index) => {
                  const answer = answerMap.get(question.id);
                  const isCorrect = Boolean(answer?.isCorrect);
                  const wasAnswered = Boolean(answer?.selectedOption);

                  return (
                    <Card key={question.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">Question {index + 1}</p>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          isCorrect
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : wasAnswered
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}>
                          {isCorrect ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : <XCircle className="mr-1 h-3.5 w-3.5" />}
                          {isCorrect ? 'সঠিক' : wasAnswered ? 'ভুল' : 'উত্তর নেই'}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-extrabold leading-7 text-slate-950 dark:text-white">{question.questionText}</h3>
                      {question.questionImageUrl && (
                        <img src={question.questionImageUrl} alt="Question" className="mt-3 max-h-52 rounded-xl border border-slate-200 object-contain dark:border-slate-800" />
                      )}
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className={`rounded-xl p-4 ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-rose-50 dark:bg-rose-950/30'}`}>
                          <p className={`text-xs font-bold uppercase tracking-[0.12em] ${isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>শিক্ষার্থীর উত্তর</p>
                          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{getOptionText(question, answer?.selectedOption)}</p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">সঠিক উত্তর</p>
                          <p className="mt-2 text-sm font-semibold text-emerald-900 dark:text-emerald-100">{getOptionText(question, question.correctOption)}</p>
                        </div>
                      </div>
                      {(question.explanation || question.explanationImageUrl) && (
                        <div className="mt-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/50">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">ব্যাখ্যা</p>
                          {question.explanation && <p className="mt-2 text-sm font-medium leading-7 text-slate-700 dark:text-slate-200">{question.explanation}</p>}
                          {question.explanationImageUrl && <img src={question.explanationImageUrl} alt="Explanation" className="mt-3 max-h-52 rounded-xl object-contain" />}
                        </div>
                      )}
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
  const { attempts, loading } = useExamAttempts(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | ExamLevel>('all');
  const [subjectFilter, setSubjectFilter] = useState<'all' | ExamSubject>('all');
  const [statusFilter, setStatusFilter] = useState<AttemptStatusFilter>('submitted');
  const [sortBy, setSortBy] = useState<ResultSort>('latest');
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);

  const submittedAttempts = attempts.filter((attempt) => attempt.status === 'submitted');
  const runningAttempts = attempts.filter((attempt) => attempt.status === 'running');

  const filteredAttempts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const next = attempts.filter((attempt) => {
      const matchesLevel = levelFilter === 'all' || attempt.level === levelFilter;
      const matchesSubject = subjectFilter === 'all' || attempt.subject === subjectFilter;
      const matchesStatus = statusFilter === 'all' || attempt.status === statusFilter;
      const matchesSearch = !normalizedSearch
        || attempt.studentName.toLowerCase().includes(normalizedSearch)
        || attempt.studentEmail?.toLowerCase().includes(normalizedSearch)
        || attempt.studentPhone?.toLowerCase().includes(normalizedSearch)
        || attempt.examName.toLowerCase().includes(normalizedSearch);
      return matchesLevel && matchesSubject && matchesStatus && matchesSearch;
    });

    return next.sort((a, b) => {
      if (sortBy === 'highest') return (b.percentage ?? -1) - (a.percentage ?? -1);
      if (sortBy === 'lowest') return (a.percentage ?? 101) - (b.percentage ?? 101);
      return (b.submittedAt ?? b.startedAt) - (a.submittedAt ?? a.startedAt);
    });
  }, [attempts, levelFilter, searchTerm, sortBy, statusFilter, subjectFilter]);

  const stats = useMemo(() => {
    if (submittedAttempts.length === 0) {
      return { students: 0, averageScore: 0, passRate: 0, bestScore: 0 };
    }
    const totalScore = submittedAttempts.reduce((sum, attempt) => sum + (attempt.percentage ?? 0), 0);
    const passed = submittedAttempts.filter((attempt) => (attempt.percentage ?? 0) >= 40).length;
    return {
      students: new Set(submittedAttempts.map((attempt) => attempt.userId)).size,
      averageScore: Number((totalScore / submittedAttempts.length).toFixed(1)),
      passRate: Number(((passed / submittedAttempts.length) * 100).toFixed(1)),
      bestScore: Math.max(...submittedAttempts.map((attempt) => attempt.percentage ?? 0)),
    };
  }, [submittedAttempts]);

  const resetFilters = () => {
    setSearchTerm('');
    setLevelFilter('all');
    setSubjectFilter('all');
    setStatusFilter('submitted');
    setSortBy('latest');
  };

  const downloadCsv = () => {
    const exportAttempts = filteredAttempts.filter((attempt) => attempt.status === 'submitted');
    const headers = ['Student', 'Email', 'Phone', 'Level', 'Exam', 'Subject', 'Chapter', 'Score', 'Percentage', 'Correct', 'Wrong', 'Time', 'Submitted'];
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = exportAttempts.map((attempt) => [
      attempt.studentName,
      attempt.studentEmail,
      attempt.studentPhone,
      attempt.level,
      attempt.examName,
      subjectLabel(attempt.subject),
      attempt.chapterName ?? 'Full Book',
      `${attempt.score ?? 0}/${attempt.totalQuestions}`,
      attempt.percentage ?? 0,
      attempt.correctCount ?? 0,
      attempt.wrongCount ?? 0,
      formatExamTime(attempt.timeTakenSeconds ?? 0),
      formatDate(attempt.submittedAt),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `biolab-exam-results-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportableCount = filteredAttempts.filter((attempt) => attempt.status === 'submitted').length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Seo title="Exam Results | Admin" description="Review BIO LAB student exam results and answer reports." />

      <header className="bio-grid rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-500">Student Performance</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">পরীক্ষার্থী ও Result</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500">
              শিক্ষার্থীর score, সময় ও প্রতিটি উত্তরের বিস্তারিত এক জায়গায় দেখুন।
            </p>
          </div>
          <Button type="button" variant="outline" onClick={downloadCsv} disabled={exportableCount === 0} className="h-11 w-fit rounded-xl font-bold">
            <Download className="mr-2 h-4 w-4" /> Excel Result ({exportableCount})
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'জমা Exam', value: submittedAttempts.length, icon: CheckCircle2, tone: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300' },
          { label: 'চলমান', value: runningAttempts.length, icon: PlayCircle, tone: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
          { label: 'শিক্ষার্থী', value: stats.students, icon: Users, tone: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' },
          { label: 'গড় Score', value: `${stats.averageScore}%`, icon: BarChart3, tone: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' },
          { label: 'Pass Rate', value: `${stats.passRate}%`, icon: Trophy, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
          { label: 'সেরা Score', value: `${stats.bestScore}%`, icon: Medal, tone: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-2">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.tone}`}><Icon className="h-4 w-4" /></span>
                <p className="text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl">{item.value}</p>
              </div>
              <p className="mt-3 text-xs font-bold text-slate-500">{item.label}</p>
            </Card>
          );
        })}
      </section>

      <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_130px_180px_150px_140px_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="নাম, email, phone বা exam খুঁজুন"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value as 'all' | ExamLevel)} aria-label="Result level" className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-950">
            <option value="all">সব Level</option>
            <option value="SSC">SSC</option>
            <option value="HSC">HSC</option>
          </select>
          <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value as 'all' | ExamSubject)} aria-label="Result subject" className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-950">
            <option value="all">সব Subject</option>
            <option value="Biology">Biology</option>
            <option value="Udbid Biggan">উদ্ভিদবিজ্ঞান</option>
            <option value="Prani Biggan">প্রাণিবিজ্ঞান</option>
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as AttemptStatusFilter)} aria-label="Result status" className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-950">
            <option value="submitted">জমা Result</option>
            <option value="running">চলমান Exam</option>
            <option value="all">সব Status</option>
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as ResultSort)} aria-label="Result sort" className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-950">
            <option value="latest">সর্বশেষ</option>
            <option value="highest">Score বেশি</option>
            <option value="lowest">Score কম</option>
          </select>
          <Button type="button" variant="ghost" onClick={resetFilters} className="h-11 rounded-xl font-bold text-slate-500">
            <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">Result List</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">{filteredAttempts.length}টি record</h2>
        </div>
      </div>

      <section className="grid gap-3 lg:grid-cols-2">
        {loading ? (
          <Card className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-10 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Result load হচ্ছে…
          </Card>
        ) : filteredAttempts.length === 0 ? (
          <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900 lg:col-span-2">
            <GraduationCap className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 font-extrabold text-slate-800 dark:text-slate-200">এই filter-এ কোনো result পাওয়া যায়নি</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">Filter reset করুন অথবা নতুন exam submit হওয়া পর্যন্ত অপেক্ষা করুন।</p>
            <Button type="button" variant="outline" onClick={resetFilters} className="mt-4 rounded-xl font-bold">Filter reset</Button>
          </Card>
        ) : filteredAttempts.map((attempt) => {
          const submitted = attempt.status === 'submitted';
          return (
            <Card key={attempt.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-extrabold text-white dark:bg-white dark:text-slate-950">
                    {getInitials(attempt.studentName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-extrabold text-slate-950 dark:text-white">{attempt.studentName}</h3>
                        <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{attempt.studentEmail ?? attempt.studentPhone ?? 'যোগাযোগ দেওয়া হয়নি'}</p>
                      </div>
                      {submitted ? (
                        <span className={`rounded-xl border px-3 py-1.5 text-sm font-extrabold ${getScoreTone(attempt.percentage)}`}>{attempt.percentage ?? 0}%</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                          <PlayCircle className="mr-1.5 h-3.5 w-3.5" /> পরীক্ষা চলছে
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
                  <p className="font-extrabold text-slate-900 dark:text-white">{attempt.examName}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">{attempt.level}</span>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">{subjectLabel(attempt.subject)}</span>
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">{attempt.chapterName ?? 'Full Book'}</span>
                  </div>
                </div>

                {submitted ? (
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                    {[
                      ['Score', `${attempt.score ?? 0}/${attempt.totalQuestions}`],
                      ['সঠিক', attempt.correctCount ?? 0],
                      ['ভুল', attempt.wrongCount ?? 0],
                      ['সময়', formatExamTime(attempt.timeTakenSeconds ?? 0)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-slate-100 p-2 dark:border-slate-800">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white">{value}</p>
                        <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                    <Clock3 className="h-3.5 w-3.5" /> শুরু: {formatDate(attempt.startedAt)}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/30 sm:px-5">
                <p className="text-xs font-medium text-slate-500">{submitted ? formatDate(attempt.submittedAt) : 'Student এখন পরীক্ষা দিচ্ছে'}</p>
                {submitted && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedAttempt(attempt)} className="rounded-xl font-bold">
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> বিস্তারিত
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </section>

      <AttemptDetailSheet
        attempt={selectedAttempt}
        open={Boolean(selectedAttempt)}
        onOpenChange={(open) => {
          if (!open) setSelectedAttempt(null);
        }}
      />
    </div>
  );
}
