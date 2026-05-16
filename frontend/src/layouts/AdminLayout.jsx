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

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminSession, logoutAdmin } = useTherapyStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);

  if (!adminSession?.token) {
    return <Navigate to="/admin/login" replace />;
  }

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
          className="lg:hidden fixed inset-0 bg-slate-900/30 z-30"
        />
      )}

      <aside
        className={`w-[86%] max-w-[320px] sm:max-w-[360px] min-h-screen bg-white border-l border-[#dbe7f3] shadow-sm fixed top-0 right-0 z-40 transform transition-all duration-300 lg:translate-x-0 lg:static lg:max-w-none lg:min-h-full ${
          isDesktopSidebarCollapsed ? 'lg:w-24' : 'lg:w-72'
        } ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="hidden lg:flex absolute top-3 left-3 z-10">
          <button
            type="button"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#dbe7f3] text-slate-600 hover:bg-[#f4f8fc]"
            onClick={() => setIsDesktopSidebarCollapsed((prev) => !prev)}
            aria-label={isDesktopSidebarCollapsed ? 'فتح القائمة الجانبية' : 'غلق القائمة الجانبية'}
            aria-expanded={!isDesktopSidebarCollapsed}
          >
            {isDesktopSidebarCollapsed ? <ChevronLeft size={18} /> : <X size={18} />}
          </button>
        </div>

        <div className="p-4 sm:p-5 lg:p-8 border-b border-[#e7eef6]">
          <Link to="/admin/dashboard" className="flex items-center gap-3" onClick={() => setIsSidebarOpen(false)}>
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-white border border-[#dbe7f3] shadow-sm items-center justify-center overflow-hidden p-1 ${
                isDesktopSidebarCollapsed ? 'hidden lg:hidden' : 'flex'
              }`}
            >
              <img src="/logo.png" alt="Clinic" className="w-full h-full object-contain" />
            </div>
            <div className={`min-w-0 ${isDesktopSidebarCollapsed ? 'lg:hidden' : ''}`}>
              <h1 className="text-base sm:text-lg font-black text-blue-700 leading-tight">مركز التأهيل والتخاطب</h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-5">نظام إدارة المرضى والجلسات والتقارير</p>
            </div>
          </Link>
        </div>

        <div className={`p-4 sm:p-5 lg:px-6 lg:pt-6 lg:pb-4 ${isDesktopSidebarCollapsed ? 'lg:hidden' : ''}`}>
          <div className="rounded-3xl bg-[#eef4ff] border border-[#dbe7f3] p-4">
            <div className="text-xs font-bold text-slate-500 mb-1">المستخدم الحالي</div>
            <div className="font-black text-slate-800 truncate">{adminSession.name}</div>
            <div className="text-sm font-bold text-blue-700 truncate">{getRoleLabel(adminSession?.user?.role)}</div>
            <div className="text-sm text-slate-500 truncate">{adminSession.email}</div>
          </div>
        </div>

        <nav className="px-4 sm:px-5 lg:p-6">
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
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

      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        <div className="lg:hidden flex justify-end mb-4">
          <button
            type="button"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 bg-white border border-[#dbe7f3] text-slate-700 px-3 py-2 rounded-xl shadow-sm"
            aria-expanded={isSidebarOpen}
            aria-label={isSidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            <span className="font-bold text-sm">{isSidebarOpen ? 'إغلاق' : 'القائمة'}</span>
          </button>
        </div>
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
