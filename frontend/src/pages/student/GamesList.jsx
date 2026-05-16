import React, { useMemo } from 'react';
import { Lock, PlayCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTherapyStore } from '../../hooks/useTherapyStore';

const GamesList = () => {
  const navigate = useNavigate();
  const { currentStudent } = useTherapyStore();

  const assignedGames = Array.isArray(currentStudent?.assignedGames) ? currentStudent.assignedGames : [];
  const currentLevel = Number(currentStudent?.currentLevel || 1);

  const { unlockedGames, lockedGames } = useMemo(() => {
    const unlocked = [];
    const locked = [];

    assignedGames.forEach((game) => {
      const level = Number(game?.level || 1);
      if (level <= currentLevel) {
        unlocked.push(game);
      } else {
        locked.push(game);
      }
    });

    return { unlockedGames: unlocked, lockedGames: locked };
  }, [assignedGames, currentLevel]);

  return (
    <section dir="rtl" className="space-y-6">
      <div className="rounded-[2rem] border border-[#b8deec] bg-[linear-gradient(135deg,_#0f7ea6_0%,_#1693c1_46%,_#55b6d8_100%)] text-white p-6 md:p-8 shadow-[0_20px_50px_rgba(9,86,114,0.24)]">
        <h1 className="text-3xl md:text-5xl font-black mb-3">الألعاب المفتوحة لك</h1>
        <p className="text-white/90 text-lg">المعروض هنا فقط الألعاب المخصصة والمفتوحة حسب مستواك الحالي.</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-4 py-2 text-sm font-bold">
          <Sparkles size={16} />
          المستوى الحالي: {currentLevel}
        </div>
      </div>

      {unlockedGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {unlockedGames.map((game) => (
            <article key={game.id} className="rounded-[1.6rem] border border-[#dbe7f3] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[16/10] rounded-[1.2rem] bg-[linear-gradient(140deg,_#edf6ff,_#dff1ff)] flex items-center justify-center mb-3">
                <PlayCircle size={56} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">{game.titleAr || game.title || game.name}</h2>
              <p className="text-slate-500 mb-4">المستوى {game.level || 1}</p>
              <button
                onClick={() => navigate(`/student/game/${game.id}`)}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black py-3"
              >
                ابدأ اللعب
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#c6d9ea] bg-white p-8 text-center text-slate-600 font-bold">
          لا توجد ألعاب مفتوحة على مستواك الحالي الآن.
        </div>
      )}

      {lockedGames.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-black text-slate-800">ألعاب ستُفتح لاحقًا</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {lockedGames.map((game) => (
              <article key={game.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 opacity-90">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-black text-slate-800">{game.titleAr || game.title || game.name}</div>
                  <Lock size={16} className="text-slate-500" />
                </div>
                <div className="text-sm text-slate-500">يتطلب المستوى {game.level || 1}</div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default GamesList;
