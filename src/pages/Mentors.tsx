import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, PlayCircle, Star, Award, Briefcase, GraduationCap, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import Seo from '@/src/components/Seo';
import mentorPhoto from '../img/pic.jpeg';

export default function Mentors() {
  const mentor = {
    name: 'জাহিদুল হাসান',
    role: 'Bsc, Msc in Botany',
    experience: 'Biology Instructor',
    workplace: 'Online Biology Platform',
    subject: 'Biology (উদ্ভিদবিজ্ঞান ও প্রাণীবিজ্ঞান)',
    image: mentorPhoto,
    students: '10k+',
    rating: '4.9',
    bio: 'জাহিদুল হাসান (Bsc, Msc in Botany) একজন অভিজ্ঞ জীববিজ্ঞান শিক্ষক। তাঁর সাবলীল ও গুছানো পাঠদান পদ্ধতির মাধ্যমে শিক্ষার্থীরা খুব সহজেই জীববিজ্ঞানের জটিল বিষয়গুলো আত্মস্থ করতে পারে। দীর্ঘ পড়াশোনা এবং শিক্ষকতার অভিজ্ঞতা কাজে লাগিয়ে তিনি শিক্ষার্থীদের একাডেমিক ও এডমিশন প্রস্তুতির জন্য একজন নির্ভরযোগ্য মেন্টর হিসেবে কাজ করছেন।',
    features: ['বোর্ড বই দাগানো', 'অধ্যায়ভিত্তিক প্রশ্ন সমাধান', 'লাইভ ইন্টারেক্টিভ ক্লাস', 'টেস্ট পেপার সলভ']
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <Seo
        title="Our Mentor"
        description="Meet the BIO LAB biology mentor and learn about expert guidance for SSC, HSC, and admission biology preparation."
      />
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">আমাদের <span className="text-teal-600">মেন্টর</span></h1>
        <p className="text-slate-500 text-lg">দেশসেরা অভিজ্ঞ মেন্টরের গাইডলাইনে তোমার প্রস্তুতি হোক আরও সুদৃঢ়।</p>
      </header>

      <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="h-48 bg-gradient-to-r from-teal-500/20 via-teal-600/20 to-indigo-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(79,70,229,0.18),transparent_32%)]" />
          <div className="absolute -bottom-16 left-8 md:left-12 h-32 w-32 overflow-hidden rounded-2xl bg-white shadow-xl ring-4 ring-white transition-transform duration-300 hover:rotate-0 md:rotate-[-4deg] dark:bg-slate-800 dark:ring-slate-900">
            <img
              src={mentor.image}
              alt={`${mentor.name} - BIO LAB Biology Mentor`}
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>
        <CardContent className="pt-20 pb-8 px-8 md:px-12">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{mentor.name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-teal-600" /> {mentor.role}</span>
                <span className="hidden md:inline text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-orange-500" /> {mentor.experience}</span>
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                <MapPin className="w-4 h-4" /> {mentor.workplace}
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800 min-w-24">
                <div className="flex items-center justify-center text-orange-500 mb-1">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <p className="font-bold text-lg text-slate-900 dark:text-white">{mentor.rating}</p>
                <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Rating</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800 min-w-24">
                <div className="flex items-center justify-center text-indigo-500 mb-1">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <p className="font-bold text-lg text-slate-900 dark:text-white">{mentor.students}</p>
                <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Students</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About Mentor</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {mentor.bio}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Highlights</h3>
            <div className="flex flex-wrap gap-3">
              {mentor.features.map((feature, idx) => (
                <span key={idx} className="bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-900 text-teal-700 dark:text-teal-400 text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
