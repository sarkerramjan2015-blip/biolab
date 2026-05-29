import { useMemo, useState, useRef } from 'react';
import { CheckCircle2, Pencil, Plus, Search, Trash2, XCircle, UploadCloud, Download } from 'lucide-react';
import { doc, writeBatch } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Seo from '@/src/components/Seo';
import { db } from '@/lib/firebase';
import { useCloudinaryWidget } from '@/lib/useCloudinaryWidget';
import {
  useMcqQuestions,
  type McqQuestion,
  type McqQuestionInput,
} from '@/lib/exams';
import {
  hscBotanyExamChapters,
  hscZoologyExamChapters,
  QUESTION_POOL_TARGET,
  questionDifficultyLabels,
  sscExamChapters,
  type AnswerOption,
  type ContentStatus,
  type ExamLevel,
  type ExamSubject,
  type ExamTestType,
  type QuestionDifficulty,
} from '@/src/data/exam';

type QuestionFormState = {
  level: ExamLevel;
  subject: ExamSubject;
  testType: ExamTestType;
  chapterName: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: AnswerOption;
  explanation: string;
  difficulty: QuestionDifficulty;
  status: ContentStatus;
  questionImageUrl: string;
  explanationImageUrl: string;
};

const initialFormState: QuestionFormState = {
  level: 'SSC',
  subject: 'Biology',
  testType: 'chapter_wise',
  chapterName: 'Chapter 1',
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'A',
  explanation: '',
  difficulty: 'Easy',
  status: 'active',
  questionImageUrl: '',
  explanationImageUrl: '',
};

function getSubjects(level: ExamLevel): ExamSubject[] {
  return level === 'SSC' ? ['Biology'] : ['Udbid Biggan', 'Prani Biggan'];
}

function getChapters(level: ExamLevel, subject: ExamSubject) {
  if (level === 'SSC') {
    return sscExamChapters;
  }

  return subject === 'Udbid Biggan' ? hscBotanyExamChapters : hscZoologyExamChapters;
}

function toFormState(question: McqQuestion): QuestionFormState {
  return {
    level: question.level,
    subject: question.subject,
    testType: question.testType,
    chapterName: question.chapterName ?? '',
    questionText: question.questionText,
    optionA: question.optionA,
    optionB: question.optionB,
    optionC: question.optionC,
    optionD: question.optionD,
    correctOption: question.correctOption,
    explanation: question.explanation,
    difficulty: question.difficulty,
    status: question.status,
    questionImageUrl: question.questionImageUrl || '',
    explanationImageUrl: question.explanationImageUrl || '',
  };
}

function toQuestionInput(formState: QuestionFormState): McqQuestionInput {
  return {
    level: formState.level,
    subject: formState.subject,
    testType: formState.testType,
    chapterName: formState.testType === 'chapter_wise' ? formState.chapterName : undefined,
    questionText: formState.questionText.trim(),
    optionA: formState.optionA.trim(),
    optionB: formState.optionB.trim(),
    optionC: formState.optionC.trim(),
    optionD: formState.optionD.trim(),
    correctOption: formState.correctOption,
    explanation: formState.explanation.trim(),
    difficulty: formState.difficulty,
    status: formState.status,
    questionImageUrl: formState.questionImageUrl.trim() || null,
    explanationImageUrl: formState.explanationImageUrl.trim() || null,
  };
}

const chapterCatalog = [
  ...sscExamChapters.map((chapter) => ({
    level: 'SSC' as const,
    subject: 'Biology' as const,
    ...chapter,
  })),
  ...hscBotanyExamChapters.map((chapter) => ({
    level: 'HSC' as const,
    subject: 'Udbid Biggan' as const,
    ...chapter,
  })),
  ...hscZoologyExamChapters.map((chapter) => ({
    level: 'HSC' as const,
    subject: 'Prani Biggan' as const,
    ...chapter,
  })),
];

export default function AdminMcq() {
  const { questions, loading, addQuestion, updateQuestion, removeQuestion } = useMcqQuestions();
  const [formState, setFormState] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | ExamLevel>('all');
  const [subjectFilter, setSubjectFilter] = useState<'all' | ExamSubject>('all');
  const [testTypeFilter, setTestTypeFilter] = useState<'all' | ExamTestType>('all');
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { openWidget: openQuestionImageWidget, isReady: isQuestionWidgetReady } = useCloudinaryWidget({
    resourceType: 'image',
    folder: 'biolab/mcq-images',
    onSuccess: (secureUrl) => {
      setFormState((current) => ({ ...current, questionImageUrl: secureUrl }));
    },
    onError: () => {
      window.alert('Question image upload failed. Please try again.');
    }
  });

  const { openWidget: openExplanationImageWidget, isReady: isExplanationWidgetReady } = useCloudinaryWidget({
    resourceType: 'image',
    folder: 'biolab/mcq-images',
    onSuccess: (secureUrl) => {
      setFormState((current) => ({ ...current, explanationImageUrl: secureUrl }));
    },
    onError: () => {
      window.alert('Explanation image upload failed. Please try again.');
    }
  });

  const chapters = getChapters(formState.level, formState.subject);
  const filteredQuestions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesLevel = levelFilter === 'all' || question.level === levelFilter;
      const matchesSubject = subjectFilter === 'all' || question.subject === subjectFilter;
      const matchesTestType = testTypeFilter === 'all' || question.testType === testTypeFilter;
      const matchesSearch = !normalizedSearch
        || question.questionText.toLowerCase().includes(normalizedSearch)
        || question.explanation.toLowerCase().includes(normalizedSearch);

      return matchesLevel && matchesSubject && matchesTestType && matchesSearch;
    });
  }, [levelFilter, questions, searchTerm, subjectFilter, testTypeFilter]);

  const stats = {
    total: questions.length,
    active: questions.filter((question) => question.status === 'active').length,
    inactive: questions.filter((question) => question.status === 'inactive').length,
    chapterWise: questions.filter((question) => question.testType === 'chapter_wise').length,
  };
  const chapterReadiness = useMemo(() => (
    chapterCatalog.map((chapter) => {
      const activeCount = questions.filter((question) => (
        question.level === chapter.level
        && question.subject === chapter.subject
        && question.testType === 'chapter_wise'
        && question.chapterName === chapter.name
        && question.status === 'active'
      )).length;
      const progress = Math.min(100, Math.round((activeCount / QUESTION_POOL_TARGET) * 100));

      return {
        ...chapter,
        activeCount,
        remainingCount: Math.max(0, QUESTION_POOL_TARGET - activeCount),
        progress,
      };
    })
  ), [questions]);

  const updateLevel = (level: ExamLevel) => {
    const nextSubject = getSubjects(level)[0];
    const nextChapter = getChapters(level, nextSubject)[0]?.name ?? '';

    setFormState((current) => ({
      ...current,
      level,
      subject: nextSubject,
      chapterName: nextChapter,
    }));
  };

  const updateSubject = (subject: ExamSubject) => {
    const nextChapter = getChapters(formState.level, subject)[0]?.name ?? '';

    setFormState((current) => ({
      ...current,
      subject,
      chapterName: nextChapter,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormState(initialFormState);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formState.questionText.trim()
      || !formState.optionA.trim()
      || !formState.optionB.trim()
      || !formState.optionC.trim()
      || !formState.optionD.trim()
      || !formState.explanation.trim()
      || (formState.testType === 'chapter_wise' && !formState.chapterName)
    ) {
      window.alert('Please complete every required field.');
      return;
    }

    setSaving(true);

    try {
      const finalQuestionImageUrl = formState.questionImageUrl;
      const finalExplanationImageUrl = formState.explanationImageUrl;

      const input = {
        ...toQuestionInput(formState),
        questionImageUrl: finalQuestionImageUrl || null,
        explanationImageUrl: finalExplanationImageUrl || null,
      };

      if (editingId) {
        await updateQuestion(editingId, input);
      } else {
        await addQuestion(input);
      }

      resetForm();
    } catch (error) {
      console.error('Failed to save MCQ question:', error);
      window.alert('Question save failed. Please check admin permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (question: McqQuestion) => {
    setEditingId(question.id);
    setFormState(toFormState(question));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (question: McqQuestion) => {
    const confirmed = window.confirm('Remove this question? Used questions will be deactivated instead of deleted.');

    if (!confirmed) {
      return;
    }

    try {
      const result = await removeQuestion(question.id);

      if (result === 'deactivated') {
        window.alert('This question has past answers, so it was deactivated instead of deleted.');
      }
    } catch (error) {
      console.error('Failed to remove MCQ question:', error);
      window.alert('Question removal failed. Please check admin permissions.');
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const items = JSON.parse(text);

      if (!Array.isArray(items)) {
        throw new Error('JSON file must contain an array of questions.');
      }

      const chunkSize = 400;
      for (let index = 0; index < items.length; index += chunkSize) {
        const batch = writeBatch(db);
        const chunk = items.slice(index, index + chunkSize);

        chunk.forEach((item, itemIndex) => {
          const id = item.id || crypto.randomUUID();
          batch.set(doc(db, 'mcqQuestions', id), {
            ...initialFormState,
            ...item,
            createdAt: Date.now() + index + itemIndex,
            updatedAt: Date.now() + index + itemIndex,
          });
        });

        await batch.commit();
      }

      window.alert(`Successfully imported ${items.length} questions.`);
    } catch (error) {
      console.error('Bulk upload failed:', error);
      window.alert(`Upload failed: ${error instanceof Error ? error.message : 'Invalid JSON file or permission error.'}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = [initialFormState];
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mcq_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Seo title="Admin MCQ" description="Manage BIO LAB MCQ question bank for SSC and HSC exams." />

      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-500">Exam Content</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">MCQ Question Bank</h1>
          <div className="flex gap-2">
            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleBulkUpload} />
            <Button type="button" variant="outline" onClick={downloadTemplate} className="rounded-xl font-bold">
              <Download className="mr-2 h-4 w-4" /> Template
            </Button>
            <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={importing} className="rounded-xl bg-teal-600 font-bold text-white hover:bg-teal-700">
              <UploadCloud className="mr-2 h-4 w-4" /> {importing ? 'Uploading...' : 'Bulk JSON Upload'}
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total', stats.total],
          ['Active', stats.active],
          ['Inactive', stats.inactive],
          ['Chapter Wise', stats.chapterWise],
        ].map(([label, value]) => (
          <Card key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">{value}</p>
          </Card>
        ))}
      </section>

      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Chapter Pool Readiness</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
              100 active MCQ target per chapter
            </h2>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            Student attempts auto-shuffle questions from each active chapter pool.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {chapterReadiness.map((chapter) => {
            const ready = chapter.activeCount >= QUESTION_POOL_TARGET;

            return (
              <div
                key={`${chapter.level}-${chapter.subject}-${chapter.id}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/70"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
                      {chapter.level} | {chapter.subject}
                    </p>
                    <h3 className="mt-1 text-base font-extrabold text-slate-950 dark:text-white">
                      {chapter.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {chapter.title}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                      ready
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                    }`}
                  >
                    {ready ? 'Ready' : `${chapter.remainingCount} left`}
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      ready ? 'bg-emerald-500' : 'bg-gradient-to-r from-teal-500 to-indigo-500'
                    }`}
                    style={{ width: `${chapter.progress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                  {chapter.activeCount}/{QUESTION_POOL_TARGET} active MCQ
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              {editingId ? 'Edit Question' : 'New Question'}
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
              {editingId ? 'Update MCQ' : 'Add MCQ'}
            </h2>
          </div>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl font-bold">
              Cancel edit
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1.5 text-sm font-semibold">
              <span>Level</span>
              <select value={formState.level} onChange={(event) => updateLevel(event.target.value as ExamLevel)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
                <option value="SSC">SSC</option>
                <option value="HSC">HSC</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-semibold">
              <span>Subject</span>
              <select value={formState.subject} onChange={(event) => updateSubject(event.target.value as ExamSubject)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
                {getSubjects(formState.level).map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-semibold">
              <span>Test Type</span>
              <select value={formState.testType} onChange={(event) => setFormState((current) => ({ ...current, testType: event.target.value as ExamTestType }))} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
                <option value="chapter_wise">Chapter Wise</option>
                <option value="full_book">Full Book</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-semibold">
              <span>Difficulty</span>
              <select value={formState.difficulty} onChange={(event) => setFormState((current) => ({ ...current, difficulty: event.target.value as QuestionDifficulty }))} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
                {questionDifficultyLabels.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </label>
          </div>

          {formState.testType === 'chapter_wise' && (
            <label className="block space-y-1.5 text-sm font-semibold md:max-w-sm">
              <span>Chapter</span>
              <select value={formState.chapterName} onChange={(event) => setFormState((current) => ({ ...current, chapterName: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.name}>{chapter.name}: {chapter.title}</option>
                ))}
              </select>
            </label>
          )}

          <label className="block space-y-1.5 text-sm font-semibold">
            <span>Question Text</span>
            <textarea required value={formState.questionText} onChange={(event) => setFormState((current) => ({ ...current, questionText: event.target.value }))} className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
             <div className="space-y-1.5">
               <div className="flex items-center justify-between">
                 <label className="text-sm font-semibold">Question Image URL (Optional)</label>
                 <Button type="button" variant="outline" size="sm" onClick={openQuestionImageWidget} disabled={!isQuestionWidgetReady} className="h-7 text-xs">
                   <UploadCloud className="mr-1.5 h-3.5 w-3.5" /> Upload image
                 </Button>
               </div>
               <input type="text" placeholder="/mcq-images/example.png or https://..." value={formState.questionImageUrl} onChange={(e) => setFormState((current) => ({ ...current, questionImageUrl: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" />
             </div>
             <div className="space-y-1.5">
               <div className="flex items-center justify-between">
                 <label className="text-sm font-semibold">Explanation Image URL (Optional)</label>
                 <Button type="button" variant="outline" size="sm" onClick={openExplanationImageWidget} disabled={!isExplanationWidgetReady} className="h-7 text-xs">
                   <UploadCloud className="mr-1.5 h-3.5 w-3.5" /> Upload image
                 </Button>
               </div>
               <input type="text" placeholder="/mcq-images/example.png or https://..." value={formState.explanationImageUrl} onChange={(e) => setFormState((current) => ({ ...current, explanationImageUrl: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" />
             </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(['A', 'B', 'C', 'D'] as AnswerOption[]).map((option) => (
              <label key={option} className="space-y-1.5 text-sm font-semibold">
                <span>Option {option}</span>
                <input required value={formState[`option${option}`]} onChange={(event) => setFormState((current) => ({ ...current, [`option${option}`]: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" />
              </label>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1.5 text-sm font-semibold">
              <span>Correct Option</span>
              <select value={formState.correctOption} onChange={(event) => setFormState((current) => ({ ...current, correctOption: event.target.value as AnswerOption }))} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
                {(['A', 'B', 'C', 'D'] as AnswerOption[]).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-semibold">
              <span>Status</span>
              <select value={formState.status} onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value as ContentStatus }))} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>

          <label className="block space-y-1.5 text-sm font-semibold">
            <span>Explanation</span>
            <textarea required value={formState.explanation} onChange={(event) => setFormState((current) => ({ ...current, explanation: event.target.value }))} className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950" />
          </label>

          <Button type="submit" disabled={saving} className="h-11 rounded-xl bg-orange-600 px-5 font-bold text-white hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            {editingId ? 'Update Question' : 'Save Question'}
          </Button>
        </form>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search question or explanation" className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 dark:border-slate-700 dark:bg-slate-950" />
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
          <select value={testTypeFilter} onChange={(event) => setTestTypeFilter(event.target.value as 'all' | ExamTestType)} className="h-11 rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
            <option value="all">All Test Types</option>
            <option value="chapter_wise">Chapter Wise</option>
            <option value="full_book">Full Book</option>
          </select>
        </div>
      </Card>

      <section className="space-y-3">
        {loading ? (
          <p className="text-sm font-semibold text-slate-500">Loading questions...</p>
        ) : filteredQuestions.length === 0 ? (
          <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="font-semibold text-slate-600 dark:text-slate-300">No questions found.</p>
          </Card>
        ) : (
          filteredQuestions.map((question) => (
            <Card key={question.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{question.level}</span>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">{question.subject}</span>
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">{question.testType === 'chapter_wise' ? question.chapterName : 'Full Book'}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${question.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}>{question.status}</span>
                  </div>
                  <h2 className="mt-3 text-base font-extrabold leading-7 text-slate-950 dark:text-white">{question.questionText}</h2>
                  {question.questionImageUrl && (
                    <img src={question.questionImageUrl} alt="Question" className="mt-2 max-h-48 rounded-lg object-contain" />
                  )}
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                    <p>A. {question.optionA}</p>
                    <p>B. {question.optionB}</p>
                    <p>C. {question.optionC}</p>
                    <p>D. {question.optionD}</p>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Correct: {question.correctOption} | Difficulty: {question.difficulty}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => handleEdit(question)} className="rounded-xl font-bold">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button type="button" variant="outline" onClick={() => void updateQuestion(question.id, { status: question.status === 'active' ? 'inactive' : 'active' })} className="rounded-xl font-bold">
                    {question.status === 'active' ? <XCircle className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    {question.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => void handleDelete(question)} className="rounded-xl font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
