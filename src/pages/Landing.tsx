import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Microscope, ArrowRight, PlayCircle, BookOpen, Layers, Users, Library, CheckCircle2, Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth';
import Seo from '@/src/components/Seo';

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, login, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await login();
    navigate('/dashboard');
  };

  const handleStart = () => {
    navigate('/dashboard');
  };

  const navItems = [
    { name: 'Home', path: '#' },
    { name: 'Resource Hub', path: '/resources' },
    { name: 'Solve Classes', path: '/video' },
    { name: 'Our Mentors', path: '/mentors' },
    { name: 'Admin Portal', path: '/admin/dashboard' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col font-sans">
      <Seo
        title="BIO LAB - SSC ও HSC Biology Preparation"
        description="BIO LAB এ SSC ও HSC biology chapter-wise PDF, solve class, mentor guidance, and smart study dashboard একসাথে পাওয়া যায়."
      />
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-teal-500 p-2.5 rounded-xl text-white shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Microscope className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white uppercase leading-none">BIO LAB</span>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 mt-1">জীববিজ্ঞান এ বিশুদ্ধ জ্ঞান</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex gap-8 text-sm font-bold text-slate-600 dark:text-slate-300">
            {navItems.map(item => (
              <Link key={item.name} to={item.path} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-2 md:gap-4">
            {!loading && !user ? (
              <>
                <Button 
                  onClick={handleLogin}
                  variant="ghost" 
                  className="hidden sm:inline-flex font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600"
                >
                  Log in
                </Button>
                <Button 
                  onClick={handleStart}
                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 md:px-6 font-bold shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5"
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-1 md:ml-2 hidden sm:inline" />
                </Button>
              </>
            ) : user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm font-bold mr-4">
                  {user.photoURL && (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-teal-500" />
                  )}
                  <span className="text-slate-700 dark:text-slate-200">{user.displayName}</span>
                </div>
                <Button onClick={logout} variant="outline" size="icon" className="hidden sm:flex border-slate-200 dark:border-slate-800">
                  <LogOut className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </Button>
                <Link to="/dashboard">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 md:px-6 font-bold shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5">
                    Dashboard <ArrowRight className="w-4 h-4 ml-1 md:ml-2 hidden sm:inline" />
                  </Button>
                </Link>
              </>
            ) : null}
            <button 
              className="md:hidden p-2 text-slate-600 dark:text-slate-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
            >
              <div className="flex flex-col px-4 py-4 space-y-4">
                {navItems.map(item => (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className="font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="relative overflow-hidden w-full">
          {/* Background decorations */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400/10 dark:bg-teal-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-sm font-bold mb-6 border border-teal-100 dark:border-teal-800">
                <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                SSC & HSC 2025 ব্যাচের জন্য সেরা প্ল্যাটফর্ম
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white leading-[1.1] max-w-4xl">
                বায়োলজি প্রস্তুতি এখন <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-500">
                  আরও স্মার্ট, আরও সহজ।
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                BIO LAB-এ পাচ্ছ দাগানো বইয়ের স্মার্ট রিডার, সলভ শিট এবং আনলিমিটেড লাইভ এমসিকিউ এক্সাম। এক্সপার্ট মেন্টরদের সাথে তোমার প্রস্তুতি শুরু করো আজই।
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white w-full h-14 px-8 text-lg font-bold rounded-xl shadow-xl shadow-teal-600/20 transition-all hover:-translate-y-1">
                    পড়া শুরু করো
                  </Button>
                </Link>
                <Link to="/resources" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full h-14 px-8 text-lg font-bold rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                    রিসোর্সগুলো দেখো
                  </Button>
                </Link>
              </div>
              
              <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-500">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-500" /> স্মার্ট পিডিএফ রিডার</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-500" /> এক্সপার্ট লেকচার</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-500" /> সলভ শিট</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="bg-white dark:bg-slate-900 py-16 md:py-24 flex-1 border-t border-slate-100 dark:border-slate-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">যেসব ফিচারে আমরা সেরা</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">তোমার সেরা প্রস্তুতির জন্য যা যা প্রয়োজন, সবকিছুই আছে একটি প্ল্যাটফর্মে।</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<BookOpen className="w-8 h-8 text-teal-600" />}
                title="স্মার্ট আর্কাইভ"
                description="আবুল হাসান স্যার বা গাজী আজমল স্যারের বইয়ের অধ্যায়ভিত্তিক দাগানো পিডিএফ, সলভ শিট সব এক জায়গায়।"
              />
              <FeatureCard 
                icon={<Layers className="w-8 h-8 text-teal-600" />}
                title="ইন-বিল্ট পিডিএফ রিডার"
                description="কোনো অ্যাপ ছাড়া ওয়েবসাইটের ভেতরেই জুম সাপোর্টেড ফাস্ট পিডিএফ রিডার দিয়ে বই পড়ো আরাম করে।"
              />
              <FeatureCard 
                icon={<PlayCircle className="w-8 h-8 text-teal-600" />}
                title="অ্যাড-ফ্রি সলভ ভিডিও"
                description="পরীক্ষার আগের রাতে ইউটিউবে অ্যাড দেখে সময় নষ্ট না করে, আমাদের ডেডিকেটেড ভিডিও প্লেয়ারে ক্লাস করো।"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-5 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}
