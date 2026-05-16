import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  EXAM_DURATION_SECONDS,
  TOTAL_QUESTIONS,
  type AnswerOption,
  type ContentStatus,
  type ExamConfig,
  type ExamLevel,
  type ExamSubject,
  type ExamTestType,
  type QuestionDifficulty,
  getExamName,
} from '@/src/data/exam';
import {
  getStarterQuestionsByIds,
  getStarterQuestionsForExam,
} from '@/src/data/starter-mcq';

export type McqQuestion = {
  id: string;
  level: ExamLevel;
  subject: ExamSubject;
  testType: ExamTestType;
  chapterName?: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: AnswerOption;
  explanation: string;
  difficulty: QuestionDifficulty;
  status: ContentStatus;
  createdAt: number;
  updatedAt: number;
};

export type McqQuestionInput = Omit<McqQuestion, 'id' | 'createdAt' | 'updatedAt'>;

export type ExamAttemptStatus = 'running' | 'submitted';

export type ExamAttempt = {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string | null;
  studentPhone: string | null;
  level: ExamLevel;
  subject: ExamSubject;
  testType: ExamTestType;
  chapterName?: string;
  examName: string;
  totalQuestions: number;
  questionIds: string[];
  selectedAnswers: Record<string, AnswerOption>;
  startedAt: number;
  durationSeconds: number;
  status: ExamAttemptStatus;
  correctCount?: number;
  wrongCount?: number;
  score?: number;
  percentage?: number;
  wrongPercentage?: number;
  timeTakenSeconds?: number;
  submittedAt?: number;
  dayKey?: string;
  lockId?: string;
};

export type ExamAnswer = {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOption: AnswerOption | null;
  correctOption: AnswerOption;
  isCorrect: boolean;
  createdAt: number;
};

export class NotEnoughQuestionsError extends Error {
  availableCount: number;

  constructor(availableCount: number) {
    super(`Only ${availableCount} active questions are available for this exam.`);
    this.name = 'NotEnoughQuestionsError';
    this.availableCount = availableCount;
  }
}

export class DailyChapterAttemptLimitError extends Error {
  constructor() {
    super('Only one chapter exam is allowed per day.');
    this.name = 'DailyChapterAttemptLimitError';
  }
}

function toQuestion(snapshot: { id: string; data: () => unknown }) {
  return { id: snapshot.id, ...(snapshot.data() as Omit<McqQuestion, 'id'>) } satisfies McqQuestion;
}

function shuffle<T>(items: T[]) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
}

function getDhakaDayKey(timestamp = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(timestamp);
  const partMap = new Map(parts.map((part) => [part.type, part.value]));

  return `${partMap.get('year')}-${partMap.get('month')}-${partMap.get('day')}`;
}

function getAttemptLockId(config: ExamConfig, userId: string, dayKey: string) {
  return [userId, config.level, config.subject, config.chapterName, dayKey].join('__');
}

export function useMcqQuestions() {
  const [questions, setQuestions] = useState<McqQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const questionsQuery = query(collection(db, 'mcqQuestions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      questionsQuery,
      (snapshot) => {
        setQuestions(snapshot.docs.map(toQuestion));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching MCQ questions:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const addQuestion = async (question: McqQuestionInput) => {
    const now = Date.now();
    await addDoc(collection(db, 'mcqQuestions'), {
      ...question,
      createdAt: now,
      updatedAt: now,
    });
  };

  const updateQuestion = async (questionId: string, question: Partial<McqQuestionInput>) => {
    await updateDoc(doc(db, 'mcqQuestions', questionId), {
      ...question,
      updatedAt: Date.now(),
    });
  };

  const removeQuestion = async (questionId: string) => {
    const usedAnswers = await getDocs(
      query(collection(db, 'examAnswers'), where('questionId', '==', questionId), limit(1)),
    );

    if (!usedAnswers.empty) {
      await updateQuestion(questionId, { status: 'inactive' });
      return 'deactivated' as const;
    }

    await deleteDoc(doc(db, 'mcqQuestions', questionId));
    return 'deleted' as const;
  };

  return {
    questions,
    loading,
    addQuestion,
    updateQuestion,
    removeQuestion,
  };
}

export async function fetchQuestionsForExam(config: ExamConfig) {
  const conditions = [
    where('level', '==', config.level),
    where('subject', '==', config.subject),
    where('status', '==', 'active'),
  ];

  if (config.testType === 'chapter_wise') {
    conditions.push(where('testType', '==', config.testType));
    conditions.push(where('chapterName', '==', config.chapterName));
  }

  const snapshot = await getDocs(query(collection(db, 'mcqQuestions'), ...conditions));
  const liveQuestions = snapshot.docs.map(toQuestion);

  if (liveQuestions.length >= TOTAL_QUESTIONS) {
    return liveQuestions;
  }

  return [
    ...liveQuestions,
    ...getStarterQuestionsForExam(config),
  ];
}

export async function startExamAttempt(config: ExamConfig, user: User) {
  const availableQuestions = await fetchQuestionsForExam(config);

  if (availableQuestions.length < TOTAL_QUESTIONS) {
    throw new NotEnoughQuestionsError(availableQuestions.length);
  }

  const selectedQuestions = shuffle(availableQuestions).slice(0, TOTAL_QUESTIONS);
  const dayKey = getDhakaDayKey();
  const lockId = config.testType === 'chapter_wise'
    ? getAttemptLockId(config, user.uid, dayKey)
    : undefined;
  const attempt = {
    userId: user.uid,
    studentName: user.displayName || user.email || 'Student',
    studentEmail: user.email,
    studentPhone: user.phoneNumber,
    level: config.level,
    subject: config.subject,
    testType: config.testType,
    chapterName: config.chapterName,
    examName: getExamName(config),
    totalQuestions: TOTAL_QUESTIONS,
    questionIds: selectedQuestions.map((question) => question.id),
    selectedAnswers: {},
    startedAt: Date.now(),
    durationSeconds: EXAM_DURATION_SECONDS,
    status: 'running' as const,
    dayKey,
    lockId,
  };
  const attemptRef = doc(collection(db, 'examAttempts'));

  if (config.testType === 'chapter_wise') {
    const lockRef = doc(db, 'examAttemptLocks', lockId!);

    await runTransaction(db, async (transaction) => {
      const currentLock = await transaction.get(lockRef);

      if (currentLock.exists()) {
        throw new DailyChapterAttemptLimitError();
      }

      transaction.set(lockRef, {
        userId: user.uid,
        attemptId: attemptRef.id,
        level: config.level,
        subject: config.subject,
        chapterName: config.chapterName,
        dayKey,
        createdAt: Date.now(),
      });
      transaction.set(attemptRef, attempt);
    });
  } else {
    await setDoc(attemptRef, attempt);
  }

  return {
    attemptId: attemptRef.id,
    questions: selectedQuestions,
  };
}

export function useExamAttempt(attemptId: string | null) {
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(Boolean(attemptId));

  useEffect(() => {
    if (!attemptId) {
      setAttempt(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'examAttempts', attemptId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setAttempt(null);
        } else {
          setAttempt({ id: snapshot.id, ...(snapshot.data() as Omit<ExamAttempt, 'id'>) });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching exam attempt:', error);
        setAttempt(null);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [attemptId]);

  return { attempt, loading };
}

export async function fetchQuestionsByIds(questionIds: string[]) {
  const starterQuestions = getStarterQuestionsByIds(questionIds);
  const starterQuestionIds = new Set(starterQuestions.map((question) => question.id));
  const liveQuestionIdsToFetch = questionIds.filter((questionId) => !starterQuestionIds.has(questionId));
  const snapshots = await Promise.all(
    liveQuestionIdsToFetch.map((questionId) => getDoc(doc(db, 'mcqQuestions', questionId))),
  );
  const liveQuestions = snapshots
    .filter((snapshot) => snapshot.exists())
    .map((snapshot) => toQuestion(snapshot));

  return [
    ...liveQuestions,
    ...starterQuestions,
  ];
}

export async function saveAttemptAnswerSelection(
  attemptId: string,
  questionId: string,
  option: AnswerOption,
) {
  await updateDoc(doc(db, 'examAttempts', attemptId), {
    [`selectedAnswers.${questionId}`]: option,
  });
}

export async function submitExamAttempt(
  attempt: ExamAttempt,
  questions: McqQuestion[],
  selectedAnswers: Record<string, AnswerOption>,
) {
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const correctCount = attempt.questionIds.reduce((total, questionId) => {
    const question = questionMap.get(questionId);
    return total + (question && selectedAnswers[questionId] === question.correctOption ? 1 : 0);
  }, 0);
  const wrongCount = attempt.totalQuestions - correctCount;
  const percentage = Number(((correctCount / attempt.totalQuestions) * 100).toFixed(2));
  const wrongPercentage = Number(((wrongCount / attempt.totalQuestions) * 100).toFixed(2));
  const timeTakenSeconds = Math.min(
    attempt.durationSeconds,
    Math.max(0, Math.floor((Date.now() - attempt.startedAt) / 1000)),
  );
  const submittedAt = Date.now();
  const attemptRef = doc(db, 'examAttempts', attempt.id);

  await runTransaction(db, async (transaction) => {
    const currentAttempt = await transaction.get(attemptRef);

    if (!currentAttempt.exists()) {
      throw new Error('Attempt was not found.');
    }

    if (currentAttempt.data().status !== 'running') {
      throw new Error('This attempt has already been submitted.');
    }

    transaction.update(attemptRef, {
      selectedAnswers,
      correctCount,
      wrongCount,
      score: correctCount,
      percentage,
      wrongPercentage,
      timeTakenSeconds,
      submittedAt,
      status: 'submitted',
    });
  });

  const answerBatch = writeBatch(db);
  attempt.questionIds.forEach((questionId) => {
    const question = questionMap.get(questionId);

    if (!question) {
      return;
    }

    const answerRef = doc(db, 'examAnswers', `${attempt.id}_${questionId}`);
    const selectedOption = selectedAnswers[questionId] ?? null;

    answerBatch.set(answerRef, {
      attemptId: attempt.id,
      questionId,
      selectedOption,
      correctOption: question.correctOption,
      isCorrect: selectedOption === question.correctOption,
      createdAt: submittedAt,
    } satisfies Omit<ExamAnswer, 'id'>);
  });
  await answerBatch.commit();
}

export function useAttemptAnswers(attemptId: string | null) {
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [loading, setLoading] = useState(Boolean(attemptId));

  useEffect(() => {
    if (!attemptId) {
      setAnswers([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, 'examAnswers'), where('attemptId', '==', attemptId)),
      (snapshot) => {
        setAnswers(snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<ExamAnswer, 'id'>),
        })));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching exam answers:', error);
        setAnswers([]);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [attemptId]);

  return { answers, loading };
}

export function useExamAttempts() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'examAttempts'),
      (snapshot) => {
        setAttempts(
          snapshot.docs
            .map((item) => ({ id: item.id, ...(item.data() as Omit<ExamAttempt, 'id'>) }))
            .filter((attempt) => attempt.status === 'submitted')
            .sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0)),
        );
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching exam attempts:', error);
        setAttempts([]);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { attempts, loading };
}
