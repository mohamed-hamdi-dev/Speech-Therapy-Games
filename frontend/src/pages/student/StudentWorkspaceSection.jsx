import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTherapyStore } from '../../hooks/useTherapyStore';

const TITLES = {
  sessions: 'الجلسات',
  assessment: 'التقييم',
  plan: 'الخطة العلاجية',
  behavior: 'السلوكيات',
  reports: 'التقارير',
  library: 'المكتبة العلاجية',
  medical: 'الملف الطبي',
  journey: 'مسار التقدم',
  profile: 'صفحتي',
};

const MEDICAL_TABS = [
  { id: 'medical', label: 'الملف الطبي' },
  { id: 'assessment', label: 'التقييم' },
  { id: 'behavior', label: 'السلوكيات' },
  { id: 'journey', label: 'مسار التقدم' },
  { id: 'profile', label: 'صفحتي' },
];

const StudentWorkspaceSection = ({ section }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentStudent } = useTherapyStore();

  const games = Array.isArray(currentStudent?.assignedGames) ? currentStudent.assignedGames : [];
  const title = TITLES[section] || 'بوابة المستفيد';

  if (section === 'library') {
    return (
      <div dir="rtl" className="space-y-4">
        <h1 className="text-3xl font-black text-slate-900">{title}</h1>
        <p className="text-slate-600">أنشطة مخصصة للمستفيد فقط.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => navigate(`/student/game/${game.id}`)}
              className="text-right bg-white border border-[#dbe7f3] rounded-2xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="font-black text-xl text-slate-900">{game.titleAr || game.title || game.name}</div>
              <div className="text-slate-500 mt-1">المستوى {game.level || 1}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'medical') {
    const currentTab = searchParams.get('tab') || 'medical';

    return (
      <div dir="rtl" className="space-y-4">
        <h1 className="text-3xl font-black text-slate-900">{title}</h1>

        <div className="flex flex-wrap gap-2">
          {MEDICAL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`rounded-xl px-4 py-2 font-bold border transition-colors ${
                currentTab === tab.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-[#dbe7f3] hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white border border-[#dbe7f3] rounded-2xl p-5">
          {currentTab === 'medical' && (
            <>
              <div className="text-slate-500 text-sm mb-1">الاسم</div>
              <div className="font-black text-2xl text-slate-900">{currentStudent?.name || '-'}</div>
              <div className="mt-4 text-slate-500 text-sm mb-1">التشخيص</div>
              <div className="font-bold text-slate-800">{currentStudent?.diagnosis || 'غير محدد بعد'}</div>
            </>
          )}

          {currentTab !== 'medical' && (
            <div className="text-slate-600 leading-8">
              هذه بيانات تبويب <span className="font-black">{TITLES[currentTab]}</span> وسيتم ربطها ببيانات الـAPI في المرحلة القادمة.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-4">
      <h1 className="text-3xl font-black text-slate-900">{title}</h1>
      <div className="bg-white border border-[#dbe7f3] rounded-2xl p-6 text-slate-600 leading-8">
        هذه صفحة {title} ضمن بوابة المستفيد. سيتم ربطها ببيانات الـAPI في المرحلة القادمة.
      </div>
    </div>
  );
};

export default StudentWorkspaceSection;
