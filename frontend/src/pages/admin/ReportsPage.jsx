import React, { useEffect, useMemo } from 'react';
import { BarChart3, Clock3, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import { useTherapyStore } from '../../hooks/useTherapyStore';

const ReportsPage = () => {
  const { fetchSessions, loadingSessions, sessions, students } = useTherapyStore();

  useEffect(() => {
    fetchSessions().catch(() => {});
  }, [fetchSessions]);

  const safeStudents = useMemo(() => (Array.isArray(students) ? students : []), [students]);
  const safeSessions = useMemo(() => (Array.isArray(sessions) ? sessions : []), [sessions]);
  const recentSessions = safeSessions.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-[2.2rem] font-black text-slate-900">التقارير</h1>
        <p className="text-lg text-slate-600 mt-2">
          مراجعة سريعة للجلسات المسجلة والانتقال إلى تقرير كل مستفيد بالتفصيل.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <Card className="p-6 rounded-[2rem]">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="text-blue-600" />
            <h2 className="text-lg md:text-[1.15rem] font-black">عدد الجلسات</h2>
          </div>
          <div className="text-5xl font-black text-slate-900">{safeSessions.length}</div>
        </Card>

        <Card className="p-6 rounded-[2rem]">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="text-amber-500" />
            <h2 className="text-lg md:text-[1.15rem] font-black">عدد المستفيدين</h2>
          </div>
          <div className="text-5xl font-black text-slate-900">{safeStudents.length}</div>
        </Card>

        <Card className="p-6 rounded-[2rem]">
          <div className="flex items-center gap-3 mb-3">
            <Clock3 className="text-emerald-700" />
            <h2 className="text-lg md:text-[1.15rem] font-black">آخر نشاط</h2>
          </div>
          <div className="text-sm text-slate-600 leading-7">
            {safeSessions[0]?.createdAt
              ? new Date(safeSessions[0].createdAt).toLocaleDateString('ar-EG')
              : 'لا توجد جلسات بعد'}
          </div>
        </Card>
      </div>

      <Card className="p-6 rounded-[2rem]">
        <h2 className="text-xl md:text-[1.35rem] font-black text-slate-900 mb-5">روابط تقارير المستفيدين</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {safeStudents.map((student) => (
            <Link
              key={student.id}
              to={`/admin/patients/${student.id}`}
              className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 hover:bg-white transition-colors"
            >
              <div className="font-black text-slate-900">{student.name}</div>
              <div className="text-slate-500 text-sm mt-1">
                المستوى {student.currentLevel} - كود {student.accessCode || student.code}
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="p-6 rounded-[2rem]">
        <h2 className="text-xl md:text-[1.35rem] font-black text-slate-900 mb-5">آخر الجلسات</h2>
        {loadingSessions ? (
          <div className="text-slate-500">جاري تحميل الجلسات...</div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => {
              const student = safeStudents.find((item) => item.id === session.studentId);

              return (
                <div
                  key={session.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <div className="font-black text-slate-900">{student?.name || 'مستفيد'}</div>
                    <div className="text-slate-500">
                      {session.game?.titleAr || session.game?.title || session.game?.name || 'لعبة'} •{' '}
                      {session.sessionType === 'CLINIC' ? 'جلسة عيادة' : 'جلسة منزلية'}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm font-bold">
                    <span className="rounded-full bg-emerald-100 px-3 py-2 text-emerald-700">
                      Score {session.score}%
                    </span>
                    <span className="rounded-full bg-blue-100 px-3 py-2 text-blue-700">
                      Attempts {session.attempts}
                    </span>
                    <span className="rounded-full bg-amber-100 px-3 py-2 text-amber-700">
                      {session.promptLevel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReportsPage;
