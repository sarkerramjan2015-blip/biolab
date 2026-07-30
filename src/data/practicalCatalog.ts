import type { ExamLevel } from './exam';

export type PracticalSubject = 'Biology' | 'Botany' | 'Zoology';

export type PracticalCatalogEntry = {
  catalogId: string;
  title: string;
  level: ExamLevel;
  subject: PracticalSubject;
  sortOrder: number;
};

const hscBotanyTitles = [
  'মাইটোসিস বিভাজনের বিভিন্ন পর্যায় পর্যবেক্ষণ',
  'টক দই থেকে ব্যাকটেরিয়া পর্যবেক্ষণ',
  'Ulothrix-এর স্থায়ী স্লাইড পর্যবেক্ষণ',
  'Agaricus-এর ফ্রুটবডির বাহ্যিক গঠন পর্যবেক্ষণ',
  'Pteris-এর স্পোরোফাইট পর্যবেক্ষণ',
  'পত্ররন্ধ্রের গঠন পর্যবেক্ষণ',
  'Malvaceae গোত্র শনাক্তকরণ',
  'একবীজপত্রী উদ্ভিদের মূল ও কাণ্ডের প্রস্থচ্ছেদ পর্যবেক্ষণ',
  'সালোকসংশ্লেষণে কার্বন ডাই-অক্সাইডের অপরিহার্যতার পরীক্ষা',
  'অবাত শ্বসনের পরীক্ষা',
];

const hscZoologyTitles = [
  'নন-কর্ডাটা ও ভার্টিব্রাটার নমুনা প্রাণী পর্যবেক্ষণ',
  'ঘাসফড়িং বা আরশোলার মুখ উপাঙ্গ পর্যবেক্ষণ',
  'ঘাসফড়িং বা আরশোলার পরিপাকতন্ত্র ও গ্রন্থি পর্যবেক্ষণ',
  'রুইজাতীয় মাছের রক্ত সংবহন তন্ত্র পর্যবেক্ষণ',
  'রুইজাতীয় মাছের শ্বসনতন্ত্র, ফুলকা ও পটকা পর্যবেক্ষণ',
  'হাইড্রার স্থায়ী স্লাইড বা মডেল পর্যবেক্ষণ',
  'পরিপাক অঙ্গসমূহের অনুচ্ছেদের স্থায়ী স্লাইড পর্যবেক্ষণ',
  'রক্ত কণিকাসমূহের স্থায়ী স্লাইড পর্যবেক্ষণ',
  'ফুসফুসের অনুচ্ছেদের স্থায়ী স্লাইড পর্যবেক্ষণ',
  'বৃক্কের অনুচ্ছেদের স্থায়ী স্লাইড পর্যবেক্ষণ',
  'মসৃণ ও হৃদপেশির কাঠামোর তুলনা',
  'মানুষের বিভিন্ন অস্থির মডেল পর্যবেক্ষণ',
];

const sscBiologyTitles = [
  'অনুবীক্ষণ যন্ত্রে উদ্ভিদ কোষ (পেঁয়াজ কোষ) পর্যবেক্ষণ',
  'অনুবীক্ষণ যন্ত্রে প্রাণিকোষ (অ্যামিবা) পর্যবেক্ষণ',
  'সালোকসংশ্লেষণে ক্লোরোফিল ও আলোর অপরিহার্যতার পরীক্ষা',
  'শ্বসনে তাপ নির্গমন পরীক্ষা',
  'উদ্ভিদের অভিস্রবণ পরীক্ষা',
  'উদ্ভিদের রস উত্তোলন পরীক্ষা',
  'উদ্ভিদের প্রস্বেদন পরীক্ষা',
  'বিশ্রাম ও শরীরচর্চার পর রক্তচাপ ও পালসরেটের তুলনা',
  'নিঃশ্বাসে নির্গত গ্যাসের প্রকৃতি নির্ণয়',
  'আলো ও অন্ধকার স্থানে উদ্ভিদের চলন পর্যবেক্ষণ',
  'অঙ্কুরিত ছোলা বীজে মূলের ভূ-অভিমুখী চলন পরীক্ষা',
  'ফুলের গর্ভাশয়ের প্রস্থচ্ছেদ পর্যবেক্ষণ',
  'সাদৃশ্য ও বৈসাদৃশ্যমূলক বৈশিষ্ট্য চিহ্নিতকরণ',
];

function createEntries(
  prefix: string,
  level: ExamLevel,
  subject: PracticalSubject,
  titles: string[],
): PracticalCatalogEntry[] {
  return titles.map((title, index) => ({
    catalogId: `${prefix}-${String(index + 1).padStart(2, '0')}`,
    title,
    level,
    subject,
    sortOrder: index + 1,
  }));
}

export const practicalCatalog: PracticalCatalogEntry[] = [
  ...createEntries('hsc-botany', 'HSC', 'Botany', hscBotanyTitles),
  ...createEntries('hsc-zoology', 'HSC', 'Zoology', hscZoologyTitles),
  ...createEntries('ssc-biology', 'SSC', 'Biology', sscBiologyTitles),
];

export function getCatalogEntries(level: ExamLevel, subject: PracticalSubject) {
  return practicalCatalog.filter((entry) => entry.level === level && entry.subject === subject);
}
