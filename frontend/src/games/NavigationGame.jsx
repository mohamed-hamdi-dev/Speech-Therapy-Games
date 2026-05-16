import React, { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Volume2 } from 'lucide-react';
import {
  playAudioUrl,
  playBoundarySound,
  playErrorSound,
  playMoveSound,
  playSuccessSound,
} from '../utils/soundEffects';

const DEFAULT_CELL_SIZE = 56;
const PREVIEW_CELL_SIZE = 40;

const speakArabic = (text) => {
  if (!text || typeof window === 'undefined') return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  window.speechSynthesis.speak(utterance);
};

const preventKeyboardAudioTrigger = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.stopPropagation();
  }
};

const PlaceholderTile = ({ label, className = '' }) => (
  <div
    className={`w-full h-full rounded-2xl border-2 border-dashed border-slate-300 bg-white/90 flex items-center justify-center text-center text-xs md:text-sm font-black text-slate-400 px-2 ${className}`}
  >
    {label}
  </div>
);

const ControlButton = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-16 h-16 md:w-20 md:h-20 rounded-[1.4rem] bg-blue-600 text-white text-3xl font-black shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
  >
    {label}
  </button>
);

const NavigationGame = ({
  game,
  config,
  onComplete,
  therapistControlsEnabled = false,
  therapistPromptLevel = 'none',
  previewMode = false,
}) => {
  const content = config?.content || {};
  const feedbackConfig = config?.feedback || {};
  const instructionAr = content?.instructionAr || '';
  const instructionAudio = content?.instructionAudio || '';
  const sceneImage = content?.sceneImage || '';
  const movable = content?.movable || {};
  const target = content?.target || {};
  const grid = content?.grid || {};
  const moveSound = config?.feedback?.moveSound || '';
  const boundarySound = config?.feedback?.boundarySound || '';

  const cols = Math.max(Number(grid?.cols || 8), 2);
  const rows = Math.max(Number(grid?.rows || 6), 2);
  const cellSize = previewMode ? PREVIEW_CELL_SIZE : DEFAULT_CELL_SIZE;
  const startX = Math.min(Math.max(Number(movable?.startX ?? 1), 1), cols);
  const startY = Math.min(Math.max(Number(movable?.startY ?? 1), 1), rows);
  const targetX = Math.min(Math.max(Number(target?.x ?? cols), 1), cols);
  const targetY = Math.min(Math.max(Number(target?.y ?? rows), 1), rows);
  const radius = Math.max(Number(target?.radius || 1), 1);

  const [position, setPosition] = useState({ x: startX, y: startY });
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [shake, setShake] = useState(false);
  const [startTime] = useState(Date.now());

  const isIncomplete =
    Number.isNaN(cols) ||
    Number.isNaN(rows) ||
    Number.isNaN(startX) ||
    Number.isNaN(startY) ||
    Number.isNaN(targetX) ||
    Number.isNaN(targetY);

  useEffect(() => {
    setPosition({ x: startX, y: startY });
    setAttempts(0);
    setFeedback(null);
    setShake(false);
  }, [game?.id, startX, startY, targetX, targetY]);

  useEffect(() => {
    if (instructionAudio) {
      playAudioUrl(instructionAudio);
    }
  }, [instructionAudio]);

  const boardStyle = useMemo(
    () => ({
      width: `${cols * cellSize}px`,
      height: `${rows * cellSize}px`,
      backgroundImage: `
        linear-gradient(to right, rgba(148, 163, 184, 0.14) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(148, 163, 184, 0.14) 1px, transparent 1px)
      `,
      backgroundSize: `${cellSize}px ${cellSize}px`,
      backgroundColor: '#fffdf9',
    }),
    [cellSize, cols, rows]
  );

  const movableStyle = useMemo(
    () => ({
      width: `${cellSize - 10}px`,
      height: `${cellSize - 10}px`,
      left: `${(position.x - 1) * cellSize + 5}px`,
      top: `${(position.y - 1) * cellSize + 5}px`,
      transition: 'left 220ms ease, top 220ms ease, transform 220ms ease',
    }),
    [cellSize, position.x, position.y]
  );

  const targetStyle = useMemo(
    () => ({
      width: `${cellSize - 8}px`,
      height: `${cellSize - 8}px`,
      left: `${(targetX - 1) * cellSize + 4}px`,
      top: `${(targetY - 1) * cellSize + 4}px`,
    }),
    [cellSize, targetX, targetY]
  );

  const playInstruction = () => {
    if (instructionAudio) {
      playAudioUrl(instructionAudio);
      return;
    }
    speakArabic(instructionAr || 'حرّك العنصر حتى يصل إلى الهدف');
  };

  const resetGame = () => {
    setPosition({ x: startX, y: startY });
    setAttempts(0);
    setFeedback(null);
    setShake(false);
  };

  const triggerBlockedFeedback = () => {
    if (boundarySound) playAudioUrl(boundarySound);
    else if (feedbackConfig?.failSound) playAudioUrl(feedbackConfig.failSound);
    else {
      playBoundarySound();
      playErrorSound();
    }

    setShake(true);
    setTimeout(() => setShake(false), 260);
  };

  const detectSuccess = (nextX, nextY, nextAttempts) => {
    const distance = Math.abs(nextX - targetX) + Math.abs(nextY - targetY);
    if (distance > radius) {
      return;
    }

    if (feedbackConfig?.successSound) playAudioUrl(feedbackConfig.successSound);
    else playSuccessSound();

    setFeedback('success');
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.65 },
      colors: ['#2563eb', '#10b981', '#f59e0b'],
    });

    setTimeout(() => {
      if (previewMode) {
        resetGame();
        return;
      }

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      onComplete({
        correctAnswers: 1,
        wrongAnswers: Math.max(nextAttempts - 1, 0),
        attempts: [nextAttempts],
        prompts: [therapistControlsEnabled ? therapistPromptLevel : 'none'],
        timeSpent,
      });
    }, 1400);
  };

  const moveBy = (dx, dy) => {
    if (isIncomplete || feedback === 'success') return;

    const nextX = position.x + dx;
    const nextY = position.y + dy;

    if (nextX < 1 || nextX > cols || nextY < 1 || nextY > rows) {
      triggerBlockedFeedback();
      return;
    }

    const nextAttempts = attempts + 1;
    if (moveSound) playAudioUrl(moveSound);
    else playMoveSound();

    setAttempts(nextAttempts);
    setPosition({ x: nextX, y: nextY });
    detectSuccess(nextX, nextY, nextAttempts);
  };

  if (isIncomplete) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-[#eadfbe] p-10 text-center">
        <h2 className="text-3xl font-black text-slate-800 mb-4">اللعبة غير مكتملة</h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir="rtl">
      <section className="bg-white rounded-[2rem] p-5 md:p-6 shadow-sm border border-[#dbe7f3] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-grow text-center md:text-right">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-relaxed">
            {instructionAr || 'حرّك العنصر حتى يصل إلى الهدف'}
          </h2>
          <p className="mt-2 text-sm font-bold text-slate-500">تحرك بحرية داخل الشبكة حتى تصل إلى الهدف.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={playInstruction}
            onKeyDown={preventKeyboardAudioTrigger}
            onKeyUp={preventKeyboardAudioTrigger}
            className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          >
            <Volume2 size={24} className="text-white" />
          </button>
          <button
            type="button"
            onClick={resetGame}
            className="w-14 h-14 bg-white border border-[#dbe7f3] rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RotateCcw size={22} className="text-slate-700" />
          </button>
        </div>
      </section>

      <section className="rounded-[2.4rem] border border-[#dbe7f3] bg-[#f8fbff] p-4 md:p-5 shadow-sm">
        <div className="w-full overflow-x-auto">
          <div className="mx-auto relative overflow-hidden rounded-[2rem] bg-white border border-[#dbe7f3]" style={boardStyle}>
            {sceneImage ? (
              <img
                src={sceneImage}
                alt={game?.titleAr || 'scene'}
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(19,143,188,0.08),_transparent_44%),linear-gradient(180deg,_#fffdf9_0%,_#f8fbfd_100%)]" />
            )}

            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute rounded-full border-4 border-emerald-400/80 bg-emerald-300/20 animate-pulse"
                style={{
                  width: `${cellSize * Math.max(radius, 1)}px`,
                  height: `${cellSize * Math.max(radius, 1)}px`,
                  left: `${(targetX - 1) * cellSize + cellSize / 2 - (cellSize * Math.max(radius, 1)) / 2}px`,
                  top: `${(targetY - 1) * cellSize + cellSize / 2 - (cellSize * Math.max(radius, 1)) / 2}px`,
                }}
              />

              <div className="absolute" style={targetStyle}>
                {target?.image ? (
                  <img src={target.image} alt="target" className="w-full h-full object-contain drop-shadow-md" />
                ) : (
                  <PlaceholderTile label="الهدف" className="text-emerald-600 border-emerald-200 bg-white/95" />
                )}
              </div>
            </div>

            <div className={`absolute ${shake ? 'animate-pulse' : ''}`} style={movableStyle}>
              {movable?.image ? (
                <img src={movable.image} alt="movable" className="w-full h-full object-contain drop-shadow-lg" />
              ) : (
                <PlaceholderTile label="العنصر" className="text-blue-600 border-blue-200 bg-white/95" />
              )}
            </div>

            {feedback === 'success' && (
              <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                <div className="rounded-full bg-white/95 px-8 py-4 text-3xl font-black text-emerald-600 shadow-xl">
                  ممتاز!
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {previewMode && (!sceneImage || !movable?.image || !target?.image) && (
        <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50 px-4 py-3 text-center text-sm font-bold text-sky-700">
          المعاينة تعمل الآن بـ placeholders. يمكنك رفع الصور لاحقًا.
        </div>
      )}

      <section className="bg-white rounded-[2rem] border border-[#dbe7f3] p-5 shadow-sm">
        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto" dir="ltr">
          <div />
          <ControlButton label="↑" onClick={() => moveBy(0, -1)} />
          <div />
          <ControlButton label="←" onClick={() => moveBy(-1, 0)} />
          <ControlButton label="↓" onClick={() => moveBy(0, 1)} />
          <ControlButton label="→" onClick={() => moveBy(1, 0)} />
        </div>
      </section>
    </div>
  );
};

export default NavigationGame;
