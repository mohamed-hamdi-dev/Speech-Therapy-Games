import React from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Gamepad2, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { useTherapyStore } from '../hooks/useTherapyStore';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminSession, logoutAdmin } = useTherapyStore();

  if (!adminSession) {
    return <Navigate to="/admin/login" replace />;
  }

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { path: '/admin/students', icon: Users, label: 'الطلاب' },
    { path: '/admin/games', icon: Gamepad2, label: 'الألعاب' },
    { path: '/admin/reports', icon: FileText, label: 'التقارير' },
  ];

  return (
    <div className="min-h-screen bg-[#f3f7fc] text-slate-800 flex font-arabic">
      <aside className="w-72 bg-white border-l border-[#dbe7f3] flex flex-col shadow-sm">
        <div className="p-8 border-b border-[#e7eef6]">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#dbe7f3] shadow-sm flex items-center justify-center overflow-hidden p-1">
              <img
                src="/logo.png"
                alt="Phoniatric integrated neurodevelopmental clinic"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-black text-blue-700 leading-tight">العيادة السودانية</h1>
              <p className="text-sm text-slate-500">لأمراض التخاطب والنمو العصبي</p>
            </div>
          </Link>
        </div>

        <div className="px-6 pt-6 pb-4">
          <div className="rounded-3xl bg-[#eef4ff] border border-[#dbe7f3] p-4">
            <div className="text-xs font-bold text-slate-500 mb-1">الدخول الحالي</div>
            <div className="font-black text-slate-800">{adminSession.name}</div>
            <div className="text-sm text-slate-500">{adminSession.email}</div>
          </div>
        </div>

        <nav className="flex-grow p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/10'
                    : 'text-slate-600 hover:bg-[#f4f8fc]'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#e7eef6] space-y-2">
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

      <main className="flex-grow p-8 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
