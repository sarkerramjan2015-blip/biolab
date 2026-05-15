import { Link } from 'react-router-dom';
import { BookOpen, FileText, GraduationCap, Layers, Library, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Seo from '@/src/components/Seo';
import mentorPhoto from '../img/pic.jpeg';

const highlights = [
  { icon: <FileText className="h-5 w-5" />, label: 'Chapter-wise PDF resources' },
  { icon: <BookOpen className="h-5 w-5" />, label: 'SSC ও HSC Biology support' },
  { icon: <Layers className="h-5 w-5" />, label: 'Organized study archive' },
  { icon: <GraduationCap className="h-5 w-5" />, label: 'Exam-focused guidance' },
];

export default function Mentors() {
  const mentor = {
    name: 'জাহিদ স্যার',
    role: 'BIO LAB Biology Mentor',
    subject: 'SSC ও HSC Biology',
    workplace: 'BIO LAB Resource Archive',
    bio: 'BIO LAB-এ জাহিদ স্যারের biology resources chapter অনুযায়ী সাজানো হয়েছে। Students যেন mobile বা desktop থেকে সহজে PDF পড়তে, download করতে এবং পরীক্ষার প্রস্তুতিতে ব্যবহার করতে পারে, সেটাই এই mentor page ও resource archive-এর মূল লক্ষ্য।',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-6xl space-y-8"
    >
      <Seo
        title="Our Mentor"
        description="Meet the BIO LAB biology mentor and browse SSC and HSC biology PDF resources."
      />

      <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-stretch">
        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <img
            src={mentorPhoto}
            alt={`${mentor.name} - BIO LAB Biology Mentor`}
            className="h-80 w-full object-cover object-top sm:h-[460px] lg:h-full"
          />
        </Card>

        <Card className="bio-grid overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">
              Mentor Profile
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-6xl">
              {mentor.name}
            </h1>
            <p className="mt-3 text-xl font-bold text-slate-700 dark:text-slate-200">{mentor.role}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                <BookOpen className="h-4 w-4" /> {mentor.subject}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                <MapPin className="h-4 w-4" /> {mentor.workplace}
              </span>
            </div>
            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-600 dark:text-slate-300">
              {mentor.bio}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/resources" className="w-full sm:w-auto">
                <Button className="h-11 w-full rounded-xl bg-teal-600 px-6 font-bold text-white hover:bg-teal-700">
                  PDF Archive দেখো
                </Button>
              </Link>
              <Link to="/reader" className="w-full sm:w-auto">
                <Button variant="outline" className="h-11 w-full rounded-xl border-slate-300 px-6 font-bold dark:border-slate-700">
                  PDF Reader
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item) => (
          <Card key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
              {item.icon}
            </div>
            <p className="text-sm font-extrabold leading-6 text-slate-800 dark:text-slate-100">{item.label}</p>
          </Card>
        ))}
      </section>

      <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">Resource-first preparation</h2>
            <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
              এই platform-এর main focus PDF: পড়া, download করা, এবং chapter অনুযায়ী resource খুঁজে পাওয়া।
            </p>
          </div>
          <Library className="h-10 w-10 text-teal-600" />
        </div>
      </Card>
    </motion.div>
  );
}
