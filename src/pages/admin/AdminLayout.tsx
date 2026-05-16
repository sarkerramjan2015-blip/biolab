import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, CircleHelp, ClipboardList, FileText, FlaskConical, LayoutDashboard, LogOut, Menu, ShieldCheck, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { isLocalAdminPreviewEnabled } from '@/lib/admin';
import { useAuth } from '@/lib/auth';
import PageNavActions from '@/src/components/navigation/PageNavActions';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user, login, logout } = useAuth();
  const localPreview = isLocalAdminPreviewEnabled();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'PDF List', path: '/admin/dashboard#pdf-resources', icon: <FileText className="w-5 h-5" /> },
    { name: 'Upload PDF', path: '/admin/dashboard#upload-pdf', icon: <UploadCloud className="w-5 h-5" /> },
    { name: 'MCQ Bank', path: '/admin/mcq', icon: <ClipboardList className="w-5 h-5" /> },
    { name: 'Practical', path: '/admin/practical', icon: <FlaskConical className="w-5 h-5" /> },
    { name: 'Exam Report', path: '/admin/exam-report', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Help', path: '/admin/dashboard#admin-help', icon: <CircleHelp className="w-5 h-5" /> },
  ];

  const NavLinks = () => (
    <div className="flex flex-col gap-2">
      {navItems.map((item) => {
        const currentPath = `${location.pathname}${location.hash}`;
        const isActive = item.path.includes('#')
          ? currentPath === item.path
          : location.pathname === item.path && !location.hash;

        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => {
              setIsOpen(false);
              if (item.path.endsWith('#upload-pdf')) {
                window.setTimeout(() => window.dispatchEvent(new Event('bio-admin-open-upload')), 0);
              }
            }}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
              isActive
                ? 'bg-orange-500/10 font-bold text-orange-500'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-orange-500'
            }`}
          >
            {item.icon}
            {item.name}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0f172a] border-r border-[#0f172a] fixed h-full z-20">
        <div className="p-6 flex flex-col gap-2 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">Admin Panel</span>
          </Link>
          <span className="text-xs font-medium text-orange-400 pl-14 mt-[-6px]">Control Center</span>
        </div>
        <div className="p-4 flex-1">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-slate-800">
          {user ? (
            <div className="flex justify-between items-center px-4 py-3 bg-slate-800/50 rounded-xl mb-2">
               <div className="flex items-center gap-3">
                 {user.photoURL ? (
                   <img src={user.photoURL} alt="Profile" className="rounded-full w-8 h-8 border border-orange-500" />
                 ) : (
                   <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                     {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                   </div>
                 )}
                 <div className="flex flex-col">
                   <span className="text-sm font-semibold text-white max-w-[120px] truncate">{user.displayName || user.email}</span>
                   <span className="text-xs text-slate-400">Admin</span>
                 </div>
               </div>
            </div>
          ) : (
            <div className="flex justify-between items-center px-4 py-3 bg-slate-800/50 rounded-xl mb-2">
               <div className="flex items-center gap-3">
                 <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                   A
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-semibold text-white">{localPreview ? 'Local Admin' : 'Admin'}</span>
                   <span className="text-xs text-slate-400">{localPreview ? 'Preview access' : 'Not logged in'}</span>
                 </div>
               </div>
            </div>
          )}
          <Link to="/dashboard">
            <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-800/50 hover:text-white mb-2">
              Back to Student App
            </Button>
          </Link>
          {user ? (
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          ) : (
            <Button onClick={async () => { if (await login()) navigate('/admin/dashboard'); }} variant="ghost" className="w-full justify-start text-orange-400 hover:bg-orange-500/10 hover:text-orange-300">
              <LogOut className="w-4 h-4 mr-2 rotate-180" /> Google Login
            </Button>
          )}
        </div>
      </aside>

      <div className="flex-1 md:ml-72 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-[#0f172a] border-b border-slate-800 h-16 flex items-center justify-between px-4 sticky top-0 z-30">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-white">Admin Panel</span>
          </Link>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="-mr-2 text-white hover:bg-slate-800" />}>
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col bg-[#0f172a] text-white border-r-[#0f172a]">
              <div className="p-6 flex flex-col gap-2 border-b border-slate-800">
                <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                  <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-500/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-2xl tracking-tight text-white">Admin Panel</span>
                </Link>
                <span className="text-xs font-medium text-orange-400 pl-14 mt-[-6px]">Control Center</span>
              </div>
              <div className="p-4 flex-1">
                <NavLinks />
              </div>
              <div className="p-4 border-t border-slate-800">
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="mb-2 w-full justify-start text-slate-400 hover:bg-slate-800/50 hover:text-white">
                    Back to Student App
                  </Button>
                </Link>
                {user ? (
                  <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                ) : (
                  <Button onClick={async () => { if (await login()) { navigate('/admin/dashboard'); setIsOpen(false); } }} variant="ghost" className="w-full justify-start text-orange-400 hover:bg-orange-500/10 hover:text-orange-300">
                    <LogOut className="w-4 h-4 mr-2 rotate-180" /> Google Login
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <PageNavActions className="mb-4" />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
