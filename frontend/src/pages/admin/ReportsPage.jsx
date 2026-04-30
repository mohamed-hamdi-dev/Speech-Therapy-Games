import React from 'react';
import { BarChart3, Clock3, Sparkles } from 'lucide-react';
import Card from '../../components/Card';
import { PROMPT_LEVELS, useTherapyStore } from '../../hooks/useTherapyStore';

const ReportsPage = () => {
  const { sessions, students } = useTherapyStore();

  const recentSessions = [...sessions].slice(-6).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-slate-900">التقارير</h1>
        <p className="text-lg text-slate-600 mt-2">
          مراجعة سريعة لآخر الجلسات ومؤشرات الاستقلالية ومستويات المساعدة المستخدمة.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <Card className="p-6 rounded-[2rem]">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="text-blue-600" />
            <h2 className="text-xl font-black">عدد الجلسات</h2>
          </div>
          <div className="text-5xl font-black text-slate-900">{sessions.length}</div>
        </Card>

        <Card className="p-6 rounded-[2rem]">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="text-amber-500" />
            <h2 className="text-xl font-black">الطلاب النشطون</h2>
          </div>
          <div className="text-5xl font-black text-slate-900">{students.length}</div>
        </Card>

        <Card className="p-6 rounded-[2rem]">
          <div className="flex items-center gap-3 mb-3">
            <Clock3 className="text-emerald-700" />
            <h2 className="text-xl font-black">مستويات المساعدة</h2>
          </div>
          <div className="text-sm text-slate-600 leading-7">
            {PROMPT_LEVELS.map((level) => level.label).join('، ')}
          </div>
        </Card>
      </div>

      <Card className="p-6 rounded-[2rem]">
        <h2 className="text-2xl font-black text-slate-900 mb-5">آخر الجلسات</h2>
        <div className="space-y-3">
          {recentSessions.map((session) => {
            const student = students.find((item) => item.id === session.studentId);

            return (
              <div
                key={session.id}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <div className="font-black text-slate-900">{student?.nameAr || student?.name || 'طالب'}</div>
                  <div className="text-slate-500">
                    {session.gameType || session.gameId} • مستوى {session.level}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm font-bold">
                  <span className="rounded-full bg-emerald-100 px-3 py-2 text-emerald-700">
                    Score {session.score}%
                  </span>
                  <span className="rounded-full bg-blue-100 px-3 py-2 text-blue-700">
                    استقلالية {session.independenceRate}%
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-2 text-amber-700">
                    {session.therapistMode ? 'جلسة عيادة' : 'جلسة منزلية'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;
