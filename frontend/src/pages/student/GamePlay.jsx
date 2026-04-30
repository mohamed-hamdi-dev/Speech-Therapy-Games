import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { DoorOpen, ShieldCheck } from 'lucide-react';
import Button from '../../components/Button';
import DragDropGame from '../../games/DragDropGame';
import ListenChooseGame from '../../games/ListenChooseGame';
import { PROMPT_LEVELS, useTherapyStore } from '../../hooks/useTherapyStore';

const GamePlay = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const {
    currentStudent,
    endTherapistSession,
    saveSession,
    setTherapistControlsEnabled,
    setTherapistPromptLevel,
    therapistSession,
  } = useTherapyStore();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/games/${gameId}`);
        setGame(response.data);
      } catch (error) {
        console.error('Error fetching game:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  const handleGameComplete = (stats) => {
    const totalQuestions = stats.correctAnswers + stats.wrongAnswers || 1;
    const score = Math.round((stats.correctAnswers / totalQuestions) * 100);
    const independentCount = stats.prompts.filter((prompt) => prompt === 'none').length;
    const independenceRate = Math.round((independentCount / stats.prompts.length) * 100);

    const promptLabels = stats.prompts.map(
      (prompt) => PROMPT_LEVELS.find((level) => level.id === prompt)?.label || prompt
    );

    const sessionData = {
      studentId: currentStudent?.id,
      gameId: game.id,
      gameType: game.type,
      level: game.level,
      totalQuestions,
      score,
      independenceRate,
      therapistMode: therapistSession?.isActive,
      promptSummary: promptLabels,
      ...stats,
    };

    saveSession(sessionData);
    navigate('/student/result', { state: { game, sessionData } });
  };

  const renderGame = () => {
    const gameProps = {
      game,
      onComplete: handleGameComplete,
      therapistControlsEnabled: therapistSession?.therapistControlsEnabled,
      therapistPromptLevel: therapistSession?.promptLevel || 'none',
    };

    switch (game.type) {
      case 'listen_choose':
        return <ListenChooseGame {...gameProps} />;
      case 'action_drag_drop':
        return <DragDropGame {...gameProps} />;
      default:
        return (
          <div className="bg-white rounded-[2.5rem] border border-[#eadfbe] p-10 text-center">
            <h2 className="text-3xl font-black text-slate-800 mb-4">هذه اللعبة قيد التطوير</h2>
            <Button variant="primary" onClick={() => navigate('/student/home')}>
              العودة للألعاب
            </Button>
          </div>
        );
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-3xl font-black text-slate-700">جاري تجهيز الجلسة...</div>;
  }

  if (!game) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-[#eadfbe] p-10 text-center">
        <h2 className="text-3xl font-black text-slate-800 mb-4">تعذر العثور على اللعبة</h2>
        <Button variant="primary" onClick={() => navigate('/student/home')}>
          العودة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {therapistSession?.isActive && (
        <section className="bg-white border border-[#c8ebd2] rounded-[2.5rem] p-5 md:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#14532d] text-white px-4 py-2 text-sm font-bold mb-3">
                <ShieldCheck size={16} />
                <span>Therapist Controls</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">وضع الدكتور</h2>
              <p className="text-slate-600 mt-1">
                فعّل التتبع أثناء اللعب وسجل مستوى المساعدة الحالي للطفل.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  setTherapistControlsEnabled(!therapistSession?.therapistControlsEnabled)
                }
                className={`rounded-[1.4rem] px-5 py-3 font-black transition-colors ${
                  therapistSession?.therapistControlsEnabled
                    ? 'bg-[#14532d] text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {therapistSession?.therapistControlsEnabled ? 'وضع الدكتور: ON' : 'وضع الدكتور: OFF'}
              </button>

              <button
                onClick={() => {
                  endTherapistSession();
                  navigate('/admin/students');
                }}
                className="rounded-[1.4rem] px-5 py-3 font-black bg-red-50 text-red-600 border border-red-100 flex items-center gap-2"
              >
                <DoorOpen size={18} />
                <span>إنهاء الجلسة</span>
              </button>
            </div>
          </div>

          {therapistSession?.therapistControlsEnabled && (
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {PROMPT_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setTherapistPromptLevel(level.id)}
                  className={`rounded-[1.4rem] border px-4 py-4 text-right font-black transition-all ${
                    therapistSession?.promptLevel === level.id
                      ? 'bg-[#fff7e7] border-[#d4a017] text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="bg-white/85 rounded-[2.8rem] border border-[#f0dda7] px-5 py-4 md:px-6 md:py-5 shadow-sm">
        <div className="text-center">
          <div className="text-sm font-bold text-slate-500 mb-1">اللعبة الحالية</div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">{game.titleAr}</h1>
        </div>
      </section>

      {renderGame()}
    </div>
  );
};

export default GamePlay;
