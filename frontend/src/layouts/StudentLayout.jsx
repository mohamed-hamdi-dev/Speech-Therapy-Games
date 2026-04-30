import React from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, LogOut, ShieldCheck } from 'lucide-react';
import { useTherapyStore } from '../hooks/useTherapyStore';

const StudentLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeMode, currentStudent, logoutStudent, therapistSession } = useTherapyStore();

  if (!currentStudent && location.pathname !== '/student/login') {
    return <Navigate to="/student/login" replace />;
  }

  if (location.pathname === '/student/login') {
    return <Outlet />;
  }

  const isGameScreen = location.pathname.includes('/student/game/');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#edf5ff,_#f8fbff_34%,_#ffffff_75%)] text-slate-800 font-arabic">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 bg-white/95 rounded-[1.7rem] px-4 py-3 border border-[#dbe7f3] shadow-sm">
            <div className="w-12 h-12 rounded-[1.1rem] bg-blue-100 flex items-center justify-center text-2xl">
              {currentStudent?.avatar || '🙂'}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">
                {activeMode === 'therapist' ? 'جلسة علاجية' : 'جلسة منزلية'}
              </div>
              <div className="text-lg md:text-xl font-black">{currentStudent?.nameAr || currentStudent?.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isGameScreen && (
              <NavLink
                to="/student/home"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-[1.4rem] px-4 py-3 font-bold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white border border-blue-600 shadow-sm'
                      : 'bg-white/95 border border-[#dbe7f3] text-slate-700 hover:bg-white'
                  }`
                }
              >
                <Home size={18} />
                <span className="hidden sm:inline">الرئيسية</span>
              </NavLink>
            )}

            {therapistSession?.isActive && (
              <div className="flex items-center gap-2 bg-blue-600 text-white rounded-[1.4rem] px-4 py-3 font-bold">
                <ShieldCheck size={18} />
                <span className="hidden sm:inline">Therapist Controls</span>
              </div>
            )}

            {!isGameScreen && (
              <button
                onClick={() => {
                  logoutStudent();
                  navigate('/student/login');
                }}
                className="flex items-center gap-2 bg-white/95 border border-red-100 text-red-600 rounded-[1.4rem] px-4 py-3 font-bold hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">خروج</span>
              </button>
            )}
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default StudentLayout;
