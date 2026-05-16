import React from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  FileText,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useTherapyStore } from '../hooks/useTherapyStore';

const getRoleLabel = (role) => (role === 'SUPER_ADMIN' ? 'مدير رئيسي' : 'أخصائي');

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminSession, logoutAdmin } = useTherapyStore();

  if (!adminSession?.token) {
    return <Navigate to="/admin/login" replace />;
  }

  const menuItems = [
    ...(adminSession?.user?.role === 'SUPER_ADMIN'
      ? [{ path: '/admin/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' }]
      : []),
    { path: '/admin/patients', icon: Users, label: 'المرضى' },
    { path: '/admin/library', icon: BookOpen, label: 'المكتبة' },
    { path: '/admin/games', icon: Gamepad2, label: 'الألعاب' },
    { path: '/admin/reports', icon: FileText, label: 'التقارير' },
    ...(adminSession?.user?.role === 'SUPER_ADMIN'
      ? [{ path: '/admin/therapists', icon: ShieldCheck, label: 'الأخصائيون' }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#f3f7fc] text-slate-800 font-arabic lg:flex" dir="rtl">
      <aside className="lg:w-72 lg:min-h-screen bg-white border-b lg:border-b-0 lg:border-l border-[#dbe7f3] shadow-sm">
        <div className="p-4 sm:p-5 lg:p-8 border-b border-[#e7eef6]">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-white border border-[#dbe7f3] shadow-sm flex items-center justify-center overflow-hidden p-1">
              <img src="/logo.png" alt="Clinic" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-blue-700 leading-tight">مركز التأهيل والتخاطب</h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-5">نظام إدارة المرضى والجلسات والتقارير</p>
            </div>
          </Link>
        </div>

        <div className="p-4 sm:p-5 lg:px-6 lg:pt-6 lg:pb-4">
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
                  className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/10'
                      : 'bg-white text-slate-600 hover:bg-[#f4f8fc]'
                  }`}
                >
                  <Icon size={20} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 sm:p-5 lg:p-6 border-t border-[#e7eef6] mt-3 lg:mt-4 space-y-2">
          <Link
            to="/student/login"
            className="flex items-center gap-3 text-slate-600 hover:text-slate-900 font-bold px-4 py-3 rounded-2xl hover:bg-[#f4f8fc] transition-colors"
          >
            <ArrowRight size={20} />
            <span>الانتقال لوضع الأسرة</span>
          </Link>

          <button
            onClick={() => {
              logoutAdmin();
              navigate('/admin/login');
            }}
            className="w-full flex items-center gap-3 text-red-600 font-bold px-4 py-3 rounded-2xl hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
