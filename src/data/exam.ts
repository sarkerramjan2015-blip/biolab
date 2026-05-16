import {
  botanyChapters,
  sscBiologyChapters,
  zoologyChapters,
} from './resources';

export const TOTAL_QUESTIONS = 25;
export const EXAM_DURATION_SECONDS = 15 * 60;
export const QUESTION_POOL_TARGET = 100;

export type ExamLevel = 'SSC' | 'HSC';
export type ExamSubject = 'Biology' | 'Udbid Biggan' | 'Prani Biggan';
export type ExamTestType = 'chapter_wise' | 'full_book';
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';
export type ContentStatus = 'active' | 'inactive';
export type AnswerOption = 'A' | 'B' | 'C' | 'D';

export type ExamConfig = {
  level: ExamLevel;
  subject: ExamSubject;
  testType: ExamTestType;
  chapterName?: string;
};

export const subjectLabels: Record<ExamSubject, string> = {
  Biology: 'Biology',
  'Udbid Biggan': 'উদ্ভিদ বিজ্ঞান',
  'Prani Biggan': 'প্রাণী বিজ্ঞান',
};

export const testTypeLabels: Record<ExamTestType, string> = {
  chapter_wise: 'Chapter Wise MCQ Test',
  full_book: 'Full Book Model Test',
};

export const questionDifficultyLabels: QuestionDifficulty[] = ['Easy', 'Medium', 'Hard'];

export const sscExamChapters = sscBiologyChapters.map((chapter) => ({
  id: chapter.id,
  name: `Chapter ${chapter.id}`,
  title: chapter.title,
}));

export const hscBotanyExamChapters = botanyChapters.map((chapter) => ({
  id: chapter.id,
  name: `Chapter ${chapter.id}`,
  title: chapter.title,
}));

export const hscZoologyExamChapters = zoologyChapters.map((chapter) => ({
  id: chapter.id,
  name: `Chapter ${chapter.id}`,
  title: chapter.title,
}));

export function getExamName(config: ExamConfig) {
  const subject = config.level === 'SSC'
    ? 'SSC Biology'
    : `HSC ${subjectLabels[config.subject]}`;

  if (config.testType === 'full_book') {
    return `${subject} - Full Book Model Test`;
  }

  return `${subject} - ${config.chapterName ?? 'Chapter Wise MCQ Test'}`;
}

export function examConfigToSearchParams(config: ExamConfig) {
  const params = new URLSearchParams({
    level: config.level,
    subject: config.subject,
    testType: config.testType,
  });

  if (config.chapterName) {
    params.set('chapterName', config.chapterName);
  }

  return params;
}

export function parseExamConfig(searchParams: URLSearchParams): ExamConfig | null {
  const level = searchParams.get('level');
  const subject = searchParams.get('subject');
  const testType = searchParams.get('testType');
  const chapterName = searchParams.get('chapterName') ?? undefined;

  if (
    (level !== 'SSC' && level !== 'HSC') ||
    (subject !== 'Biology' && subject !== 'Udbid Biggan' && subject !== 'Prani Biggan') ||
    (testType !== 'chapter_wise' && testType !== 'full_book')
  ) {
    return null;
  }

  if (testType === 'chapter_wise' && !chapterName) {
    return null;
  }

  if (
    (level === 'SSC' && subject !== 'Biology') ||
    (level === 'HSC' && subject === 'Biology')
  ) {
    return null;
  }

  return {
    level,
    subject,
    testType,
    chapterName,
  };
}

export function formatExamTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
