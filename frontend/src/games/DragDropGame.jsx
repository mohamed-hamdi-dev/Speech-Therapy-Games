import React, { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import confetti from 'canvas-confetti';
import { Volume2 } from 'lucide-react';
import { playAudioUrl, playErrorSound, playSuccessSound } from '../utils/soundEffects';

const preventKeyboardAudioTrigger = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.stopPropagation();
  }
};

function DraggableCard({ item, disabled, matched }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { draggableId: item.id, isCorrect: Boolean(item.isCorrect) },
    disabled,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 40 : 1,
        opacity: isDragging ? 0.85 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`w-24 md:w-28 shrink-0 rounded-[1.4rem] border-2 bg-white p-2 shadow-sm transition-all ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab active:cursor-grabbing hover:-translate-y-1'
      } ${matched ? 'border-emerald-400 bg-emerald-50' : 'border-[#dbe7f3]'}`}
    >
      {item.image ? (
        <img
          src={item.image}
          alt={item.labelAr || item.id}
          className="w-full h-20 md:h-24 object-contain rounded-xl bg-slate-50"
        />
      ) : (
        <div className="w-full h-20 md:h-24 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs font-black text-center px-2">
          صورة العنصر
        </div>
      )}
      {item.labelAr && <div className="text-center text-xs md:text-sm font-black text-slate-700 mt-2">{item.labelAr}</div>}
    </div>
  );
}

function DraggableTray({ title, items, feedback, matchedDraggableIds }) {
  if (!items.length) return null;

  return (
    <section className="rounded-[1.8rem] border border-[#dbe7f3] bg-white/90 p-4 shadow-sm">
      <div className="text-sm font-black text-slate-500 mb-3">{title}</div>
      <div className="flex flex-wrap justify-center gap-3">
        {items.map((item) => (
          <DraggableCard
            key={item.id}
            item={item}
            disabled={feedback === 'success' || matchedDraggableIds.includes(item.id)}
            matched={matchedDraggableIds.includes(item.id)}
          />
        ))}
      </div>
    </section>
  );
}

function SceneDropZone({ sceneImage, title, isOverScene, feedback }) {
  const { setNodeRef } = useDroppable({ id: 'scene-drop-zone' });

  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-[2.4rem] border p-4 min-h-[320px] shadow-sm transition-all ${
        isOverScene ? 'border-blue-500 bg-blue-50' : 'border-[#dbe7f3] bg-[#f8fbff]'
      }`}
    >
      {sceneImage ? (
        <img
          src={sceneImage}
          alt={title || 'scene'}
          className="w-full h-[290px] md:h-[360px] object-contain rounded-[2rem] bg-white"
        />
      ) : (
        <div className="w-full h-[290px] md:h-[360px] rounded-[2rem] bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-black">
          صورة المشهد
        </div>
      )}

      <div className="absolute top-4 left-4 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
        اسحب العنصر إلى المشهد
      </div>

      {feedback === 'success' && (
        <div className="absolute inset-0 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center pointer-events-none">
          <div className="rounded-full bg-white/95 px-8 py-4 text-3xl font-black text-emerald-600 shadow-xl">
            ممتاز!
          </div>
        </div>
      )}

      {feedback === 'error' && (
        <div className="absolute inset-0 bg-red-500/10 rounded-[2rem] flex items-center justify-center pointer-events-none">
          <div className="rounded-full bg-white/95 px-8 py-4 text-2xl font-black text-red-600 shadow-xl">
            حاول مرة أخرى
          </div>
        </div>
      )}
    </div>
  );
}

const groupedPositions = (items) => ({
  left: items.filter((item) => item.startPosition === 'left'),
  right: items.filter((item) => item.startPosition === 'right'),
  bottom: items.filter((item) => item.startPosition === 'bottom' || !item.startPosition),
});

const DragDropGame = ({
  game,
  config,
  onComplete,
  therapistControlsEnabled = false,
  therapistPromptLevel = 'none',
  previewMode = false,
}) => {
  const [matchedDraggableIds, setMatchedDraggableIds] = useState([]);
  const [isOverScene, setIsOverScene] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  const content = config?.content || {};
  const feedbackConfig = config?.feedback || {};
  const instructionAr = content?.instructionAr || 'اكتب التعليمات هنا';
  const instructionAudio = content?.instructionAudio || '';
  const sceneImage = content?.sceneImage || '';
  const draggables = Array.isArray(content?.draggables) ? content.draggables : [];
  const mode = content?.mode || 'one-to-one';
  const positionGroups = useMemo(() => groupedPositions(draggables), [draggables]);
  const totalNeededMatches = mode === 'multi-match' ? draggables.filter((item) => item.isCorrect).length : 1;

  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 8 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 5 } });
  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    setMatchedDraggableIds([]);
    setIsOverScene(false);
    setFeedback(null);
    setAttempts(0);
  }, [game?.id]);

  useEffect(() => {
    if (instructionAudio) playAudioUrl(instructionAudio);
  }, [instructionAudio]);

  const playInstruction = () => {
    if (instructionAudio) {
      playAudioUrl(instructionAudio);
      return;
    }

    if (typeof window !== 'undefined') {
      const utterance = new SpeechSynthesisUtterance(instructionAr);
      utterance.lang = 'ar-SA';
      window.speechSynthesis.speak(utterance);
    }
  };

  const finishSuccess = (nextAttempts, nextMatchedIds) => {
    if (feedbackConfig?.successSound) playAudioUrl(feedbackConfig.successSound);
    else playSuccessSound();

    setFeedback('success');

    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#138fbc', '#10b981', '#f59e0b', '#ec4899'],
    });

    setTimeout(() => {
      if (previewMode) {
        setMatchedDraggableIds([]);
        setFeedback(null);
        return;
      }

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const wrongAnswers = Math.max(nextAttempts - totalNeededMatches, 0);

      onComplete({
        correctAnswers: nextMatchedIds.length,
        wrongAnswers,
        attempts: [nextAttempts],
        prompts: [therapistControlsEnabled ? therapistPromptLevel : 'none'],
        timeSpent,
      });
    }, 1800);
  };

  const finishError = () => {
    if (feedbackConfig?.failSound) playAudioUrl(feedbackConfig.failSound);
    else playErrorSound();

    setFeedback('error');
    setTimeout(() => setFeedback(null), 900);
  };

  const handleDragOver = ({ over }) => {
    setIsOverScene(Boolean(over && over.id === 'scene-drop-zone'));
  };

  const handleDragEnd = ({ active, over }) => {
    setIsOverScene(false);

    if (!over || over.id !== 'scene-drop-zone') {
      return;
    }

    const draggableId = String(active.id);
    const isCorrect = Boolean(active.data.current?.isCorrect);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (!isCorrect || matchedDraggableIds.includes(draggableId)) {
      finishError();
      return;
    }

    const nextMatchedIds = [...matchedDraggableIds, draggableId];
    setMatchedDraggableIds(nextMatchedIds);

    const isCompleted = mode === 'multi-match' ? nextMatchedIds.length >= totalNeededMatches : true;

    if (isCompleted) {
      finishSuccess(nextAttempts, nextMatchedIds);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
      <section className="bg-white rounded-[2rem] p-5 md:p-6 shadow-sm border border-[#dbe7f3] flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center md:text-right flex-grow leading-relaxed">
          {instructionAr}
        </h2>
        <button
          type="button"
          onClick={playInstruction}
          onKeyDown={preventKeyboardAudioTrigger}
          onKeyUp={preventKeyboardAudioTrigger}
          className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
        >
          <Volume2 size={24} className="text-white" />
        </button>
      </section>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="space-y-5">
          <SceneDropZone
            sceneImage={sceneImage}
            title={game?.titleAr}
            isOverScene={isOverScene}
            feedback={feedback}
          />

          <div className="grid grid-cols-1 gap-4">
            <DraggableTray
              title="عناصر من اليسار"
              items={positionGroups.left}
              feedback={feedback}
              matchedDraggableIds={matchedDraggableIds}
            />
            <DraggableTray
              title="عناصر من اليمين"
              items={positionGroups.right}
              feedback={feedback}
              matchedDraggableIds={matchedDraggableIds}
            />
            <DraggableTray
              title="عناصر من الأسفل"
              items={positionGroups.bottom}
              feedback={feedback}
              matchedDraggableIds={matchedDraggableIds}
            />
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default DragDropGame;
