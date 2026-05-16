import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

function DraggableSequenceItem({ item, index }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `source-${item.id}`,
    data: { item, sourceIndex: index },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.75 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing bg-white rounded-[1.6rem] border-2 border-blue-100 shadow-md p-2 transition-all hover:shadow-lg hover:-translate-y-1"
    >
      {item.image ? (
        <img
          src={item.image}
          alt={item.labelAr || 'خطوة'}
          className="w-24 h-24 md:w-28 md:h-28 object-contain rounded-xl bg-slate-50"
        />
      ) : (
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs font-black text-center">
          صورة الخطوة
        </div>
      )}
      {item.labelAr && (
        <div className="text-center text-sm font-bold text-slate-700 mt-1 truncate px-1">{item.labelAr}</div>
      )}
    </div>
  );
}

function DroppableSlot({ slotIndex, placedItem }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${slotIndex}` });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col items-center justify-center rounded-[1.6rem] border-2 border-dashed transition-all min-h-[130px] md:min-h-[150px] w-full ${
        isOver
          ? 'border-blue-500 bg-blue-50 scale-105'
          : placedItem
            ? 'border-green-300 bg-green-50'
            : 'border-slate-300 bg-slate-50'
      }`}
    >
      <div className="text-xs font-black text-slate-400 mb-1">{slotIndex + 1}</div>
      {placedItem ? (
        <div className="p-1">
          {placedItem.image ? (
            <img
              src={placedItem.image}
              alt={placedItem.labelAr || 'خطوة'}
              className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-xl"
            />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs font-black text-center">
              صورة
            </div>
          )}
          {placedItem.labelAr && (
            <div className="text-center text-xs font-bold text-slate-700 mt-1 truncate">{placedItem.labelAr}</div>
          )}
        </div>
      ) : (
        <div className="text-3xl text-slate-300">+</div>
      )}
    </div>
  );
}

const SequenceGame = ({
  game,
  config,
  onComplete,
  therapistControlsEnabled = false,
  therapistPromptLevel = 'none',
  previewMode = false,
}) => {
  const [availableItems, setAvailableItems] = useState([]);
  const [placedItems, setPlacedItems] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [startTime] = useState(Date.now());

  const instructionAr =
    config?.content?.instructionAr || game?.questionTextAr || game?.instructionTextAr || game?.instructionText || 'رتب الخطوات';
  const instructionAudio = config?.content?.instructionAudio || game?.questionAudio || game?.instructionAudio || '';
  const steps = useMemo(() => {
    if (Array.isArray(config?.content?.steps)) {
      return config.content.steps;
    }
    if (Array.isArray(game?.items)) {
      return game.items;
    }
    return [];
  }, [config, game]);

  const successSound = config?.feedback?.successSound || game?.successSound || '';
  const failSound = config?.feedback?.failSound || game?.failSound || '';

  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 8 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } });
  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    if (!steps.length) {
      setAvailableItems([]);
      setPlacedItems([]);
      return;
    }

    setCompleted(false);
    setFeedback(null);
    setAttempts(0);
    setPlacedItems(new Array(steps.length).fill(null));
    setAvailableItems([...steps].sort(() => Math.random() - 0.5));

    if (instructionAudio) {
      playAudioUrl(instructionAudio);
    }
  }, [steps, instructionAudio]);

  const resetBoard = useCallback(() => {
    setCompleted(false);
    setFeedback(null);
    setPlacedItems(new Array(steps.length).fill(null));
    setAvailableItems([...steps].sort(() => Math.random() - 0.5));
  }, [steps]);

  const checkCompletion = useCallback(
    (placed) => {
      if (placed.some((item) => item === null)) {
        return;
      }

      setAttempts((current) => current + 1);
      const isCorrectOrder = placed.every((item, index) => Number(item.order) === index + 1);

      if (!isCorrectOrder) {
        setFeedback('error');
        if (failSound) playAudioUrl(failSound);
        else playErrorSound();

        setTimeout(() => {
          resetBoard();
        }, 1800);
        return;
      }

      setCompleted(true);
      setFeedback('success');
      if (successSound) playAudioUrl(successSound);
      else playSuccessSound();

      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.55 },
        colors: ['#2563eb', '#f59e0b', '#10b981', '#ec4899'],
      });

      setTimeout(() => {
        if (previewMode) {
          resetBoard();
          return;
        }

        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        onComplete({
          correctAnswers: 1,
          wrongAnswers: Math.max(attempts, 0),
          attempts: [attempts + 1],
          prompts: [therapistControlsEnabled ? therapistPromptLevel : 'none'],
          timeSpent,
        });
      }, 2200);
    },
    [
      attempts,
      failSound,
      onComplete,
      previewMode,
      resetBoard,
      startTime,
      successSound,
      therapistControlsEnabled,
      therapistPromptLevel,
    ]
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || completed) {
      return;
    }

    const slotMatch = String(over.id).match(/^slot-(\d+)$/);
    if (!slotMatch) {
      return;
    }

    const slotIndex = Number(slotMatch[1]);
    const draggedItem = active.data.current?.item;
    if (!draggedItem || placedItems[slotIndex] !== null) {
      return;
    }

    const nextPlacedItems = [...placedItems];
    nextPlacedItems[slotIndex] = draggedItem;
    setPlacedItems(nextPlacedItems);
    setAvailableItems((current) => current.filter((item) => item.id !== draggedItem.id));

    if (!nextPlacedItems.some((item) => item === null)) {
      checkCompletion(nextPlacedItems);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir="rtl">
      <div className="bg-white rounded-[2rem] p-5 md:p-6 shadow-sm border border-[#dbe7f3] flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center md:text-right flex-grow leading-relaxed">
          {instructionAr}
        </h2>
        <button
          type="button"
          onClick={() => {
            if (instructionAudio) {
              playAudioUrl(instructionAudio);
            }
          }}
          onKeyDown={preventKeyboardAudioTrigger}
          onKeyUp={preventKeyboardAudioTrigger}
          className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
        >
          <Volume2 size={24} className="text-white" />
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="bg-white rounded-[2rem] p-4 md:p-6 border-2 border-[#dbe7f3] shadow-sm">
          <div className="text-sm font-bold text-blue-600 mb-3 text-center">ضع الصور هنا بالترتيب الصحيح</div>
          <div className={`grid gap-3 md:gap-4 ${steps.length <= 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
            {placedItems.map((item, index) => (
              <DroppableSlot key={index} slotIndex={index} placedItem={item} />
            ))}
          </div>
        </div>

        {availableItems.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm p-4 md:p-6 rounded-[2rem] border border-[#dbe7f3]">
            <div className="text-sm font-bold text-slate-500 mb-3 text-center">اسحب الصور من هنا</div>
            <div className="flex flex-wrap justify-center gap-4">
              {availableItems.map((item, index) => (
                <DraggableSequenceItem key={item.id} item={item} index={index} />
              ))}
            </div>
          </div>
        )}
      </DndContext>

      {feedback === 'success' && (
        <div className="fixed inset-0 bg-green-500/20 backdrop-blur-sm z-40 flex items-center justify-center pointer-events-none">
          <div className="text-5xl md:text-7xl font-black text-green-600 bg-white/90 px-10 py-6 rounded-[3rem] shadow-2xl animate-bounce">
            ممتاز!
          </div>
        </div>
      )}

      {feedback === 'error' && (
        <div className="fixed inset-0 bg-red-500/10 backdrop-blur-sm z-40 flex items-center justify-center pointer-events-none">
          <div className="text-4xl md:text-5xl font-black text-red-600 bg-white/90 px-10 py-6 rounded-[3rem] shadow-2xl">
            حاول مرة أخرى
          </div>
        </div>
      )}
    </div>
  );
};

export default SequenceGame;
