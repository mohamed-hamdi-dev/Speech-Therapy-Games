import React, { useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  FileText,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Target,
  Users,
  X,
} from 'lucide-react';
import { useTherapyStore } from '../hooks/useTherapyStore';

const getRoleLabel = (role) => (role === 'SUPER_ADMIN' ? 'مدير رئيسي' : 'أخصائي');
const PAGE_TITLES = {
  '/admin/dashboard': 'لوحة التحكم',
  '/admin/patients': 'المرضى',
  '/admin/library': 'المكتبة',
  '/admin/curriculum': 'المنهج',
  '/admin/games': 'الألعاب',
  '/admin/reports': 'التقارير',
  '/admin/therapists': 'الأخصائيون',
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminSession, logoutAdmin } = useTherapyStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);

  if (!adminSession?.token) {
    return <Navigate to="/admin/login" replace />;
  }

  const activePath = Object.keys(PAGE_TITLES).find((path) => location.pathname.startsWith(path));
  const currentTitle = activePath ? PAGE_TITLES[activePath] : 'لوحة الإدارة';

  const menuItems = [
    ...(adminSession?.user?.role === 'SUPER_ADMIN'
      ? [{ path: '/admin/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' }]
      : []),
    { path: '/admin/patients', icon: Users, label: 'المرضى' },
    { path: '/admin/library', icon: BookOpen, label: 'المكتبة' },
    { path: '/admin/curriculum', icon: Target, label: 'المنهج' },
    { path: '/admin/games', icon: Gamepad2, label: 'الألعاب' },
    { path: '/admin/reports', icon: FileText, label: 'التقارير' },
    ...(adminSession?.user?.role === 'SUPER_ADMIN'
      ? [{ path: '/admin/therapists', icon: ShieldCheck, label: 'الأخصائيون' }]
      : []),
  ];

  return (
    <div className="h-full min-h-full bg-[#f3f7fc] text-slate-800 font-arabic lg:flex relative" dir="rtl">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة الجانبية"
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 top-[86px] bg-slate-900/30 z-30"
        />
      )}

      <aside
        className={`w-[86%] max-w-[320px] sm:max-w-[360px] bg-white border-l border-[#dbe7f3] shadow-sm fixed top-[86px] right-0 bottom-0 lg:bottom-[56px] z-40 overflow-hidden flex flex-col transform transition-all duration-300 lg:translate-x-0 lg:max-w-none ${
          isDesktopSidebarCollapsed ? 'lg:w-24' : 'lg:w-72'
        } ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-[110%]'
        }`}
      >
        <div className="hidden lg:flex absolute top-3 left-3 z-10">
          <button
            type="button"
            className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#dbe7f3] text-slate-600 hover:bg-[#f4f8fc]"
            onClick={() => setIsDesktopSidebarCollapsed((prev) => !prev)}
            aria-label={isDesktopSidebarCollapsed ? 'فتح القائمة الجانبية' : 'غلق القائمة الجانبية'}
            aria-expanded={!isDesktopSidebarCollapsed}
          >
            {isDesktopSidebarCollapsed ? <ChevronLeft size={18} className="absolute inset-0 m-auto" /> : <X size={18} className="absolute inset-0 m-auto" />}
          </button>
        </div>

        <div className="p-4 pt-6 sm:p-5 sm:pt-7 lg:p-8 border-b border-[#e7eef6]">
          <Link to="/admin/dashboard" className="flex items-center gap-3" onClick={() => setIsSidebarOpen(false)}>
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-white border border-[#dbe7f3] shadow-sm items-center justify-center overflow-hidden p-1 ${
                isDesktopSidebarCollapsed ? 'hidden lg:hidden' : 'flex'
              }`}
            >
              <img src="/logo.png" alt="Clinic" className="w-full h-full object-contain" />
            </div>
            <div className={`min-w-0 mt-2 ${isDesktopSidebarCollapsed ? 'lg:hidden' : ''}`}>
              <h1 className="text-base sm:text-lg font-black text-blue-700 leading-tight">مركز التأهيل والتخاطب</h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-5">نظام إدارة المرضى والجلسات والتقارير</p>
            </div>
          </Link>
        </div>

        <nav className="admin-sidebar-scroll flex-1 min-h-0 px-4 sm:px-5 lg:p-6 overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-2 pb-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/10'
                      : 'bg-white text-slate-600 hover:bg-[#f4f8fc]'
                  } ${isDesktopSidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`}
                >
                  <Icon size={20} />
                  <span className={`whitespace-nowrap ${isDesktopSidebarCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 sm:p-5 lg:p-6 border-t border-[#e7eef6] mt-3 lg:mt-4 space-y-2">
          <Link
            to="/student/login"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 text-slate-600 hover:text-slate-900 font-bold px-4 py-3 rounded-2xl hover:bg-[#f4f8fc] transition-colors ${isDesktopSidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`}
          >
            <ArrowRight size={20} />
            <span className={isDesktopSidebarCollapsed ? 'lg:hidden' : ''}>الانتقال لوضع الأسرة</span>
          </Link>

          <button
            onClick={() => {
              logoutAdmin();
              navigate('/admin/login');
            }}
            className={`w-full flex items-center gap-3 text-red-600 font-bold px-4 py-3 rounded-2xl hover:bg-red-50 transition-colors ${isDesktopSidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`}
          >
            <LogOut size={20} />
            <span className={isDesktopSidebarCollapsed ? 'lg:hidden' : ''}>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 pt-[106px] sm:p-6 sm:pt-[110px] lg:p-10 lg:pt-[108px] overflow-y-auto">
        <header className="fixed top-0 inset-x-0 z-50 border-b border-[#dbe7f3] bg-white/95 backdrop-blur-md shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
          <div className="h-[86px] px-4 md:px-6 py-3 flex items-center justify-between gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="lg:hidden inline-flex items-center gap-2 bg-white border border-[#dbe7f3] text-slate-700 px-3 py-2 rounded-xl shadow-sm"
              aria-expanded={isSidebarOpen}
              aria-label={isSidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="min-w-0 max-w-[58%] sm:max-w-none flex items-center justify-center sm:justify-start gap-2 rounded-xl border border-[#dbe7f3] bg-white px-3 sm:px-4 py-2">
              <span className="font-black text-slate-800 truncate">{currentTitle}</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 rounded-2xl border border-[#dbe7f3] bg-white px-2.5 sm:px-4 py-2 shadow-sm">
              <div className="text-right">
                <div className="text-xs text-slate-500 font-bold">المستخدم</div>
                <div className="font-black text-slate-900 leading-tight text-sm sm:text-base max-w-[120px] sm:max-w-none truncate">{adminSession?.name}</div>
              </div>
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-blue-100 flex items-center justify-center">
                <img src="/logo.png" alt="Clinic" className="w-9 h-9 object-contain" />
              </div>
            </div>

          </div>
        </header>
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;




