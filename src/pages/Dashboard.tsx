import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Activity,
  Award,
  FileText,
  Download,
  Share2,
  Search,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
  Copy,
  Facebook,
  ExternalLink,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Seo from '@/src/components/Seo';
import { useStudentExamAttempts } from '@/lib/exams';
import { useStudentPdfDownloads } from '@/lib/content';
import { formatExamTime } from '@/src/data/exam';

// Subject labels translation helper
const subjectNames: Record<string, string> = {
  botany: 'উদ্ভিদবিজ্ঞান',
  zoology: 'প্রাণিবিজ্ঞান',
  ssc: 'SSC Biology',
  'unknown': 'অন্যান্য',
  'Reader View': 'রিডার ভিউ',
  'Reader Download': 'রিডার ডাউনলোড',
};

export default function Dashboard() {
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Fetch attempts and downloads
  const { attempts, loading: attemptsLoading } = useStudentExamAttempts(user?.uid);
  const { downloads, loading: downloadsLoading } = useStudentPdfDownloads(user?.uid);

  // States for filters & search
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sharing states
  const [sharingAttempt, setSharingAttempt] = useState<any | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Stats Calculations
  const stats = useMemo(() => {
    if (!attempts || attempts.length === 0) {
      return {
        totalExams: 0,
        averagePercentage: 0,
        highestScore: 0,
        highestScorePercentage: 0,
        totalMcqs: 0,
        totalCorrect: 0,
        totalWrong: 0,
        accuracy: 0,
        lastExamDate: 'নেই',
      };
    }

    const totalExams = attempts.length;
    
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalMcqs = 0;
    let sumPercentage = 0;
    let highestScore = 0;
    let highestScorePercentage = 0;

    attempts.forEach((attempt) => {
      totalCorrect += attempt.correctCount ?? 0;
      totalWrong += attempt.wrongCount ?? 0;
      totalMcqs += attempt.totalQuestions ?? 0;
      sumPercentage += attempt.percentage ?? 0;

      const scoreVal = attempt.score ?? 0;
      if (scoreVal > highestScore) {
        highestScore = scoreVal;
      }
      const pctVal = attempt.percentage ?? 0;
      if (pctVal > highestScorePercentage) {
        highestScorePercentage = pctVal;
      }
    });

    const averagePercentage = Number((sumPercentage / totalExams).toFixed(1));
    const accuracy = totalMcqs > 0 ? Number(((totalCorrect / totalMcqs) * 100).toFixed(1)) : 0;
    
    // Sort logic places latest first, so attempts[0] is the last exam taken
    const lastExamTimestamp = attempts[0]?.submittedAt;
    const lastExamDate = lastExamTimestamp
      ? new Date(lastExamTimestamp).toLocaleDateString('bn-BD', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'নেই';

    return {
      totalExams,
      averagePercentage,
      highestScore,
      highestScorePercentage,
      totalMcqs,
      totalCorrect,
      totalWrong,
      accuracy,
      lastExamDate,
    };
  }, [attempts]);

  // Filtering attempts
  const filteredAttempts = useMemo(() => {
    if (!attempts) return [];
    return attempts.filter((attempt) => {
      const matchesSearch = attempt.examName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = subjectFilter === 'all' || attempt.subject === subjectFilter;
      return matchesSearch && matchesSubject;
    });
  }, [attempts, searchTerm, subjectFilter]);

  // Paginated attempts
  const paginatedAttempts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAttempts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAttempts, currentPage]);

  const totalPages = Math.ceil(filteredAttempts.length / itemsPerPage);

  // Unified activity timeline (Merged attempts and downloads)
  const timelineActivities = useMemo(() => {
    const list: any[] = [];

    if (attempts) {
      attempts.forEach((a) => {
        list.push({
          id: a.id,
          type: 'exam',
          title: a.examName,
          desc: `স্কোর: ${a.score}/${a.totalQuestions} (${a.percentage}%)`,
          timestamp: a.submittedAt ?? a.startedAt,
          subject: a.subject,
          chapter: a.chapterName || '',
        });
      });
    }

    if (downloads) {
      downloads.forEach((d) => {
        // Avoid adding system internal view events to user activity unless they are actual reads/downloads
        const isDownload = d.subject === 'Reader Download' || d.chapter === 'Reader Download' || d.pdfTitle.includes('Download') || true;
        list.push({
          id: d.id,
          type: 'pdf',
          title: d.pdfTitle,
          desc: d.subject.includes('Download') ? 'ডাউনলোড করা হয়েছে' : 'পড়া হয়েছে',
          timestamp: d.downloadedAt,
          subject: d.subject,
          chapter: d.chapter,
          fileUrl: d.fileUrl,
        });
      });
    }

    // Sort newest first
    return list.sort((a, b) => b.timestamp - a.timestamp).slice(0, 7);
  }, [attempts, downloads]);

  // Subject Performance Insights
  const performanceInsights = useMemo(() => {
    if (!attempts || attempts.length < 2) {
      return null;
    }

    const subjectsMap: Record<string, { totalPct: number; count: number }> = {};
    attempts.forEach((attempt) => {
      const sub = attempt.subject;
      if (!subjectsMap[sub]) {
        subjectsMap[sub] = { totalPct: 0, count: 0 };
      }
      subjectsMap[sub].totalPct += attempt.percentage ?? 0;
      subjectsMap[sub].count += 1;
    });

    let bestSub = '';
    let bestAvg = -1;
    let worstSub = '';
    let worstAvg = 999;

    Object.entries(subjectsMap).forEach(([sub, data]) => {
      const avg = data.totalPct / data.count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestSub = sub;
      }
      if (avg < worstAvg) {
        worstAvg = avg;
        worstSub = sub;
      }
    });

    return {
      bestSubject: bestSub,
      bestAvg: Number(bestAvg.toFixed(1)),
      worstSubject: worstSub,
      worstAvg: Number(worstAvg.toFixed(1)),
    };
  }, [attempts]);

  // Share text generation
  const handleShareClick = (attempt: any) => {
    setSharingAttempt(attempt);
    setCopySuccess(false);
  };

  const getShareText = (attempt: any) => {
    if (!attempt) return '';
    return `আমি BIO LAB-এ "${attempt.examName}" পরীক্ষায় ${attempt.score}/${attempt.totalQuestions} পেয়েছি (${attempt.percentage}%)। তুমিও চাইলে BIO LAB-এ প্র্যাকটিস করতে পারো: https://biolabedu.com`;
  };

  const copyShareTextToClipboard = async (attempt: any) => {
    const text = getShareText(attempt);
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const shareViaWebAPI = async (attempt: any) => {
    const text = getShareText(attempt);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BIO LAB Exam Result',
          text: text,
          url: 'https://biolabedu.com',
        });
      } catch (err) {
        console.log('User cancelled share or API error', err);
      }
    } else {
      copyShareTextToClipboard(attempt);
    }
  };

  // Auth Guest View
  if (!authLoading && !user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Seo
          title="ড্যাশবোর্ড - BIO LAB"
          description="BIO LAB student dashboard for biology progress tracking and exam results."
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-8 md:p-16 shadow-2xl relative overflow-hidden border border-slate-800"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="w-96 h-96 bg-teal-500/15 rounded-full absolute -right-20 -top-20 blur-3xl"></div>
          <div className="w-80 h-80 bg-indigo-500/15 rounded-full absolute -left-20 -bottom-20 blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="w-20 h-20 bg-teal-500/10 border border-teal-500/30 rounded-2xl mx-auto flex items-center justify-center text-teal-400">
              <Award className="w-10 h-10" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              আপনার অর্জিত স্কোর ও অগ্রগতি ট্র্যাক করুন!
            </h1>
            <p className="text-slate-300 font-medium text-base md:text-lg leading-relaxed">
              ড্যাশবোর্ড ব্যবহারের জন্য আপনাকে লগইন করতে হবে। লগইন করে আপনি আপনার দেওয়া পরীক্ষা, অর্জিত স্কোর, ডাউনলোডকৃত PDF ফাইল ও পারফরম্যান্স এনালাইসিস খুব সহজেই দেখতে পাবেন।
            </p>
            <div className="pt-4">
              <Button
                onClick={async () => {
                  const success = await login();
                  if (success) navigate('/dashboard');
                }}
                className="bg-teal-500 text-white hover:bg-teal-600 shadow-xl shadow-teal-900/30 rounded-xl px-10 h-14 text-base font-bold transition-all duration-300 hover:-translate-y-1"
              >
                Google দিয়ে লগইন করুন <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading View
  if (authLoading || attemptsLoading || downloadsLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2"></div>
        
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800"></div>
          ))}
        </div>

        {/* Contents Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Seo
        title="ড্যাশবোর্ড - BIO LAB"
        description="BIO LAB real-data student dashboard. Solve MCQs, track exams, download biology resources and track analytics."
      />

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-800 text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-teal-100 text-xs font-bold rounded-full uppercase tracking-wider backdrop-blur-md border border-white/5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> স্টুডেন্ট প্রোফাইল
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">ড্যাশবোর্ড</h1>
            <p className="text-teal-100 font-medium">
              স্বাগতম, <span className="font-extrabold text-white">{user?.displayName || 'শিক্ষার্থী'}</span>! আপনার শেখার সামগ্রিক অগ্রগতি ও পারফরম্যান্সের বিবরণ নিচে দেখুন।
            </p>
          </div>
          {attempts && attempts.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-4 shrink-0">
              <div className="p-3 bg-teal-500 rounded-xl text-white shadow-inner">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-teal-100 font-bold uppercase tracking-wider">সর্বশেষ পরীক্ষা</p>
                <p className="text-lg font-black text-white leading-tight">{stats.lastExamDate}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <Award className="w-6 h-6" />,
            iconClass: 'bg-teal-500/10 text-teal-600 border-teal-100 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900',
            label: 'মোট পরীক্ষা দেওয়া হয়েছে',
            value: stats.totalExams,
            sub: 'পরীক্ষা',
          },
          {
            icon: <TrendingUp className="w-6 h-6" />,
            iconClass: 'bg-indigo-500/10 text-indigo-600 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900',
            label: 'গড় পারফরম্যান্স',
            value: `${stats.averagePercentage}%`,
            sub: 'গড় স্কোর',
          },
          {
            icon: <Activity className="w-6 h-6" />,
            iconClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
            label: 'সঠিক উত্তর দেওয়ার হার (Accuracy)',
            value: `${stats.accuracy}%`,
            sub: `${stats.totalCorrect}/${stats.totalMcqs} MCQ`,
          },
          {
            icon: <FileText className="w-6 h-6" />,
            iconClass: 'bg-amber-500/10 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
            label: 'মোট PDF ডাউনলোড',
            value: stats.totalExams === 0 && downloads.length === 0 ? 0 : downloads.length,
            sub: 'টি ফাইল',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
          >
            <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-4 rounded-xl border ${stat.iconClass} shrink-0`}>
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</span>
                    <span className="text-xs text-slate-400 font-bold">{stat.sub}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Left column (Exams & PDFs), Right column (Activity & Insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* My Exams Table */}
          <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-teal-500" /> আমার পরীক্ষাগুলো
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">আপনার দেওয়া সকল মক টেস্টের ফলাফল এবং বিস্তারিত বিবরণ</p>
              </div>
              
              {/* Search & Subject Filter controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    placeholder="পরীক্ষার নাম খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 h-10 w-full sm:w-48 bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-sm"
                  />
                </div>
                <select
                  value={subjectFilter}
                  onChange={(e) => {
                    setSubjectFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 px-3 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="all">সব বিষয়</option>
                  <option value="botany">উদ্ভিদবিজ্ঞান</option>
                  <option value="zoology">প্রাণিবিজ্ঞান</option>
                  <option value="ssc">SSC Biology</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredAttempts.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">কোনো ফলাফল পাওয়া যায়নি</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                      {attempts && attempts.length > 0 
                        ? 'অনুগ্রহ করে অন্য কোনো পরীক্ষার নাম সার্চ করুন বা ফিল্টার পরিবর্তন করুন।'
                        : 'আপনি এখনো কোনো পরীক্ষা দেননি। এখনই একটি পরীক্ষা শুরু করুন।'}
                    </p>
                  </div>
                  {attempts && attempts.length === 0 && (
                    <Link to="/exam" className="inline-block pt-2">
                      <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl px-6">
                        পরীক্ষা শুরু করুন <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 text-xs font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <th className="py-4 px-6">পরীক্ষা ও বিষয়</th>
                        <th className="py-4 px-6 text-center">তারিখ</th>
                        <th className="py-4 px-6 text-center">স্কোর</th>
                        <th className="py-4 px-6 text-center">পারফরম্যান্স</th>
                        <th className="py-4 px-6 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {paginatedAttempts.map((attempt) => {
                        const score = attempt.score ?? 0;
                        const total = attempt.totalQuestions ?? 0;
                        const percentage = attempt.percentage ?? 0;
                        
                        // Performance level translation
                        let perfLabel = 'Needs Practice';
                        let perfClass = 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900';
                        
                        if (percentage >= 80) {
                          perfLabel = 'Excellent';
                          perfClass = 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-900';
                        } else if (percentage >= 60) {
                          perfLabel = 'Good';
                          perfClass = 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900';
                        }
                        
                        const bnPerfLabel = {
                          'Excellent': 'চমৎকার',
                          'Good': 'ভালো',
                          'Needs Practice': 'অনুশীলন প্রয়োজন',
                        }[perfLabel];

                        return (
                          <tr key={attempt.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/30 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{attempt.examName}</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                  {subjectNames[attempt.subject] || attempt.subject}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {new Date(attempt.submittedAt ?? attempt.startedAt).toLocaleDateString('bn-BD', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="font-black text-slate-900 dark:text-white text-sm leading-none">{score}/{total}</div>
                              <div className="text-[10px] font-bold text-slate-400 mt-1">({percentage}%)</div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-block px-2.5 py-1 text-[11px] font-extrabold rounded-full border ${perfClass}`}>
                                {bnPerfLabel}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex justify-end gap-2">
                                <Link to={`/exam/result?attempt=${attempt.id}`}>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-8 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border-none"
                                  >
                                    রেজাল্ট
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleShareClick(attempt)}
                                  className="h-8 rounded-lg text-xs font-bold text-teal-600 border-teal-200 hover:bg-teal-50/50 dark:text-teal-400 dark:border-teal-900/60 dark:hover:bg-teal-950/20"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pagination footer */}
                  {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((c) => c - 1)}
                        className="h-8 rounded-lg font-bold text-xs"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" /> পূর্ববর্তী
                      </Button>
                      <span className="text-xs font-extrabold text-slate-500">
                        পৃষ্ঠা {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((c) => c + 1)}
                        className="h-8 rounded-lg font-bold text-xs"
                      >
                        পরবর্তী <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* PDF Download history */}
          <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" /> আমার PDF ডাউনলোড কালেকশন
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">আপনার পড়া বা ডাউনলোড করা জীববিজ্ঞান রিভিশন শিট ও লেকচার নোটস</p>
            </CardHeader>
            <CardContent className="p-6">
              {downloads.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">কোনো PDF ডাউনলোড করা হয়নি</h3>
                    <p className="text-xs text-slate-500 mt-1">আপনি স্পেশাল PDF কালেকশন থেকে কোনো ফাইল ভিউ বা ডাউনলোড করলে তা এখানে তালিকাভুক্ত হবে।</p>
                  </div>
                  <Link to="/resources" className="inline-block pt-1">
                    <Button variant="outline" size="sm" className="rounded-lg text-xs font-bold border-slate-200">
                      PDF কালেকশন দেখুন
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {downloads.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 hover:border-amber-300 transition-all group"
                    >
                      <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate group-hover:text-amber-600 transition-colors" title={item.pdfTitle}>
                          {item.pdfTitle}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-semibold">
                          <span className="bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {subjectNames[item.subject] || item.subject}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(item.downloadedAt).toLocaleDateString('bn-BD', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        {item.fileUrl && (
                          <Link
                            to={{
                              pathname: '/reader',
                              search: `?pdf=${encodeURIComponent(item.fileUrl)}&title=${encodeURIComponent(item.pdfTitle)}`,
                            }}
                            state={{ pdfUrl: item.fileUrl, title: item.pdfTitle }}
                          >
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-500 hover:text-amber-500">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                  {downloads.length > 6 && (
                    <div className="md:col-span-2 text-right pt-2">
                      <Link to="/resources">
                        <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white">
                          সব PDF ফাইল দেখুন <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-8">
          
          {/* Performance Insights */}
          <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-slate-800 dark:text-white pointer-events-none">
              <Sparkles className="w-24 h-24" />
            </div>
            <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" /> পারফরম্যান্স ইনসাইট
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {!performanceInsights ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/40 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    ন্যূনতম ২ বা ততোধিক ভিন্ন পরীক্ষা দেওয়ার পর আপনার পারফরম্যান্সের ওপর ভিত্তি করে সেরা ও দুর্বলতম বিষয়গুলোর ইনসাইট এখানে জেনারেট হবে।
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Correct vs Wrong count bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                      <span className="text-teal-600 dark:text-teal-400">সঠিক: {stats.totalCorrect}</span>
                      <span className="text-slate-400">টোটাল MCQ: {stats.totalMcqs}</span>
                      <span className="text-red-500">ভুল: {stats.totalWrong}</span>
                    </div>
                    
                    {/* Visual bar */}
                    <div className="h-3 bg-red-100 dark:bg-red-950/20 rounded-full overflow-hidden flex">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-l-full shadow-inner"
                        style={{ width: `${stats.accuracy}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="p-4 bg-teal-500/5 rounded-2xl border border-teal-500/10">
                      <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-teal-600 dark:text-teal-400 mb-1">সেরা বিষয়</h4>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {subjectNames[performanceInsights.bestSubject] || performanceInsights.bestSubject}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">গড় স্কোর: {performanceInsights.bestAvg}%</p>
                    </div>

                    <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                      <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-red-500 dark:text-red-400 mb-1">দুর্বল বিষয়</h4>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {subjectNames[performanceInsights.worstSubject] || performanceInsights.worstSubject}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">গড় স্কোর: {performanceInsights.worstAvg}%</p>
                    </div>
                  </div>

                  {/* Smart Advice */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-teal-500" /> পরামর্শ ও দিকনির্দেশনা
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-2">
                      {performanceInsights.worstSubject === 'botany' && (
                        'উদ্ভিদবিজ্ঞান বিষয়ের অধ্যায়গুলো আরও ভালোভাবে পড়া প্রয়োজন। স্পেশাল PDF কালেকশন থেকে উদ্ভিদবিজ্ঞান নোটগুলো পড়ুন এবং বেশি বেশি পরীক্ষা দিন।'
                      )}
                      {performanceInsights.worstSubject === 'zoology' && (
                        'প্রাণিবিজ্ঞান বিষয়ের অধ্যায়গুলো আরও ভালোভাবে পড়া প্রয়োজন। প্রাণিবিজ্ঞান বিষয়ের অধ্যায়গুলোর পরীক্ষা দিয়ে নিজেকে ঝালিয়ে নিন।'
                      )}
                      {performanceInsights.worstSubject === 'ssc' && (
                        'SSC Biology বিষয়ের অধ্যায়গুলোর বোর্ড বই ও রিভিশন শিট রিভিশন দিন এবং বেশি বেশি মক টেস্ট দিন।'
                      )}
                      {!['botany', 'zoology', 'ssc'].includes(performanceInsights.worstSubject) && (
                        'আপনার দুর্বল বিষয়গুলোর নোটস রিভিশন দিন এবং ভুল উত্তর বিশ্লেষণ করতে "কোথায় ভুল হয়েছে" সেকশনটি ভালো করে পর্যালোচনা করুন।'
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" /> সাম্প্রতিক কার্যক্রম
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {timelineActivities.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                  সাম্প্রতিক কোনো কার্যক্রম পাওয়া যায়নি।
                </div>
              ) : (
                <div className="relative pl-4 space-y-6 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                  {timelineActivities.map((act, i) => (
                    <div key={i} className="relative flex gap-3.5 group">
                      {/* Left Dot */}
                      <span className={`absolute -left-[18.5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white dark:bg-slate-900 transition-colors ${
                        act.type === 'exam' 
                          ? 'border-teal-500 group-hover:bg-teal-500' 
                          : 'border-amber-500 group-hover:bg-amber-500'
                      }`}></span>
                      
                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-850 dark:text-slate-200 text-xs truncate leading-snug">
                            {act.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap pt-0.5 font-bold">
                            {new Date(act.timestamp).toLocaleDateString('bn-BD', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                          {act.type === 'exam' ? 'পরীক্ষা দেওয়া হয়েছে' : 'PDF ' + act.desc} • {subjectNames[act.subject] || act.subject}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Share Dialog/Modal */}
      <AnimatePresence>
        {sharingAttempt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">বন্ধুদের সাথে ফলাফল শেয়ার করুন</h3>
                <button
                  onClick={() => setSharingAttempt(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                
                {/* Result Card Preview */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-500/10 to-indigo-500/10 border border-teal-500/20 text-center space-y-2">
                  <p className="text-[10px] uppercase font-black tracking-widest text-teal-600 dark:text-teal-400">পরীক্ষার ফলাফল</p>
                  <h4 className="font-black text-slate-900 dark:text-white text-base leading-snug">{sharingAttempt.examName}</h4>
                  <div className="text-3xl font-black text-slate-900 dark:text-white pt-2 leading-none">
                    {sharingAttempt.score} / {sharingAttempt.totalQuestions}
                  </div>
                  <p className="text-xs text-slate-500 font-semibold pt-1">
                    শতকরা হার: <span className="font-bold text-slate-800 dark:text-slate-200">{sharingAttempt.percentage}%</span>
                  </p>
                </div>

                {/* Shared text preview */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">শেয়ারের বার্তাটি:</label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-650 dark:text-slate-300 border border-slate-100 dark:border-slate-850 leading-relaxed font-medium">
                    {getShareText(sharingAttempt)}
                  </div>
                </div>

                {/* Share CTAs */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    onClick={() => copyShareTextToClipboard(sharingAttempt)}
                    variant="outline"
                    className="h-11 rounded-xl font-bold text-xs border-slate-200 flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copySuccess ? 'কপি হয়েছে!' : 'মেসেজ কপি করুন'}
                  </Button>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://biolabedu.com')}&quote=${encodeURIComponent(getShareText(sharingAttempt))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full"
                  >
                    <Button
                      className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 border-none"
                    >
                      <Facebook className="w-4 h-4 fill-white" />
                      Facebook
                    </Button>
                  </a>
                </div>

                {typeof navigator.share === 'function' && (
                  <Button
                    onClick={() => shareViaWebAPI(sharingAttempt)}
                    className="w-full h-11 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 border-none mt-2"
                  >
                    <Share2 className="w-4 h-4" />
                    অন্যান্য অ্যাপে শেয়ার করুন
                  </Button>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
