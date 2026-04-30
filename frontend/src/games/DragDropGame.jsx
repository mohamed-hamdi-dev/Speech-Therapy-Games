import React, { useEffect, useState } from 'react';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import confetti from 'canvas-confetti';
import { Volume2 } from 'lucide-react';
import Button from '../components/Button';
import { playAudioUrl, playErrorSound, playSuccessSound } from '../utils/soundEffects';

function DraggableItem({ id, image, isCorrect, isDisabled }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { isCorrect },
    disabled: isDisabled,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.82 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative cursor-grab active:cursor-grabbing w-28 h-28 md:w-32 md:h-32 rounded-[1.6rem] overflow-hidden shadow-md border-4 border-white transition-all duration-300 hover:scale-105 ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <img src={image} alt={`Item ${id}`} className="w-full h-full object-cover bg-white" />
    </div>
  );
}

function DroppableTarget({ image, isHovered, children }) {
  const { setNodeRef } = useDroppable({
    id: 'target-zone',
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative w-40 h-40 md:w-52 md:h-52 mx-auto rounded-full p-4 transition-all duration-500 ${
        isHovered ? 'scale-110 shadow-[0_0_40px_rgba(37,99,235,0.24)] bg-[#eef4ff]' : 'bg-[#f7fbff]'
      }`}
    >
      <img
        src={image}
        alt="Target"
        className="w-full h-full object-cover rounded-full border-4 border-white shadow-sm"
      />
      {children}
    </div>
  );
}

export default function DragDropGame({
  game,
  onComplete,
  therapistControlsEnabled = false,
  therapistPromptLevel = 'none',
}) {
  const [feedback, setFeedback] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [items, setItems] = useState([]);
  const [startTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    if (game?.items) {
      setItems([...game.items].sort(() => Math.random() - 0.5));
    }
  }, [game]);

  const playInstruction = () => {
    if (game.instructionAudio) {
      const audio = new Audio(game.instructionAudio);
      audio.play().catch((error) => console.log('Audio error:', error));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(game.instructionText);
    utterance.lang = 'ar-SA';
    window.speechSynthesis.speak(utterance);
  };

  const handleDragOver = ({ over }) => {
    setIsHovered(Boolean(over && over.id === 'target-zone'));
  };

  const handleDragEnd = ({ active, over }) => {
    setIsHovered(false);

    if (!over || over.id !== 'target-zone') return;

    const isCorrect = active.data.current?.isCorrect;
    setAttempts((prev) => prev + 1);

    if (!isCorrect) {
      if (game.failSound) playAudioUrl(game.failSound);
      else playErrorSound();
      setFeedback('error');
      return;
    }

    if (game.successSound) playAudioUrl(game.successSound);
    else playSuccessSound();
    setFeedback('success');
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#60a5fa', '#f59e0b', '#ec4899'],
    });

    setTimeout(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      onComplete({
        correctAnswers: 1,
        wrongAnswers: attempts,
        attempts: [attempts + 1],
        prompts: [therapistControlsEnabled ? therapistPromptLevel : 'none'],
        timeSpent,
      });
    }, 2200);
  };

  if (!game) return null;

  return (
    <div className="max-w-5xl mx-auto py-2">
      <div className="bg-white rounded-[2.4rem] p-5 md:p-6 shadow-sm border border-[#dbe7f3] mb-8 flex flex-col md:flex-row items-center justify-between gap-5">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center md:text-right flex-grow leading-relaxed">
          {game.instructionText}
        </h2>
        <Button
          variant="primary"
          onClick={playInstruction}
          className="rounded-full w-16 h-16 md:w-18 md:h-18 flex items-center justify-center p-0 bg-blue-600 hover:bg-blue-700"
        >
          <Volume2 size={28} />
        </Button>
      </div>

      <DndContext sensors={sensors} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex flex-col items-center gap-10">
          <DroppableTarget image={game.targetImage} isHovered={isHovered}>
            {feedback === 'success' && (
              <div className="absolute inset-0 bg-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-5xl md:text-6xl font-black text-white drop-shadow-md">برافو!</span>
              </div>
            )}
            {feedback === 'error' && (
              <div className="absolute inset-0 bg-red-500/15 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-3xl md:text-4xl font-black text-red-600 bg-white/95 px-6 py-3 rounded-full">
                  حاول مرة أخرى
                </span>
              </div>
            )}
          </DroppableTarget>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-[2.4rem] w-full border border-[#dbe7f3]">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {items.map((item) => (
                <DraggableItem
                  key={item.id}
                  id={item.id}
                  image={item.image}
                  isCorrect={item.isCorrect}
                  isDisabled={feedback === 'success'}
                />
              ))}
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}
