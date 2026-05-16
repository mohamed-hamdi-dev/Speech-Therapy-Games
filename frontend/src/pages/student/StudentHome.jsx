import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, CirclePlay, ClipboardCheck, Sparkles, Stethoscope, Target } from 'lucide-react';
import { useTherapyStore } from '../../hooks/useTherapyStore';

const StudentHome = () => {
  const navigate = useNavigate();
  const { activeMode, currentStudent } = useTherapyStore();

  const games = Array.isArray(currentStudent?.assignedGames) ? currentStudent.assignedGames : [];

  return (
    <div className="space-y-5" dir="rtl">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#a8d7e7] bg-[linear-gradient(135deg,_#0f7ea6_0%,_#1693c1_45%,_#6ec0dc_100%)] text-white p-6 md:p-8 shadow-[0_20px_50px_rgba(9,86,114,0.26)]">
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-52 h-52 rounded-full bg-[#ffe39c]/20 blur-3xl" />

        <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-4 py-2 text-sm font-bold mb-4">
              <Stethoscope size={16} />
              بوابة المستفيد العلاجية
            </div>

            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-3">
              أهلًا {currentStudent?.name}، جاهزون لجلسة فعالة اليوم
            </h1>
            <p className="text-white/90 text-base md:text-lg leading-8 max-w-3xl">
              {activeMode === 'therapist'
                ? 'الأخصائي فعّل الجلسة. اختر النشاط المخصص وابدأ مباشرة مع متابعة مستوى المساعدة.'
                : 'هذه أنشطتك العلاجية المخصصة اليوم. اختر نشاطًا وابدأ بخطوات واضحة وسهلة.'}
            </p>
          </div>

          <div className="rounded-3xl bg-white/12 border border-white/20 p-4 min-w-[220px]">
            <div className="text-white/80 text-sm font-bold mb-2">ملخص سريع</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span>الأنشطة المخصصة</span>
                <span className="font-black text-xl">{games.length}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>وضع الجلسة</span>
                <span className="font-black">{activeMode === 'therapist' ? 'جلسة علاجية' : 'جلسة منزلية'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <MiniStat icon={CalendarClock} title="جلسة اليوم" value={activeMode === 'therapist' ? 'مفعلة الآن' : 'جاهزة للبدء'} />
        <MiniStat icon={Target} title="أولوية اليوم" value={games[0]?.titleAr || games[0]?.title || games[0]?.name || 'لا توجد'} />
        <MiniStat icon={ClipboardCheck} title="الواجب المنزلي" value={games.length ? 'متاح' : 'غير متاح'} />
        <MiniStat icon={Sparkles} title="التقدم العام" value={games.length ? 'مستمر' : 'في الانتظار'} />
      </section>

      <section className="bg-white rounded-[1.8rem] border border-[#dbe7f3] p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">أنشطتي اليوم</h2>
          <span className="text-slate-500 font-bold text-sm">المخصصة فقط لهذا المستفيد</span>
        </div>

        {games.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => navigate(`/student/game/${game.id}`)}
                className="group text-right bg-[linear-gradient(180deg,_#ffffff,_#f8fbff)] rounded-[1.5rem] border border-[#d6e5f4] p-3.5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="aspect-[16/9] rounded-[1.1rem] bg-[linear-gradient(140deg,_#edf6ff,_#dff1ff)] flex items-center justify-center mb-3 overflow-hidden">
                  <CirclePlay size={52} className="text-blue-600" />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-1">{game.config?.nameAr || game.titleAr || game.title || game.name}</h3>
                    <p className="text-sm text-slate-500">المستوى {game.level || 1}</p>
                  </div>
                  <span className="rounded-xl bg-blue-600 text-white px-3 py-2 text-sm font-black group-hover:bg-blue-700 transition-colors">
                    ابدأ
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#c5d9ea] bg-[#f9fcff] p-8 text-center">
            <div className="text-4xl mb-2">📋</div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">لا توجد أنشطة مخصصة الآن</h3>
            <p className="text-slate-600 leading-7">سيقوم الأخصائي بتخصيص الأنشطة ثم ستظهر هنا تلقائيًا.</p>
          </div>
        )}
      </section>
    </div>
  );
};

const MiniStat = ({ icon: Icon, title, value }) => (
  <article className="rounded-2xl border border-[#d9e7f4] bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold mb-2">
      <Icon size={16} className="text-blue-600" />
      {title}
    </div>
    <div className="font-black text-slate-900 text-lg truncate">{value}</div>
  </article>
);

export default StudentHome;
