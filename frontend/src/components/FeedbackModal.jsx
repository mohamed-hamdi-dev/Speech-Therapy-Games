import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, XCircle } from 'lucide-react';
import Button from './Button';
import { playAudioUrl, playErrorSound, playSuccessSound } from '../utils/soundEffects';

const FeedbackModal = ({ isCorrect, onNext, show, successSound, failSound }) => {
  useEffect(() => {
    if (!show) return;

    if (isCorrect) {
      if (successSound) playAudioUrl(successSound);
      else playSuccessSound();

      // Trigger confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults, particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults, particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }

    if (failSound) playAudioUrl(failSound);
    else playErrorSound();
  }, [show, isCorrect, successSound, failSound]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100 animate-bounce-in border-8 ${isCorrect ? 'border-green-400' : 'border-red-400'}`}>
        {isCorrect ? (
          <>
            <CheckCircle className="w-32 h-32 text-green-400 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-green-500 mb-2">ممتاز!</h2>
            <p className="text-xl text-gray-600 mb-8">إجابة صحيحة يا بطل</p>
            <Button variant="primary" className="w-full" onClick={onNext}>
              التالي
            </Button>
          </>
        ) : (
          <>
            <XCircle className="w-32 h-32 text-red-400 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-red-500 mb-2">حاول تاني!</h2>
            <p className="text-xl text-gray-600 mb-8">تقدر تجاوب صح المرة دي</p>
            <Button variant="secondary" className="w-full bg-red-400 hover:bg-red-500" onClick={onNext}>
              حاول مرة كمان
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
