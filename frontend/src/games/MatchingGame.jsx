import React, { useEffect, useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
import Card from '../components/Card';
import FeedbackModal from '../components/FeedbackModal';
import { playAudioUrl } from '../utils/soundEffects';

const speakArabic = (text) => {
  if (!text || typeof window === 'undefined') {
    return;
  }

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

const MatchingGame = ({
  game,
  config,
  onComplete,
  therapistControlsEnabled = false,
  therapistPromptLevel = 'none',
  previewMode = false,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  const instructionAr = config?.content?.instructionAr || game?.questionTextAr || 'اكتب السؤال هنا';
  const questionAudio = config?.content?.questionAudio || game?.questionAudio || '';
  const heroImage = config?.content?.hero?.image || '';
  const options = useMemo(
    () => (Array.isArray(config?.content?.options) ? config.content.options : []),
    [config]
  );
  const successSound = config?.feedback?.successSound || game?.successSound || '';
  const failSound = config?.feedback?.failSound || game?.failSound || '';
  const isDifferentMode = config?.gameType === 'matching.different';
  const isFindMode = config?.gameType === 'matching.find';
  const gridClassName = isDifferentMode
    ? 'grid-cols-2 max-w-2xl mx-auto'
    : isFindMode
      ? options.length <= 2
        ? 'grid-cols-2 max-w-2xl mx-auto'
        : options.length === 3
          ? 'grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto'
          : options.length <= 4
            ? 'grid-cols-2 md:grid-cols-2 max-w-3xl mx-auto'
            : 'grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto'
    : options.length <= 2
      ? 'grid-cols-2 max-w-3xl mx-auto'
      : 'grid-cols-2 md:grid-cols-2 xl:grid-cols-3';

  useEffect(() => {
    if (questionAudio) {
      playAudioUrl(questionAudio);
    }
  }, [questionAudio]);

  const playInstruction = () => {
    if (questionAudio) {
      playAudioUrl(questionAudio);
      return;
    }

    speakArabic(instructionAr);
  };

  const handleOptionSelect = (option) => {
    setAttempts((current) => current + 1);
    setSelectedOption(option);
    setIsCorrect(Boolean(option.isCorrect));
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);

    if (!isCorrect) {
      setSelectedOption(null);
      return;
    }

    if (previewMode) {
      setSelectedOption(null);
      return;
    }

    const totalAttempts = attempts || 1;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete({
      correctAnswers: 1,
      wrongAnswers: Math.max(totalAttempts - 1, 0),
      attempts: [totalAttempts],
      prompts: [therapistControlsEnabled ? therapistPromptLevel : 'none'],
      timeSpent,
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="w-full p-4 md:p-6 text-center bg-white border-[#dbe7f3] rounded-[1.4rem] md:rounded-[2rem]">
        <button
          type="button"
          onClick={playInstruction}
          onKeyDown={preventKeyboardAudioTrigger}
          onKeyUp={preventKeyboardAudioTrigger}
          className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-105 transition-transform shadow-lg shadow-blue-200"
        >
          <Volume2 size={32} className="text-white" />
        </button>

        <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-relaxed">
          {instructionAr}
        </h2>

        {!isFindMode && (
          <div className={`mt-4 md:mt-6 rounded-[1.4rem] md:rounded-[2rem] bg-white border border-[#dbe7f3] p-3 md:p-4 mx-auto ${isDifferentMode ? 'max-w-xs' : 'max-w-sm'}`}>
          {heroImage ? (
            <img
              src={heroImage}
              alt={game?.titleAr || game?.name || 'Hero'}
              className="w-full h-36 md:h-56 object-contain rounded-[1rem] md:rounded-[1.5rem]"
            />
          ) : (
            <div className="w-full h-36 md:h-56 rounded-[1rem] md:rounded-[1.5rem] bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-black text-center px-4 leading-7">
              الصورة الرئيسية
            </div>
          )}
          </div>
        )}
      </Card>

      <div className={`grid gap-3 md:gap-5 w-full ${gridClassName}`}>
        {options.map((option, index) => (
          <Card
            key={option.id || index}
            onClick={() => handleOptionSelect(option)}
            className={`p-3 md:p-5 cursor-pointer rounded-[1.2rem] md:rounded-[2rem] border-2 md:border-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              selectedOption?.id === option.id ? 'border-blue-300' : 'border-transparent'
            }`}
          >
            {option.image ? (
              <img
                src={option.image}
                alt={option.textAr || `option-${index + 1}`}
                className="w-full h-32 md:h-52 object-contain bg-white rounded-[1rem] md:rounded-[1.5rem] mb-2 md:mb-3 pointer-events-none"
              />
            ) : (
              <div className="w-full h-32 md:h-52 bg-slate-100 rounded-[1rem] md:rounded-[1.5rem] mb-2 md:mb-3 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-black pointer-events-none text-center px-4 leading-7">
                صورة الاختيار
              </div>
            )}

            {!!option.textAr && (
              <h3 className="text-lg md:text-2xl font-black text-center text-slate-900 pointer-events-none">
                {option.textAr}
              </h3>
            )}
          </Card>
        ))}
      </div>

      <FeedbackModal
        show={showFeedback}
        isCorrect={isCorrect}
        onNext={handleNext}
        successSound={successSound}
        failSound={failSound}
      />
    </div>
  );
};

export default MatchingGame;
