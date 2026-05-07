import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, BookOpen, Clock, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '@/lib/auth';
import Seo from '@/src/components/Seo';

export default function Dashboard() {
  const { user } = useAuth();
  const stats = [
    {
      icon: <Activity className="w-6 h-6" />,
      iconClass: 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800',
      label: 'মোট পড়া সম্পন্ন',
      value: '৩২%',
      subval: '+২%',
      subvalClass: 'text-teal-600 dark:text-teal-400',
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      iconClass: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
      label: 'অধ্যায় শেষ হয়েছে',
      value: '৪',
      subval: '/ ২৪',
      subvalClass: 'text-slate-500',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      iconClass: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
      label: 'পড়ার সময়',
      value: '১২',
      subval: 'ঘণ্টা',
      subvalClass: 'text-slate-500',
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <Seo
        title="Student Dashboard"
        description="BIO LAB student dashboard for biology progress tracking, saved lessons, and recommended chapters."
      />
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">ড্যাশবোর্ড</h1>
        <p className="text-slate-500 font-medium">স্বাগতম{user?.displayName ? ` ${user.displayName}` : ''}, তোমার আজকের পড়ার অগ্রগতি নিচে দেওয়া হলো।</p>
      </header>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-5">
                 <div className={`p-4 rounded-2xl border ${stat.iconClass}`}>
                   {stat.icon}
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                   <div className="flex items-baseline gap-2">
                     <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</span>
                     <span className={`text-xs ${stat.subvalClass} font-bold`}>{stat.subval}</span>
                   </div>
                 </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Continue Learning */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              আবার শুরু করো
            </h2>
          </div>
          
          <Card className="rounded-3xl border-none shadow-xl bg-gradient-to-br from-teal-600 via-teal-700 to-indigo-800 overflow-hidden relative group cursor-pointer hover:shadow-teal-900/20 hover:scale-[1.01] transition-all duration-300">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="w-64 h-64 bg-white/5 rounded-full absolute -right-20 -top-20 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="w-48 h-48 bg-indigo-500/20 rounded-full absolute right-10 -bottom-10 blur-2xl group-hover:scale-110 transition-transform duration-700 delay-100"></div>
            
            <CardContent className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center relative z-10">
              <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-3xl flex-shrink-0 flex items-center justify-center border border-white/20 shadow-inner group-hover:bg-white/20 transition-colors duration-300">
                <PlayCircle className="w-12 h-12 text-white/90 drop-shadow-md" />
              </div>
              <div className="flex-1 text-center md:text-left text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-teal-50 text-xs font-bold rounded-full uppercase tracking-widest mb-4 backdrop-blur-md border border-white/10">
                  প্রাণীবিজ্ঞান • অধ্যায় ২
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight leading-tight">হাইড্রা (Hydra) - গঠন ও বৈশিষ্ট্য</h3>
                <p className="text-teal-100/80 mb-6 font-medium max-w-lg leading-relaxed">গতদিন তুমি এই টপিকের ভিডিওটি দেখছিলে। এখান থেকে আবার পড়া শুরু করতে পারো।</p>
                
                {/* Progress bar */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1 h-2.5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '45%' }}
                      transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-teal-400 to-emerald-300 h-full rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]" 
                    />
                  </div>
                  <span className="text-sm font-bold text-white w-10">45%</span>
                </div>
                
                <Link to="/video" className="inline-block w-full md:w-auto">
                  <Button className="w-full bg-white text-teal-800 hover:bg-slate-50 shadow-xl rounded-xl px-8 h-12 text-base font-bold transition-transform hover:-translate-y-1">
                    চালিয়ে যাও <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Up Next / Recommended */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">পরবর্তী টপিক</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { title: 'কোষ বিভাজন মাইটোসিস', subject: 'উদ্ভিদবিজ্ঞান' },
              { title: 'রুই মাছের রক্তসংবহন', subject: 'প্রাণীবিজ্ঞান' },
              { title: 'অণুজীব - ভাইরাস', subject: 'উদ্ভিদবিজ্ঞান' },
            ].map((item, i) => (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={i} 
                className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-500 dark:hover:border-teal-500 transition-all cursor-pointer group"
              >
                <div className="bg-slate-50 dark:bg-slate-800 w-14 h-14 flex items-center justify-center rounded-xl border border-slate-100 dark:border-slate-700/50 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 transition-colors">
                  <BookOpen className="w-6 h-6 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{item.title}</h4>
                  <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full inline-block bg-teal-500 mr-1.5"></span>
                    {item.subject}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
