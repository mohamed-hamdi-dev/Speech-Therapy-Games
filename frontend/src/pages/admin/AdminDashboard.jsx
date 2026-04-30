import React from 'react';
import { Activity, BarChart3, PlaySquare, Users } from 'lucide-react';
import Card from '../../components/Card';
import { useTherapyStore } from '../../hooks/useTherapyStore';

const AdminDashboard = () => {
  const { sessions, students, therapistSession } = useTherapyStore();

  const stats = [
    { label: 'الطلاب', value: students.length, icon: Users, tone: 'bg-[#eef4ff] text-blue-700' },
    { label: 'الجلسات المسجلة', value: sessions.length, icon: Activity, tone: 'bg-[#eff6ff] text-blue-700' },
    {
      label: 'الجلسة الحالية',
      value: therapistSession?.isActive ? 'نشطة' : 'لا توجد',
      icon: PlaySquare,
      tone: 'bg-[#eef4ff] text-blue-700',
    },
    {
      label: 'متابعة prompts',
      value: therapistSession?.therapistControlsEnabled ? 'مفعلة' : 'متوقفة',
      icon: BarChart3,
      tone: 'bg-[#faf5ff] text-violet-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-slate-900">لوحة تحكم الدكتور</h1>
        <p className="text-lg text-slate-600 mt-2">
          المكان الذي يبدأ منه العلاج: إدارة الطلاب، بدء الجلسات، ومتابعة الأداء.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label} className="p-6 rounded-[2rem]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-slate-500 mb-2">{stat.label}</div>
                  <div className="text-4xl font-black text-slate-900">{stat.value}</div>
                </div>
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${stat.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5">
        <Card className="p-7 rounded-[2rem]">
          <h2 className="text-2xl font-black text-slate-900 mb-4">تدفق العمل المقترح</h2>
          <div className="space-y-3 text-slate-700 text-lg leading-8">
            <div>1. سجل الدخول كدكتور من `/admin`.</div>
            <div>2. اختر الطالب المناسب من قائمة الطلاب.</div>
            <div>3. اضغط `ابدأ جلسة` لفتح أول لعبة مخصصة مباشرة.</div>
            <div>4. فعّل `وضع الدكتور` داخل اللعبة لتسجيل مستويات المساعدة.</div>
            <div>5. راجع التقارير بعد نهاية الجلسة.</div>
          </div>
        </Card>

        <Card className="p-7 rounded-[2rem] bg-blue-600 text-white border-none">
          <h2 className="text-2xl font-black mb-4">Design Goal</h2>
          <p className="text-white/90 text-lg leading-8">
            الطفل لا يجب أن يفكر في تسجيل الدخول أو الإعدادات أو التصفح. الطبيب يقود الجلسة، ولي الأمر يدعم الوصول، والطفل يركز على اللعب فقط.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
