import React, { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import renderGameActivity from './renderGameActivity';
import { buildActivityRuntimeGame } from './adapters/buildActivityPreviewGame';

const GameEngine = ({
  game,
  onComplete,
  therapistControlsEnabled = false,
  therapistPromptLevel = 'none',
  onUnsupported,
  startLevel = 1,
}) => {
  const [activityIndex, setActivityIndex] = useState(0);
  const [aggregateStats, setAggregateStats] = useState({
    correctAnswers: 0,
    wrongAnswers: 0,
    attempts: [],
    prompts: [],
    timeSpent: 0,
  });

  const config = game?.config || {};
  const levels = Array.isArray(config?.levels) ? config.levels : [];
  const activeLevel = useMemo(
    () => levels.find((level) => Number(level.levelNumber) === Number(startLevel)) || levels[0] || null,
    [levels, startLevel]
  );
  const activities = Array.isArray(activeLevel?.activities) ? activeLevel.activities : [];
  const currentActivity = activities[activityIndex] || null;

  useEffect(() => {
    setActivityIndex(0);
    setAggregateStats({
      correctAnswers: 0,
      wrongAnswers: 0,
      attempts: [],
      prompts: [],
      timeSpent: 0,
    });
  }, [game?.id, startLevel]);

  if (!game || !config?.version || !activeLevel) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-[#eadfbe] p-10 text-center">
        <h2 className="text-3xl font-black text-slate-800 mb-4">هذه اللعبة غير مكتملة الإعداد</h2>
        <Button variant="primary" onClick={onUnsupported}>
          العودة
        </Button>
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-[#eadfbe] p-10 text-center">
        <h2 className="text-3xl font-black text-slate-800 mb-4">هذا المستوى لا يحتوي أنشطة بعد</h2>
        <Button variant="primary" onClick={onUnsupported}>
          العودة
        </Button>
      </div>
    );
  }

  if (!currentActivity) {
    return null;
  }

  const runtimeGame = buildActivityRuntimeGame({
    nameAr: config?.nameAr || game?.titleAr || game?.name,
    templateType: game?.type,
    activity: currentActivity,
    sharedMedia: config?.media || {},
    gameId: `${game.id}-${activeLevel.levelNumber}-${currentActivity.id}`,
  });

  const handleActivityComplete = (stats) => {
    const nextStats = {
      correctAnswers: aggregateStats.correctAnswers + (stats?.correctAnswers || 0),
      wrongAnswers: aggregateStats.wrongAnswers + (stats?.wrongAnswers || 0),
      attempts: [...aggregateStats.attempts, ...(Array.isArray(stats?.attempts) ? stats.attempts : [])],
      prompts: [...aggregateStats.prompts, ...(Array.isArray(stats?.prompts) ? stats.prompts : [])],
      timeSpent: aggregateStats.timeSpent + (stats?.timeSpent || 0),
    };

    if (activityIndex >= activities.length - 1) {
      onComplete(nextStats);
      return;
    }

    setAggregateStats(nextStats);
    setActivityIndex((current) => current + 1);
  };

  return (
    <div className="space-y-5">
      <section className="bg-white/85 rounded-[2rem] border border-[#dbe7f3] px-5 py-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-slate-500 mb-1">المستوى الحالي</div>
            <div className="text-2xl font-black text-slate-900">Level {activeLevel.levelNumber}</div>
          </div>
          <div className="text-left md:text-right">
            <div className="text-sm font-bold text-slate-500 mb-1">النشاط</div>
            <div className="text-xl font-black text-slate-900">
              {activityIndex + 1} / {activities.length}
            </div>
          </div>
        </div>
      </section>

      {renderGameActivity({
        game: runtimeGame,
        onComplete: handleActivityComplete,
        therapistControlsEnabled,
        therapistPromptLevel,
      })}
    </div>
  );
};

export default GameEngine;
