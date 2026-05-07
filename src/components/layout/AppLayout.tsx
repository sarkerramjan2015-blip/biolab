import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Library, PlaySquare, FileText, Menu, Microscope, LogOut, Users, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user, login, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { name: 'Resource Hub', path: '/resources', icon: <Library className="w-5 h-5" /> },
    { name: 'Solve Classes', path: '/video', icon: <PlaySquare className="w-5 h-5" /> },
    { name: 'PDF Reader', path: '/reader', icon: <FileText className="w-5 h-5" /> },
    { name: 'Mentor', path: '/mentors', icon: <Users className="w-5 h-5" /> },
  ];

  const NavLinks = () => (
    <div className="flex flex-col gap-2">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            location.pathname === item.path
              ? 'bg-teal-500/10 text-teal-500 font-bold'
              : 'text-slate-400 hover:text-teal-500 hover:bg-slate-800/50'
          }`}
          onClick={() => setIsOpen(false)}
        >
          {item.icon}
          {item.name}
        </Link>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 font-sans pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0f172a] border-r border-[#0f172a] fixed h-full z-20">
        <div className="p-6 flex flex-col gap-2 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-teal-500 p-2 rounded-xl text-white shadow-lg shadow-teal-500/20">
              <Microscope className="w-6 h-6" />
            </div>
            <span className="font-bold text-3xl tracking-tight text-white uppercase">BIO LAB</span>
          </Link>
          <span className="text-xs font-medium text-teal-400 pl-14 mt-[-6px]">জীববিজ্ঞান এ বিশুদ্ধ জ্ঞান</span>
        </div>
        <div className="p-4 flex-1">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-slate-800">
          {user ? (
            <div className="flex justify-between items-center px-4 py-3 bg-slate-800/50 rounded-xl mb-2">
               <div className="flex items-center gap-3">
                 {user.photoURL ? (
                   <img src={user.photoURL} alt="Profile" className="rounded-full w-8 h-8 border border-teal-500" />
                 ) : (
                   <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                     {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                   </div>
                 )}
                 <div className="flex flex-col">
                   <span className="text-sm font-semibold text-white max-w-[120px] truncate">{user.displayName || user.email}</span>
                   <span className="text-xs text-slate-400">Student</span>
                 </div>
               </div>
            </div>
          ) : (
            <div className="flex justify-between items-center px-4 py-3 bg-slate-800/50 rounded-xl mb-2">
               <div className="flex items-center gap-3">
                 <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                   G
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-semibold text-white">Guest</span>
                   <span className="text-xs text-slate-400">Not logged in</span>
                 </div>
               </div>
            </div>
          )}
          {user ? (
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          ) : (
            <Button onClick={async () => { await login(); navigate('/dashboard'); }} variant="ghost" className="w-full justify-start text-teal-400 hover:bg-teal-500/10 hover:text-teal-300">
              <LogOut className="w-4 h-4 mr-2 rotate-180" /> Login
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-white/80 backdrop-blur-md dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sticky top-0 z-30">
          <Link to="/" className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="bg-teal-500 p-1 rounded-lg text-white shadow-sm">
                <Microscope className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white uppercase leading-none mt-1">BIO LAB</span>
            </div>
            <span className="text-[9px] font-medium text-teal-600 pl-7 mt-[-2px]">জীববিজ্ঞান এ বিশুদ্ধ জ্ঞান</span>
          </Link>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="-mr-2 text-slate-600 dark:text-slate-400" />}>
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col bg-[#0f172a] text-white border-r-[#0f172a]">
              <div className="p-6 flex flex-col gap-2 border-b border-slate-800">
                <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                  <div className="bg-teal-500 p-2 rounded-xl text-white shadow-lg shadow-teal-500/20">
                    <Microscope className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-3xl tracking-tight text-white uppercase">BIO LAB</span>
                </Link>
                <span className="text-xs font-medium text-teal-400 pl-14 mt-[-6px]">জীববিজ্ঞান এ বিশুদ্ধ জ্ঞান</span>
              </div>
              <div className="p-4 flex-1">
                <NavLinks />
              </div>
              <div className="p-4 border-t border-slate-800">
                {user ? (
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-800/50 rounded-xl mb-2">
                     <div className="flex items-center gap-3">
                       {user.photoURL ? (
                         <img src={user.photoURL} alt="Profile" className="rounded-full w-8 h-8 border border-teal-500" />
                       ) : (
                         <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                           {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                         </div>
                       )}
                       <div className="flex flex-col">
                         <span className="text-sm font-semibold text-white max-w-[120px] truncate">{user.displayName || user.email}</span>
                         <span className="text-xs text-slate-400">Student</span>
                       </div>
                     </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-800/50 rounded-xl mb-2">
                     <div className="flex items-center gap-3">
                       <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                         G
                       </div>
                       <div className="flex flex-col">
                         <span className="text-sm font-semibold text-white">Guest</span>
                         <span className="text-xs text-slate-400">Not logged in</span>
                       </div>
                     </div>
                  </div>
                )}
                {user ? (
                  <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                ) : (
                  <Button onClick={async () => { await login(); navigate('/dashboard'); setIsOpen(false); }} variant="ghost" className="w-full justify-start text-teal-400 hover:bg-teal-500/10 hover:text-teal-300">
                    <LogOut className="w-4 h-4 mr-2 rotate-180" /> Login
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                  isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <div className={`p-1 rounded-full ${isActive ? 'bg-teal-50 dark:bg-teal-900/30' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[9px] font-bold tracking-tight text-center truncate w-full px-1">{item.name.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  );
}
