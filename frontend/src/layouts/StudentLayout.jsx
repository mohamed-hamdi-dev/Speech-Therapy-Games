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
  const [railOpen, setRailOpen] = useState(true);

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
    <div dir="rtl" className="min-h-screen bg-[radial-gradient(circle_at_top,_#eaf7fb,_#f7fcfd_34%,_#ffffff_75%)] text-slate-800 font-arabic">
      <header className="fixed top-0 inset-x-0 z-40 border-b border-[#dbe7f3] bg-white/95 backdrop-blur-md">
        <div className="w-full px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRailOpen((v) => !v)}
              className="inline-flex items-center justify-center h-12 w-12 rounded-xl border border-[#dbe7f3] bg-white hover:bg-slate-50"
              title="تبديل الشريط الجانبي"
            >
              {railOpen ? <X size={18} /> : <Menu size={18} />}
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

      <aside className={`fixed right-0 top-24 bottom-0 z-30 border-l border-[#dbe7f3] bg-white/95 backdrop-blur-md transition-all ${railOpen ? 'w-[74px] opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
        <nav className="h-full flex flex-col p-2 gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-center px-2 py-3 rounded-xl font-bold transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
                title={item.label}
              >
                <Icon size={18} />
              </NavLink>
            );
          })}

          <button
            onClick={() => {
              logoutStudent();
              navigate('/student/login');
            }}
            className="mt-auto flex items-center justify-center px-2 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors"
            title="خروج"
          >
            <LogOut size={18} />
          </button>
        </nav>
      </aside>

      <main className={`pt-24 transition-all ${railOpen ? 'mr-[74px]' : 'mr-0'}`}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
