import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  Layers3,
  Loader2,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import { doc, writeBatch } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Seo from '@/src/components/Seo';
import { db } from '@/lib/firebase';
import { uploadAdminFile } from '@/lib/adminUpload';
import {
  useMcqQuestions,
  type McqQuestion,
  type McqQuestionInput,
} from '@/lib/exams';
import {
  hscBotanyExamChapters,
  hscZoologyExamChapters,
  QUESTION_POOL_TARGET,
  sscExamChapters,
  TOTAL_QUESTIONS,
  type AnswerOption,
  type ContentStatus,
  type ExamLevel,
  type ExamSubject,
  type ExamTestType,
  type QuestionDifficulty,
} from '@/src/data/exam';

type AdminMcqView = 'create' | 'bulk' | 'manage';
type SaveDestination = 'another' | 'manage';
type ManagerStatus = 'all' | ContentStatus;

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

type BulkPreview = {
  fileName: string;
  validQuestions: McqQuestionInput[];
  errors: string[];
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
  difficulty: 'Medium',
  status: 'active',
  questionImageUrl: '',
  explanationImageUrl: '',
};

const answerOptions: AnswerOption[] = ['A', 'B', 'C', 'D'];

function getSubjects(level: ExamLevel): ExamSubject[] {
  return level === 'SSC' ? ['Biology'] : ['Udbid Biggan', 'Prani Biggan'];
}

function getChapters(level: ExamLevel, subject: ExamSubject) {
  if (level === 'SSC') return sscExamChapters;
  return subject === 'Udbid Biggan' ? hscBotanyExamChapters : hscZoologyExamChapters;
}

function subjectDisplayName(subject: ExamSubject) {
  if (subject === 'Udbid Biggan') return 'উদ্ভিদবিজ্ঞান';
  if (subject === 'Prani Biggan') return 'প্রাণিবিজ্ঞান';
  return 'Biology';
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

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(field.trim());
      field = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function normalizeSubject(value: string, level: ExamLevel): ExamSubject | null {
  const normalized = value.trim().toLowerCase();
  if (level === 'SSC') return normalized === 'biology' || normalized === 'ssc biology' ? 'Biology' : null;
  if (['udbid biggan', 'botany', 'উদ্ভিদবিজ্ঞান', 'উদ্ভিদ বিজ্ঞান'].includes(normalized)) return 'Udbid Biggan';
  if (['prani biggan', 'zoology', 'প্রাণিবিজ্ঞান', 'প্রাণী বিজ্ঞান'].includes(normalized)) return 'Prani Biggan';
  return null;
}

function toBulkQuestion(row: Record<string, string>, rowNumber: number) {
  const errors: string[] = [];
  const level = row.level?.trim().toUpperCase();
  const resolvedLevel: ExamLevel | null = level === 'SSC' || level === 'HSC' ? level : null;
  if (!resolvedLevel) errors.push(`Row ${rowNumber}: Level অবশ্যই SSC অথবা HSC হবে।`);

  const subject = resolvedLevel ? normalizeSubject(row.subject || '', resolvedLevel) : null;
  if (!subject) errors.push(`Row ${rowNumber}: Subject সঠিক নয়।`);

  const questionText = row.question?.trim() || '';
  const optionA = row.option_a?.trim() || '';
  const optionB = row.option_b?.trim() || '';
  const optionC = row.option_c?.trim() || '';
  const optionD = row.option_d?.trim() || '';
  const correct = row.correct?.trim().toUpperCase();
  const correctOption = answerOptions.includes(correct as AnswerOption) ? correct as AnswerOption : null;

  if (!row.chapter?.trim()) errors.push(`Row ${rowNumber}: Chapter দিন।`);
  if (!questionText) errors.push(`Row ${rowNumber}: Question খালি।`);
  if (![optionA, optionB, optionC, optionD].every(Boolean)) errors.push(`Row ${rowNumber}: চারটি option-ই দিন।`);
  if (!correctOption) errors.push(`Row ${rowNumber}: Correct অবশ্যই A, B, C অথবা D হবে।`);

  if (!resolvedLevel || !subject || !correctOption || errors.length > 0) {
    return { question: null, errors };
  }

  const matchingChapter = getChapters(resolvedLevel, subject).find((chapter) => (
    chapter.name.toLowerCase() === row.chapter.trim().toLowerCase()
    || `${chapter.name}: ${chapter.title}`.toLowerCase() === row.chapter.trim().toLowerCase()
  ));
  if (!matchingChapter) {
    return {
      question: null,
      errors: [`Row ${rowNumber}: “${row.chapter}” chapter list-এ নেই।`],
    };
  }

  const difficultyValue = row.difficulty?.trim();
  const difficulty: QuestionDifficulty = ['Easy', 'Medium', 'Hard'].includes(difficultyValue)
    ? difficultyValue as QuestionDifficulty
    : 'Medium';
  const status: ContentStatus = row.status?.trim().toLowerCase() === 'inactive' ? 'inactive' : 'active';

  return {
    question: {
      level: resolvedLevel,
      subject,
      testType: 'chapter_wise' as const,
      chapterName: matchingChapter.name,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption,
      explanation: row.explanation?.trim() || '',
      difficulty,
      status,
      questionImageUrl: null,
      explanationImageUrl: null,
    } satisfies McqQuestionInput,
    errors,
  };
}

export default function AdminMcq() {
  const location = useLocation();
  const { questions, loading, addQuestion, updateQuestion, removeQuestion } = useMcqQuestions();
  const [activeView, setActiveView] = useState<AdminMcqView>('create');
  const [formState, setFormState] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const saveDestinationRef = useRef<SaveDestination>('another');
  const [lastSavedQuestion, setLastSavedQuestion] = useState('');
  const [uploadingImage, setUploadingImage] = useState<'questionImageUrl' | 'explanationImageUrl' | null>(null);
  const [bulkPreview, setBulkPreview] = useState<BulkPreview | null>(null);
  const [bulkSuccess, setBulkSuccess] = useState('');
  const [importing, setImporting] = useState(false);
  const [managerLevel, setManagerLevel] = useState<ExamLevel>('SSC');
  const [managerSubject, setManagerSubject] = useState<ExamSubject>('Biology');
  const [managerPool, setManagerPool] = useState('Chapter 1');
  const [managerSearch, setManagerSearch] = useState('');
  const [managerStatus, setManagerStatus] = useState<ManagerStatus>('all');
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const questionImageInputRef = useRef<HTMLInputElement>(null);
  const explanationImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (location.hash === '#new') setActiveView('create');
  }, [location.hash]);

  const formChapters = getChapters(formState.level, formState.subject);
  const managerChapters = getChapters(managerLevel, managerSubject);
  const stats = {
    total: questions.length,
    active: questions.filter((question) => question.status === 'active').length,
    inactive: questions.filter((question) => question.status === 'inactive').length,
    readyPools: [
      ...sscExamChapters.map((chapter) => ({ level: 'SSC' as const, subject: 'Biology' as const, name: chapter.name })),
      ...hscBotanyExamChapters.map((chapter) => ({ level: 'HSC' as const, subject: 'Udbid Biggan' as const, name: chapter.name })),
      ...hscZoologyExamChapters.map((chapter) => ({ level: 'HSC' as const, subject: 'Prani Biggan' as const, name: chapter.name })),
    ].filter((pool) => questions.filter((question) => (
      question.level === pool.level
      && question.subject === pool.subject
      && question.chapterName === pool.name
      && question.status === 'active'
    )).length >= TOTAL_QUESTIONS).length,
  };

  const managerPoolCards = useMemo(() => {
    const chapterPools = managerChapters.map((chapter) => {
      const poolQuestions = questions.filter((question) => (
        question.level === managerLevel
        && question.subject === managerSubject
        && question.testType === 'chapter_wise'
        && question.chapterName === chapter.name
      ));
      return {
        key: chapter.name,
        title: chapter.title,
        activeCount: poolQuestions.filter((question) => question.status === 'active').length,
        totalCount: poolQuestions.length,
      };
    });
    const fullBookQuestions = questions.filter((question) => (
      question.level === managerLevel
      && question.subject === managerSubject
      && question.testType === 'full_book'
    ));

    return [
      ...chapterPools,
      {
        key: 'full_book',
        title: 'Full Book Model Test',
        activeCount: fullBookQuestions.filter((question) => question.status === 'active').length,
        totalCount: fullBookQuestions.length,
      },
    ];
  }, [managerChapters, managerLevel, managerSubject, questions]);

  const managedQuestions = useMemo(() => {
    const search = managerSearch.trim().toLowerCase();
    return questions.filter((question) => {
      const poolMatches = managerPool === 'full_book'
        ? question.testType === 'full_book'
        : question.testType === 'chapter_wise' && question.chapterName === managerPool;
      return question.level === managerLevel
        && question.subject === managerSubject
        && poolMatches
        && (managerStatus === 'all' || question.status === managerStatus)
        && (!search
          || question.questionText.toLowerCase().includes(search)
          || question.explanation.toLowerCase().includes(search));
    });
  }, [managerLevel, managerPool, managerSearch, managerStatus, managerSubject, questions]);

  const updateLevel = (level: ExamLevel) => {
    const subject = getSubjects(level)[0];
    const chapterName = getChapters(level, subject)[0]?.name ?? '';
    setFormState((current) => ({ ...current, level, subject, chapterName }));
  };

  const updateSubject = (subject: ExamSubject) => {
    const chapterName = getChapters(formState.level, subject)[0]?.name ?? '';
    setFormState((current) => ({ ...current, subject, chapterName }));
  };

  const updateManagerLevel = (level: ExamLevel) => {
    const subject = getSubjects(level)[0];
    const chapterName = getChapters(level, subject)[0]?.name ?? 'full_book';
    setManagerLevel(level);
    setManagerSubject(subject);
    setManagerPool(chapterName);
  };

  const updateManagerSubject = (subject: ExamSubject) => {
    setManagerSubject(subject);
    setManagerPool(getChapters(managerLevel, subject)[0]?.name ?? 'full_book');
  };

  const resetQuestionFields = (current: QuestionFormState): QuestionFormState => ({
    ...current,
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    explanation: '',
    questionImageUrl: '',
    explanationImageUrl: '',
  });

  const uploadMcqImage = async (file: File, field: 'questionImageUrl' | 'explanationImageUrl') => {
    setUploadingImage(field);
    try {
      const result = await uploadAdminFile(file, {
        folder: 'mcq-images',
        allowedTypes: ['image/'],
        maxSizeMb: 10,
      });
      setFormState((current) => ({ ...current, [field]: result.downloadUrl }));
    } catch (error) {
      console.error('MCQ image upload failed:', error);
      window.alert(error instanceof Error ? error.message : 'ছবি upload করা যায়নি।');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !formState.questionText.trim()
      || !formState.optionA.trim()
      || !formState.optionB.trim()
      || !formState.optionC.trim()
      || !formState.optionD.trim()
      || (formState.testType === 'chapter_wise' && !formState.chapterName)
    ) {
      window.alert('প্রশ্ন এবং চারটি উত্তর পূরণ করুন।');
      return;
    }

    setSaving(true);
    try {
      const input = toQuestionInput(formState);
      if (editingId) await updateQuestion(editingId, input);
      else await addQuestion(input);

      setLastSavedQuestion(formState.questionText.trim());
      setEditingId(null);
      setFormState((current) => resetQuestionFields(current));
      if (saveDestinationRef.current === 'manage') {
        setManagerLevel(formState.level);
        setManagerSubject(formState.subject);
        setManagerPool(formState.testType === 'full_book' ? 'full_book' : formState.chapterName);
        setActiveView('manage');
      }
    } catch (error) {
      console.error('Failed to save MCQ question:', error);
      window.alert('Question save করা যায়নি। Admin permission পরীক্ষা করুন।');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (question: McqQuestion) => {
    setEditingId(question.id);
    setFormState(toFormState(question));
    setLastSavedQuestion('');
    setActiveView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (question: McqQuestion) => {
    if (!window.confirm('এই প্রশ্নটি remove করবেন? ব্যবহৃত প্রশ্ন হলে delete না হয়ে inactive হবে।')) return;
    try {
      const result = await removeQuestion(question.id);
      if (result === 'deactivated') {
        window.alert('প্রশ্নটি আগের exam-এ ব্যবহৃত হয়েছে, তাই delete না করে inactive করা হয়েছে।');
      }
    } catch (error) {
      console.error('Failed to remove MCQ question:', error);
      window.alert('Question remove করা যায়নি। Admin permission পরীক্ষা করুন।');
    }
  };

  const downloadCsvTemplate = () => {
    const headers = ['level', 'subject', 'chapter', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct', 'explanation', 'difficulty', 'status'];
    const example = ['SSC', 'Biology', 'Chapter 1', 'জীববিজ্ঞানের জনক কে?', 'অ্যারিস্টটল', 'ডারউইন', 'মেন্ডেল', 'ল্যামার্ক', 'A', 'অ্যারিস্টটলকে জীববিজ্ঞানের জনক বলা হয়।', 'Medium', 'active'];
    const csv = `\uFEFF${headers.map(csvCell).join(',')}\r\n${example.map(csvCell).join(',')}\r\n`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'biolab_mcq_template.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkFile = async (file: File) => {
    setBulkSuccess('');
    const rows = parseCsv(await file.text());
    if (rows.length < 2) {
      setBulkPreview({ fileName: file.name, validQuestions: [], errors: ['CSV file-এ header এবং অন্তত একটি question row থাকতে হবে।'] });
      return;
    }

    const headers = rows[0].map((header) => header.replace(/^\uFEFF/, '').trim().toLowerCase());
    const required = ['level', 'subject', 'chapter', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct'];
    const missing = required.filter((header) => !headers.includes(header));
    if (missing.length > 0) {
      setBulkPreview({
        fileName: file.name,
        validQuestions: [],
        errors: [`এই columnগুলো পাওয়া যায়নি: ${missing.join(', ')}`],
      });
      return;
    }

    const validQuestions: McqQuestionInput[] = [];
    const errors: string[] = [];
    rows.slice(1).forEach((values, index) => {
      const record = Object.fromEntries(headers.map((header, columnIndex) => [header, values[columnIndex] ?? '']));
      const result = toBulkQuestion(record, index + 2);
      if (result.question) validQuestions.push(result.question);
      errors.push(...result.errors);
    });
    setBulkPreview({ fileName: file.name, validQuestions, errors });
  };

  const publishBulkQuestions = async () => {
    if (!bulkPreview || bulkPreview.validQuestions.length === 0) return;
    setImporting(true);
    try {
      const chunkSize = 400;
      for (let index = 0; index < bulkPreview.validQuestions.length; index += chunkSize) {
        const batch = writeBatch(db);
        bulkPreview.validQuestions.slice(index, index + chunkSize).forEach((question, itemIndex) => {
          const id = crypto.randomUUID();
          const timestamp = Date.now() + index + itemIndex;
          batch.set(doc(db, 'mcqQuestions', id), {
            ...question,
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        });
        await batch.commit();
      }
      setBulkSuccess(`${bulkPreview.validQuestions.length}টি প্রশ্ন প্রকাশ হয়েছে।`);
      setBulkPreview(null);
    } catch (error) {
      console.error('Bulk upload failed:', error);
      window.alert('Bulk question publish করা যায়নি। Admin permission পরীক্ষা করুন।');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Seo title="MCQ Question Bank | Admin" description="Create and manage BIO LAB SSC and HSC MCQ questions." />

      <header className="bio-grid rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-500">MCQ Question Bank</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">সহজে MCQ প্রশ্ন যোগ করুন</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-slate-500">
              Active প্রশ্ন থেকে student exam automatic তৈরি হয়। একটি প্রশ্ন দিন অথবা Excel-compatible CSV দিয়ে অনেক প্রশ্ন যোগ করুন।
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              ['মোট', stats.total],
              ['Active', stats.active],
              ['Draft', stats.inactive],
              ['Ready', stats.readyPools],
            ].map(([label, value]) => (
              <div key={label} className="min-w-16 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center shadow-sm dark:border-slate-700 dark:bg-slate-950">
                <p className="text-lg font-extrabold text-slate-950 dark:text-white">{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <nav className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
        {([
          { key: 'create' as const, label: 'নতুন প্রশ্ন', detail: 'একটি MCQ যোগ করুন', icon: Plus },
          { key: 'bulk' as const, label: 'অনেক প্রশ্ন', detail: 'CSV দিয়ে একসাথে', icon: FileSpreadsheet },
          { key: 'manage' as const, label: 'সব প্রশ্ন', detail: 'Edit ও manage করুন', icon: Layers3 },
        ]).map((item) => {
          const Icon = item.icon;
          const active = activeView === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveView(item.key)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                active
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>
                <span className="block text-sm font-extrabold">{item.label}</span>
                <span className={`block text-[11px] font-medium ${active ? 'text-white/75' : 'text-slate-400'}`}>{item.detail}</span>
              </span>
            </button>
          );
        })}
      </nav>

      {activeView === 'create' && (
        <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-500">
                {editingId ? 'প্রশ্ন পরিবর্তন' : 'নতুন প্রশ্ন'}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">
                {editingId ? 'MCQ update করুন' : 'প্রশ্ন ও উত্তর লিখুন'}
              </h2>
            </div>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setFormState(initialFormState);
                }}
                className="rounded-xl font-bold"
              >
                Cancel edit
              </Button>
            )}
          </div>

          {lastSavedQuestion && !editingId && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm font-bold text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              প্রশ্ন প্রকাশ হয়েছে। একই chapter-এ আরেকটি প্রশ্ন লিখতে পারেন।
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-500">Step 1</p>
                <h3 className="mt-1 font-extrabold text-slate-950 dark:text-white">প্রশ্নটি কোথায় যাবে?</h3>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {(['SSC', 'HSC'] as ExamLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateLevel(level)}
                    className={`rounded-xl border p-3 text-left transition ${
                      formState.level === level
                        ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-100 dark:bg-orange-950/30 dark:ring-orange-950'
                        : 'border-slate-200 bg-white hover:border-orange-200 dark:border-slate-700 dark:bg-slate-900'
                    }`}
                  >
                    <span className="block font-extrabold text-slate-950 dark:text-white">{level} Biology</span>
                    <span className="text-xs font-medium text-slate-500">{level === 'SSC' ? 'SSC syllabus' : 'Botany ও Zoology'}</span>
                  </button>
                ))}
              </div>
              {formState.level === 'HSC' && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {getSubjects('HSC').map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => updateSubject(subject)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-extrabold transition ${
                        formState.subject === subject
                          ? 'border-teal-400 bg-teal-50 text-teal-800 dark:bg-teal-950/30 dark:text-teal-200'
                          : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      {subjectDisplayName(subject)}
                    </button>
                  ))}
                </div>
              )}
              {formState.testType === 'chapter_wise' && (
                <select
                  value={formState.chapterName}
                  onChange={(event) => setFormState((current) => ({ ...current, chapterName: event.target.value }))}
                  aria-label="Chapter"
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"
                >
                  {formChapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.name}>{chapter.name} — {chapter.title}</option>
                  ))}
                </select>
              )}
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-500">Step 2</p>
                <h3 className="mt-1 font-extrabold text-slate-950 dark:text-white">প্রশ্ন ও চারটি উত্তর</h3>
              </div>
              <label className="block space-y-1.5 text-sm font-bold">
                <span>প্রশ্ন লিখুন</span>
                <textarea
                  required
                  value={formState.questionText}
                  onChange={(event) => setFormState((current) => ({ ...current, questionText: event.target.value }))}
                  placeholder="এখানে MCQ প্রশ্নটি লিখুন"
                  className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                {answerOptions.map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                      formState.correctOption === option
                        ? 'border-teal-400 bg-teal-50 dark:bg-teal-950/30'
                        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950'
                    }`}
                  >
                    <input
                      type="radio"
                      name="correct-option"
                      checked={formState.correctOption === option}
                      onChange={() => setFormState((current) => ({ ...current, correctOption: option }))}
                      className="h-4 w-4 accent-teal-600"
                    />
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{option}</span>
                    <input
                      required
                      aria-label={`Option ${option}`}
                      value={formState[`option${option}`]}
                      onChange={(event) => setFormState((current) => ({ ...current, [`option${option}`]: event.target.value }))}
                      placeholder={`উত্তর ${option}`}
                      className="h-10 min-w-0 flex-1 border-0 bg-transparent px-1 text-sm font-semibold outline-none"
                    />
                    {formState.correctOption === option && (
                      <span className="hidden text-[10px] font-extrabold uppercase text-teal-700 sm:block dark:text-teal-300">সঠিক</span>
                    )}
                  </label>
                ))}
              </div>
              <p className="text-xs font-medium text-slate-500">সঠিক উত্তরের পাশে গোল button চাপুন।</p>
            </section>

            <details className="group overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900">
                <Settings2 className="h-4 w-4" />
                Advanced options
                <span className="ml-auto text-xs font-medium text-slate-400">Explanation, ছবি, difficulty</span>
              </summary>
              <div className="space-y-4 border-t border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <label className="block space-y-1.5 text-sm font-semibold">
                  <span>Explanation <span className="font-medium text-slate-400">(Optional)</span></span>
                  <textarea
                    value={formState.explanation}
                    onChange={(event) => setFormState((current) => ({ ...current, explanation: event.target.value }))}
                    className="min-h-20 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900"
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  {([
                    { field: 'questionImageUrl' as const, label: 'Question image' },
                    { field: 'explanationImageUrl' as const, label: 'Explanation image' },
                  ]).map((imageField) => {
                    const inputRef = imageField.field === 'questionImageUrl' ? questionImageInputRef : explanationImageInputRef;
                    return (
                      <div key={imageField.field} className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">{imageField.label}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={Boolean(uploadingImage)}
                            onClick={() => inputRef.current?.click()}
                            className="h-8 rounded-lg text-xs"
                          >
                            {uploadingImage === imageField.field
                              ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              : <ImageIcon className="mr-1.5 h-3.5 w-3.5" />}
                            ছবি দিন
                          </Button>
                        </div>
                        <input
                          ref={inputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void uploadMcqImage(file, imageField.field);
                            event.target.value = '';
                          }}
                        />
                        {formState[imageField.field] && (
                          <div className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 dark:bg-teal-950/30 dark:text-teal-300">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Image ready
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1.5 text-sm font-semibold">
                    <span>Difficulty</span>
                    <select
                      value={formState.difficulty}
                      onChange={(event) => setFormState((current) => ({ ...current, difficulty: event.target.value as QuestionDifficulty }))}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold">
                    <span>Status</span>
                    <select
                      value={formState.status}
                      onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value as ContentStatus }))}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Draft</option>
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold">
                    <span>Question pool</span>
                    <select
                      value={formState.testType}
                      onChange={(event) => setFormState((current) => ({ ...current, testType: event.target.value as ExamTestType }))}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="chapter_wise">Chapter Wise</option>
                      <option value="full_book">Full Book</option>
                    </select>
                  </label>
                </div>
              </div>
            </details>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="submit"
                disabled={saving}
                onClick={() => { saveDestinationRef.current = 'another'; }}
                className="h-12 rounded-xl bg-orange-600 font-extrabold text-white hover:bg-orange-700"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="mr-2 h-4 w-4" /> প্রকাশ ও আরেকটি যোগ</>}
              </Button>
              <Button
                type="submit"
                variant="outline"
                disabled={saving}
                onClick={() => { saveDestinationRef.current = 'manage'; }}
                className="h-12 rounded-xl font-extrabold"
              >
                প্রকাশ করে list দেখুন
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeView === 'bulk' && (
        <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal-600">Bulk Question Upload</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">Excel দিয়ে অনেক প্রশ্ন দিন</h2>
          <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
            নমুনা CSV file Excel-এ খুলে তথ্য বসান। Upload করার পরে ভুলগুলো দেখে তারপর Publish করুন।
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ['১', 'নমুনা file নিন', 'Excel-এ খুলুন'],
              ['২', 'প্রশ্ন বসান', 'প্রতি row-তে একটি MCQ'],
              ['৩', 'Upload ও Publish', 'আগে preview দেখুন'],
            ].map(([number, title, detail]) => (
              <div key={number} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-sm font-extrabold text-white">{number}</span>
                <p className="mt-3 font-extrabold text-slate-950 dark:text-white">{title}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{detail}</p>
              </div>
            ))}
          </div>

          <input
            ref={bulkInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleBulkFile(file);
              event.target.value = '';
            }}
          />
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button type="button" variant="outline" onClick={downloadCsvTemplate} className="h-12 rounded-xl font-extrabold">
              <Download className="mr-2 h-4 w-4" /> Excel নমুনা file
            </Button>
            <Button type="button" onClick={() => bulkInputRef.current?.click()} className="h-12 rounded-xl bg-teal-600 font-extrabold text-white hover:bg-teal-700">
              <UploadCloud className="mr-2 h-4 w-4" /> তৈরি করা CSV upload
            </Button>
          </div>

          {bulkSuccess && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4 font-bold text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
              <CheckCircle2 className="h-5 w-5" /> {bulkSuccess}
            </div>
          )}

          {bulkPreview && (
            <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-extrabold text-slate-950 dark:text-white">{bulkPreview.fileName}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {bulkPreview.validQuestions.length}টি ঠিক · {bulkPreview.errors.length}টি সমস্যা
                  </p>
                </div>
                <Button
                  type="button"
                  disabled={importing || bulkPreview.validQuestions.length === 0}
                  onClick={() => void publishBulkQuestions()}
                  className="rounded-xl bg-orange-600 font-extrabold text-white hover:bg-orange-700"
                >
                  {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {bulkPreview.validQuestions.length}টি প্রশ্ন Publish
                </Button>
              </div>

              {bulkPreview.validQuestions.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950">
                      <tr><th className="p-3">Level</th><th className="p-3">Chapter</th><th className="p-3">Question preview</th><th className="p-3">Correct</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {bulkPreview.validQuestions.slice(0, 5).map((question, index) => (
                        <tr key={`${question.questionText}-${index}`}>
                          <td className="p-3 font-bold">{question.level}</td>
                          <td className="p-3">{question.chapterName}</td>
                          <td className="max-w-sm truncate p-3">{question.questionText}</td>
                          <td className="p-3 font-extrabold text-teal-600">{question.correctOption}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {bulkPreview.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                  {bulkPreview.errors.slice(0, 20).map((error) => <p key={error}>• {error}</p>)}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {activeView === 'manage' && (
        <div className="space-y-5">
          <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">Question Manager</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">Level ও chapter বেছে নিন</h2>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {(['SSC', 'HSC'] as ExamLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => updateManagerLevel(level)}
                  className={`rounded-xl border p-3 text-left transition ${
                    managerLevel === level
                      ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100 dark:bg-indigo-950/30 dark:ring-indigo-950'
                      : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950'
                  }`}
                >
                  <span className="font-extrabold text-slate-950 dark:text-white">{level} Biology</span>
                </button>
              ))}
            </div>
            {managerLevel === 'HSC' && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {getSubjects('HSC').map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => updateManagerSubject(subject)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-extrabold ${
                      managerSubject === subject
                        ? 'border-teal-400 bg-teal-50 text-teal-800 dark:bg-teal-950/30 dark:text-teal-200'
                        : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {subjectDisplayName(subject)}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {managerPoolCards.map((pool) => {
                const selected = managerPool === pool.key;
                const examReady = pool.activeCount >= TOTAL_QUESTIONS;
                const targetProgress = Math.min(100, Math.round((pool.activeCount / QUESTION_POOL_TARGET) * 100));
                return (
                  <button
                    key={pool.key}
                    type="button"
                    onClick={() => setManagerPool(pool.key)}
                    className={`rounded-xl border p-3 text-left transition ${
                      selected
                        ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/30'
                        : 'border-slate-200 bg-white hover:border-orange-200 dark:border-slate-700 dark:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">
                          {pool.key === 'full_book' ? 'Full Book' : pool.key}
                        </p>
                        <p className="mt-1 line-clamp-1 font-extrabold text-slate-950 dark:text-white">{pool.title}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${examReady ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                        {pool.activeCount}/{TOTAL_QUESTIONS}
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-indigo-500" style={{ width: `${targetProgress}%` }} />
                    </div>
                    <p className="mt-2 text-[11px] font-bold text-slate-500">
                      {examReady ? '25-question exam ready' : `${TOTAL_QUESTIONS - pool.activeCount}টি প্রশ্ন আরও দরকার`} · Target {QUESTION_POOL_TARGET}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  value={managerSearch}
                  onChange={(event) => setManagerSearch(event.target.value)}
                  placeholder="প্রশ্ন বা explanation খুঁজুন"
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <select
                value={managerStatus}
                onChange={(event) => setManagerStatus(event.target.value as ManagerStatus)}
                aria-label="Question status"
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 font-bold dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="all">সব Status</option>
                <option value="active">Active</option>
                <option value="inactive">Draft</option>
              </select>
            </div>
          </Card>

          <section className="grid gap-3 lg:grid-cols-2">
            {loading ? (
              <Card className="rounded-2xl p-6 text-sm font-semibold text-slate-500">Questions load হচ্ছে…</Card>
            ) : managedQuestions.length === 0 ? (
              <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900 lg:col-span-2">
                <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 font-bold text-slate-600 dark:text-slate-300">এই pool-এ কোনো প্রশ্ন পাওয়া যায়নি।</p>
              </Card>
            ) : managedQuestions.map((question, index) => (
              <Card key={question.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-extrabold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                        question.status === 'active'
                          ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}>{question.status === 'active' ? 'Active' : 'Draft'}</span>
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">{question.difficulty}</span>
                    </div>
                    <h3 className="mt-2 font-extrabold leading-6 text-slate-950 dark:text-white">{question.questionText}</h3>
                    <div className="mt-3 grid gap-1.5 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                      {answerOptions.map((option) => (
                        <p key={option} className={question.correctOption === option ? 'font-extrabold text-teal-700 dark:text-teal-300' : ''}>
                          {option}. {question[`option${option}`]}
                        </p>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(question)} className="rounded-xl font-bold">
                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void updateQuestion(question.id, { status: question.status === 'active' ? 'inactive' : 'active' })}
                        className="rounded-xl font-bold"
                      >
                        {question.status === 'active'
                          ? <XCircle className="mr-1.5 h-3.5 w-3.5" />
                          : <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
                        {question.status === 'active' ? 'Draft করুন' : 'Active করুন'}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => void handleDelete(question)} className="rounded-xl font-bold text-red-600 hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}
