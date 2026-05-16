import React, { useMemo } from 'react';
import { Activity, CalendarClock, Flag, HeartPulse, Target, TrendingUp, Users } from 'lucide-react';
import Card from '../../components/Card';
import { getDashboardMock } from '../../data/patientWorkspaceMock';

const AdminDashboard = () => {
  const dashboard = useMemo(() => getDashboardMock(), []);
  const { kpis, upcomingSessions, followUpPatients, activeBehaviorAlerts, progressTrend } = dashboard;

  const stats = [
    { label: 'إجمالي المرضى', value: kpis.totalPatients, icon: Users, tone: 'bg-[#eef4ff] text-blue-700' },
    { label: 'جلسات اليوم', value: kpis.todaySessions, icon: CalendarClock, tone: 'bg-[#eff6ff] text-blue-700' },
    { label: 'الخطط النشطة', value: kpis.activePlans, icon: Target, tone: 'bg-[#eefcf6] text-emerald-700' },
    { label: 'الأهداف المتقنة', value: kpis.masteredGoals, icon: Flag, tone: 'bg-[#fff7ed] text-orange-700' },
    { label: 'نسبة الحضور', value: `${kpis.attendanceRate}%`, icon: Activity, tone: 'bg-[#f8fafc] text-slate-700' },
    { label: 'التقدم العام', value: `${kpis.overallProgress}%`, icon: TrendingUp, tone: 'bg-[#ecfeff] text-cyan-700' },
  ];

  return (
    <section className="space-y-5" dir="rtl">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">لوحة متابعة المركز</h1>
        <p className="text-slate-600 mt-2">نظرة سريعة على حالة المرضى، الجلسات، والخطط العلاجية.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 rounded-[1.4rem]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">{stat.value}</div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.tone}`}>
                  <Icon size={22} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="الجلسات القادمة">
          {upcomingSessions.map((session) => (
            <Row key={session.id} text={`مريض ${session.patientId} - ${session.date} ${session.time} - ${session.type}`} />
          ))}
        </Panel>

        <Panel title="مرضى يحتاجون متابعة">
          {followUpPatients.map((patient) => (
            <Row key={patient.id} text={`${patient.name} - تقدم ${patient.progress}% - حضور ${patient.attendanceRate}%`} />
          ))}
        </Panel>

        <Panel title="تنبيهات السلوكيات النشطة" icon={<HeartPulse size={18} className="text-rose-600" />}>
          {activeBehaviorAlerts.map((alert) => (
            <Row key={alert.patientId} text={`${alert.patientName}: ${alert.behaviors.join('، ')}`} />
          ))}
        </Panel>

        <Panel title="اتجاه التقدم">
          <div className="flex items-end gap-2 h-40 border-b border-slate-200 pb-2">
            {progressTrend.map((point) => (
              <div key={point.label} className="flex-1 flex flex-col items-center justify-end">
                <div
                  className="w-full max-w-[42px] rounded-t-md bg-blue-500"
                  style={{ height: `${point.value}%` }}
                />
                <div className="text-xs text-slate-500 mt-2">{point.label}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
};

const Panel = ({ title, icon, children }) => (
  <Card className="p-5 rounded-[1.4rem]">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
    </div>
    <div className="space-y-2">{children}</div>
  </Card>
);

const Row = ({ text }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-sm text-slate-700">{text}</div>
);

export default AdminDashboard;
