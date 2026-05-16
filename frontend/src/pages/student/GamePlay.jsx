import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DoorOpen, ShieldCheck } from 'lucide-react';
import Button from '../../components/Button';
import GameEngine from '../../games/GameEngine';
import normalizeGameForEngine from '../../games/adapters/normalizeGameForEngine';
import { PROMPT_LEVELS, useTherapyStore } from '../../hooks/useTherapyStore';
import gameService from '../../services/gameService';

const GamePlay = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const {
    currentStudent,
    endTherapistSession,
    mapFrontendPromptToApi,
    saveSession,
    setTherapistControlsEnabled,
    setTherapistPromptLevel,
    therapistSession,
  } = useTherapyStore();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showIntroVideo, setShowIntroVideo] = useState(false);
  const currentLevel = Math.min(Math.max(Number(currentStudent?.currentLevel || 1), 1), 3);
  const assignedGame = useMemo(
    () =>
      Array.isArray(currentStudent?.assignedGames)
        ? currentStudent.assignedGames.find((item) => String(item?.id) === String(gameId)) || null
        : null,
    [currentStudent?.assignedGames, gameId]
  );

  useEffect(() => {
    const fetchGame = async () => {
      if (assignedGame?.config) {
        setGame(normalizeGameForEngine(assignedGame));
        setError('');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await gameService.getGame(null, gameId);
        setGame(normalizeGameForEngine(response));
      } catch (_fetchError) {
        if (assignedGame) {
          setGame(normalizeGameForEngine(assignedGame));
          setError('');
          return;
        }

        setError('تعذر تحميل اللعبة.');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [assignedGame, gameId]);

  const introVideo = game?.config?.media?.introVideo || '';

  useEffect(() => {
    setShowIntroVideo(Boolean(introVideo));
  }, [introVideo, game?.id]);

  const handleGameComplete = async (stats) => {
    if (!currentStudent || !game) {
      return;
    }

    const totalQuestions = (stats.correctAnswers || 0) + (stats.wrongAnswers || 0) || 1;
    const score = Math.round(((stats.correctAnswers || 0) / totalQuestions) * 100);
    const promptHistory = Array.isArray(stats.prompts) ? stats.prompts : [];
    const independentCount = promptHistory.filter((prompt) => prompt === 'none').length;
    const independenceRate = promptHistory.length
      ? Math.round((independentCount / promptHistory.length) * 100)
      : 100;

    const promptSummary = promptHistory.map(
      (prompt) => PROMPT_LEVELS.find((level) => level.id === prompt)?.label || prompt
    );

    const sessionPayload = {
      studentId: currentStudent.id,
      gameId: game.id,
      score,
      attempts: Array.isArray(stats.attempts)
        ? stats.attempts.reduce((sum, value) => sum + value, 0)
        : stats.attempts || totalQuestions,
      duration: stats.timeSpent || 0,
      sessionType: therapistSession?.isActive ? 'CLINIC' : 'HOME',
      promptLevel: mapFrontendPromptToApi(therapistSession?.promptLevel || 'none'),
    };

    try {
      const savedSession = await saveSession(sessionPayload);
      const sessionData = {
        ...savedSession,
        gameType: game.type,
        level: game.level,
        totalQuestions,
        correctAnswers: stats.correctAnswers || 0,
        wrongAnswers: stats.wrongAnswers || 0,
        score,
        independenceRate,
        therapistMode: therapistSession?.isActive,
        promptSummary,
        timeSpent: stats.timeSpent || 0,
      };

      navigate('/student/result', { state: { game, sessionData } });
    } catch (saveError) {
      setError(saveError?.response?.data?.message || saveError?.message || 'تعذر حفظ نتيجة الجلسة.');
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-3xl font-black text-slate-700">جارٍ تجهيز الجلسة...</div>;
  }

  if (!game) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-[#eadfbe] p-10 text-center">
        <h2 className="text-3xl font-black text-slate-800 mb-4">{error || 'تعذر العثور على اللعبة'}</h2>
        <Button variant="primary" onClick={() => navigate('/student/home')}>
          العودة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5" dir="rtl">
      {therapistSession?.isActive && (
        <section className="bg-white border border-[#c8ebd2] rounded-[2.5rem] p-5 md:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#14532d] text-white px-4 py-2 text-sm font-bold mb-3">
                <ShieldCheck size={16} />
                <span>وضع الدكتور</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">متابعة الجلسة</h2>
              <p className="text-slate-600 mt-1">
                فعّل التتبع أثناء اللعب وسجّل مستوى المساعدة الحالي للطفل.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setTherapistControlsEnabled(!therapistSession?.therapistControlsEnabled)}
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

      {error && (
        <div className="rounded-3xl bg-red-50 border border-red-100 px-5 py-4 text-red-600 font-bold">
          {error}
        </div>
      )}

      <section className="bg-white/85 rounded-[2.8rem] border border-[#f0dda7] px-5 py-4 md:px-6 md:py-5 shadow-sm">
        <div className="text-center">
          <div className="text-sm font-bold text-slate-500 mb-1">اللعبة الحالية</div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">
            {game.config?.nameAr || game.titleAr || game.title || game.name}
          </h1>
        </div>
      </section>

      {introVideo && showIntroVideo ? (
        <section className="bg-white rounded-[2.5rem] border border-[#dbe7f3] p-5 md:p-6 shadow-sm space-y-4">
          <div className="text-center">
            <div className="text-sm font-bold text-slate-500 mb-2">شرح اللعبة</div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">شاهد الطريقة أولًا ثم ابدأ</h2>
          </div>

          <video
            controls
            autoPlay
            playsInline
            src={introVideo}
            className="w-full rounded-[2rem] border border-slate-200 bg-slate-950 max-h-[28rem]"
          />

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => setShowIntroVideo(false)}>
              ابدأ اللعب
            </Button>
            <Button variant="outline" onClick={() => navigate('/student/home')}>
              العودة
            </Button>
          </div>
        </section>
      ) : (
        <>
          {introVideo && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setShowIntroVideo(true)}>
                مشاهدة الشرح مرة أخرى
              </Button>
            </div>
          )}

          <GameEngine
            game={game}
            onComplete={handleGameComplete}
            therapistControlsEnabled={therapistSession?.therapistControlsEnabled}
            therapistPromptLevel={therapistSession?.promptLevel || 'none'}
            onUnsupported={() => navigate('/student/home')}
            startLevel={currentLevel}
          />
        </>
      )}
    </div>
  );
};

export default GamePlay;
