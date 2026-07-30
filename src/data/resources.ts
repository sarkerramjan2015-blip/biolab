export type WriterContent = {
  name: string;
  book: boolean;
  solve: boolean;
  video: boolean;
  pdfUrl?: string;
  storagePath?: string;
  cloudinaryPublicId?: string;
  cloudinaryResourceType?: string;
  resourceTitle?: string;
  resourceKind?: 'pdf' | 'book' | 'note' | 'solve' | 'exam' | 'suggestion' | 'lecture' | 'other';
  sourcePath?: string;
  sizeLabel?: string;
  fileType?: 'pdf' | 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  mimeType?: string;
  originalFileName?: string;
};

export type Chapter = {
  id: number;
  title: string;
  writers: WriterContent[];
};

export const botanyChapters: Chapter[] = [
  {
    id: 1,
    title: 'কোষ ও এর গঠন',
    writers: [
      { name: 'আজিবুর স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
      { name: 'হাসান স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 2,
    title: 'কোষ বিভাজন',
    writers: [
      { name: 'হাসান স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'আজিবুর স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 3,
    title: 'কোষ রসায়ন',
    writers: [
      { name: 'আজিবুর স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'হাসান স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 4,
    title: 'অণুজীব',
    writers: [
      { name: 'হাসান স্যার', book: true, solve: false, video: false },
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
      { name: 'আজিবুর স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 5,
    title: 'শৈবাল ও ছত্রাক',
    writers: [
      { name: 'হাসান স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'আজিবুর স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 6,
    title: 'ব্রায়োফাইটা ও টেরিডোফাইটা',
    writers: [
      { name: 'হাসান স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'আজিবুর স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 7,
    title: 'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ',
    writers: [
      { name: 'হাসান স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'আজিবুর স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 8,
    title: 'টিসু ও টিস্যুতন্ত্র',
    writers: [
      { name: 'আজিবুর স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'হাসান স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 9,
    title: 'উদ্ভিদ শারীরতত্ত্ব',
    writers: [
      { name: 'হাসান স্যার', book: true, solve: false, video: false },
      { name: 'আজিবুর স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 10,
    title: 'উদ্ভিদ প্রজনন',
    writers: [
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'আজিবুর স্যার', book: true, solve: false, video: false },
      { name: 'হাসান স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 11,
    title: 'জীবপ্রযুক্তি',
    writers: [
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
      { name: 'আজিবুর স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'হাসান স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 12,
    title: 'জীবের পরিবেশ',
    writers: [
      { name: 'আজিবুর স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'হাসান স্যার', book: true, solve: false, video: false },
    ],
  },
];

export const zoologyChapters: Chapter[] = [
  {
    id: 1,
    title: 'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস',
    writers: [
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'মাজেদা ম্যাম', book: true, solve: false, video: false },
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 2,
    title: 'প্রাণীর পরিচিতি',
    writers: [
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
      { name: 'মাজেদা ম্যাম', book: true, solve: false, video: false },
    ],
  },
  {
    id: 3,
    title: 'পরিপাক ও শোষণ',
    writers: [
      { name: 'মাজেদা ম্যাম', book: true, solve: false, video: false },
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 4,
    title: 'রক্ত ও সংবহন',
    writers: [
      { name: 'মাজেদা ম্যাম', book: true, solve: false, video: false },
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 5,
    title: 'শ্বসন ও শ্বাসক্রিয়া',
    writers: [
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
      { name: 'মাজেদা ম্যাম', book: true, solve: false, video: false },
    ],
  },
  {
    id: 6,
    title: 'বর্জ্য ও নিষ্কাশন',
    writers: [
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'মাজেদা ম্যাম', book: true, solve: false, video: false },
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 7,
    title: 'চলন ও অঙ্গচালনা',
    writers: [
      { name: 'মাজেদা ম্যাম', book: true, solve: false, video: false },
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 8,
    title: 'সমন্বয় ও নিয়ন্ত্রণ',
    writers: [
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
      { name: 'মাজেদা ম্যাম', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 9,
    title: 'মানব জীবনের ধারাবাহিকতা',
    writers: [
      { name: 'মাজেদা ম্যাম', book: true, solve: false, video: false },
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
    ],
  },
  {
    id: 10,
    title: 'মানবদেহের প্রতিরক্ষা',
    writers: [
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'মাজেদা ম্যাম', book: true, solve: false, video: false },
    ],
  },
  {
    id: 11,
    title: 'জিনতত্ত্ব ও বিবর্তন',
    writers: [
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
      { name: 'মাজেদা ম্যাম', book: true, solve: false, video: false },
    ],
  },
  {
    id: 12,
    title: 'প্রাণীর আচরণ',
    writers: [
      { name: 'আলীম স্যার', book: true, solve: false, video: false },
      { name: 'মাজেদা ম্যাম', book: true, solve: false, video: false },
      { name: 'আজমল স্যার', book: true, solve: false, video: false },
    ],
  },
];

export const sscBiologyChapters: Chapter[] = [
  {
    id: 1,
    title: 'জীবন পাঠ',
    writers: [
      { name: 'বোর্ড বই', book: true, solve: true, video: true },
    ],
  },
  {
    id: 2,
    title: 'জীবকোষ ও টিস্যু',
    writers: [
      { name: 'বোর্ড বই', book: true, solve: true, video: true },
    ],
  },
  {
    id: 3,
    title: 'কোষ বিভাজন',
    writers: [
      { name: 'বোর্ড বই', book: true, solve: true, video: true },
    ],
  },
  {
    id: 4,
    title: 'জীবনীশক্তি',
    writers: [
      { name: 'বোর্ড বই', book: true, solve: true, video: true },
    ],
  },
  {
    id: 5,
    title: 'খাদ্য, পুষ্টি এবং পরিপাক',
    writers: [
      { name: 'বোর্ড বই', book: true, solve: false, video: true },
    ],
  },
];
