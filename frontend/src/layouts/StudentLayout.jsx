import React, { useMemo, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarDays,
  FileText,
  Gamepad2,
  Home,
  LogOut,
  Menu,
  Target,
  X,
} from 'lucide-react';
import { useTherapyStore } from '../hooks/useTherapyStore';

const PAGE_TITLES = {
  '/student/home': 'الرئيسية',
  '/student/sessions': 'الجلسات',
  '/student/plan': 'الخطة العلاجية',
  '/student/reports': 'التقارير',
  '/student/library': 'المكتبة',
  '/student/games': 'الألعاب',
  '/student/medical': 'الملف الطبي',
};

const StudentLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeMode, currentStudent, logoutStudent } = useTherapyStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!currentStudent && location.pathname !== '/student/login') {
    return <Navigate to="/student/login" replace />;
  }

  if (location.pathname === '/student/login') {
    return <Outlet />;
  }

  const isGameScreen = location.pathname.includes('/student/game/');

  const navItems = [
    { to: '/student/home', label: 'الرئيسية', icon: Home },
    { to: '/student/sessions', label: 'الجلسات', icon: CalendarDays },
    { to: '/student/plan', label: 'الخطة العلاجية', icon: Target },
    { to: '/student/reports', label: 'التقارير', icon: FileText },
    { to: '/student/library', label: 'المكتبة', icon: BookOpen },
    { to: '/student/games', label: 'الألعاب', icon: Gamepad2 },
  ];

  const currentTitle = useMemo(() => {
    const match = Object.keys(PAGE_TITLES).find((path) => location.pathname.startsWith(path));
    return match ? PAGE_TITLES[match] : 'بوابة المستفيد';
  }, [location.pathname]);

  if (isGameScreen) {
    return (
      <div dir="rtl" className="min-h-screen bg-[radial-gradient(circle_at_top,_#eaf7fb,_#f7fcfd_34%,_#ffffff_75%)] text-slate-800 font-arabic">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-5">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="relative min-h-screen  bg-[radial-gradient(circle_at_top,_#eaf7fb,_#f7fcfd_34%,_#ffffff_75%)] text-slate-800 font-arabic">
      <header className="fixed top-0 inset-x-0 z-40 border-b border-[#dbe7f3] bg-white/95 backdrop-blur-md shadow-[0_8px_20px_rgba(15,23,42,0.08)] mb-[2em]">
        <div className="w-full px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center h-12 w-12 rounded-xl border border-[#dbe7f3] bg-white hover:bg-slate-50"
              title="تبديل القائمة"
            >
              {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="flex items-center gap-2 rounded-xl border border-[#dbe7f3] bg-white px-4 py-2">
              <span className="font-black text-slate-800">{currentTitle}</span>
              {location.pathname.startsWith('/student/sessions') && <CalendarDays size={16} className="text-slate-500" />}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#dbe7f3] bg-white px-4 py-2 shadow-sm">
            <div className="text-right">
              <div className="text-xs text-slate-500 font-bold">{activeMode === 'therapist' ? 'جلسة علاجية' : 'المستفيد'}</div>
              <div className="font-black text-slate-900">{currentStudent?.name}</div>
            </div>
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-blue-100 flex items-center justify-center">
              {currentStudent?.avatarUrl ? (
                <img src={currentStudent.avatarUrl} alt="صورة المستفيد" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">👦</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          onClick={() => setMobileNavOpen(false)}
          className="lg:hidden fixed inset-0 top-[72px] bg-slate-900/20 z-30"
        />
      )}

      <aside
        className={`fixed right-0 top-[72px] z-40 border-l-2 border-b-2 border-[#c8dced] bg-white/95 backdrop-blur-md transition-all
          lg:top-[72px] lg:bottom-4 lg:w-[74px] lg:rounded-bl-[2.5rem]
          ${mobileNavOpen ? 'bottom-0 w-[78vw] max-w-[320px] opacity-100 translate-x-0' : 'bottom-0 w-[78vw] max-w-[320px] opacity-0 translate-x-full pointer-events-none'}
          lg:opacity-100 lg:translate-x-0 lg:pointer-events-auto`}
      >
        <nav className="h-full flex flex-col p-2 pt-5 gap-1 overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center justify-start lg:justify-center gap-3 px-3 lg:px-2 py-3 rounded-xl font-bold transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={18} />
                <span className="text-sm font-bold lg:hidden">{item.label}</span>
                <span className="pointer-events-none hidden lg:block absolute z-[120] right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#138fbc] px-3 py-1.5 text-xs font-bold text-white opacity-0 translate-x-2 transition-all duration-200 shadow-lg shadow-cyan-900/25 group-hover:opacity-100 group-hover:translate-x-0">
                  {item.label}
                  <span className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-0 h-0 border-y-[6px] border-y-transparent border-l-[6px] border-l-[#138fbc]" />
                </span>
              </NavLink>
            );
          })}

          <button
            onClick={() => {
              logoutStudent();
              navigate('/student/login');
            }}
            className="group relative mt-2 flex items-center justify-start lg:justify-center gap-3 px-3 lg:px-2 py-3 rounded-xl border border-red-300/80 bg-red-50/40 font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-bold lg:hidden">خروج</span>
            <span className="pointer-events-none hidden lg:block absolute z-[120] right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#138fbc] px-3 py-1.5 text-xs font-bold text-white opacity-0 translate-x-2 transition-all duration-200 shadow-lg shadow-cyan-900/25 group-hover:opacity-100 group-hover:translate-x-0">
              خروج
              <span className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-0 h-0 border-y-[6px] border-y-transparent border-l-[6px] border-l-[#138fbc]" />
            </span>
          </button>
        </nav>
      </aside>

      <main className="pt-[96px] transition-all mr-0 lg:mr-[74px]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
