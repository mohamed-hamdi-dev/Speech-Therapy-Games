import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTherapyStore } from '../../hooks/useTherapyStore';

const resolveAssignedGames = (games, assignedGames) =>
  games.filter((game) => assignedGames.includes(game.id) || assignedGames.includes(game.type));

const StudentHome = () => {
  const navigate = useNavigate();
  const { activeMode, currentStudent } = useTherapyStore();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/games');
        const assigned = resolveAssignedGames(response.data, currentStudent?.assignedGames || []);
        setGames(assigned);
      } catch (error) {
        console.error('Error fetching assigned games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [currentStudent]);

  if (loading) {
    return <div className="text-center py-24 text-2xl font-black text-slate-700">جاري تجهيز ألعاب الطفل...</div>;
  }

  return (
    <div className="space-y-5">
      <section className="bg-white/95 border border-[#dbe7f3] rounded-[2.4rem] p-6 md:p-7 shadow-sm text-center">
        <div className="w-20 h-20 rounded-[1.5rem] bg-blue-100 mx-auto mb-4 flex items-center justify-center text-4xl">
          {currentStudent?.avatar || '🙂'}
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-3">
          أهلًا يا {currentStudent?.nameAr || currentStudent?.name}
        </h1>
        <p className="text-lg md:text-xl text-slate-600 leading-8 max-w-3xl mx-auto">
          {activeMode === 'therapist'
            ? 'الدكتور جهز الجلسة. اضغط على اللعبة وابدأ.'
            : 'هذه الألعاب المخصصة لك اليوم. اضغط على الصورة الكبيرة وابدأ اللعب.'}
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => navigate(`/student/game/${game.id}`)}
            className="group text-right bg-white rounded-[2rem] border border-[#dbe7f3] p-4 md:p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <div className="aspect-[4/3] rounded-[1.6rem] bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] flex items-center justify-center text-6xl mb-4 overflow-hidden">
              {game.type === 'listen_choose' ? '👂' : '🖐️'}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-1">{game.titleAr}</h2>
                <p className="text-base text-slate-500">المستوى {game.level}</p>
              </div>
              <div className="shrink-0 rounded-[1.1rem] bg-blue-600 text-white px-4 py-3 text-base font-black group-hover:bg-blue-700 transition-colors">
                العب
              </div>
            </div>
          </button>
        ))}
      </section>

      {games.length === 0 && (
        <section className="bg-white rounded-[2rem] border border-dashed border-[#dbe7f3] p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">لا توجد ألعاب مخصصة الآن</h2>
          <p className="text-lg text-slate-600 leading-8">
            يحتاج الطفل إلى ألعاب يخصصها الدكتور أولًا حتى تظهر هنا.
          </p>
        </section>
      )}
    </div>
  );
};

export default StudentHome;
