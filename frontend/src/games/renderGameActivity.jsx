import React from 'react';
import DragDropGame from './DragDropGame';
import MatchingGame from './MatchingGame';
import NavigationGame from './NavigationGame';
import SequenceGame from './SequenceGame';

const renderGameActivity = ({
  game,
  onComplete,
  therapistControlsEnabled = false,
  therapistPromptLevel = 'none',
  previewMode = false,
}) => {
  const sharedProps = {
    game,
    config: game?.config || {},
    onComplete,
    therapistControlsEnabled,
    therapistPromptLevel,
    previewMode,
  };

  if (game?.type === 'matching.similar' || game?.type === 'matching.different' || game?.type === 'matching.find') {
    return <MatchingGame {...sharedProps} />;
  }

  if (game?.type === 'action.drag_to_target') {
    return <DragDropGame {...sharedProps} />;
  }

  if (game?.type === 'navigation.move_to_target') {
    return <NavigationGame {...sharedProps} />;
  }

  if (game?.type === 'sequence.order') {
    return <SequenceGame {...sharedProps} />;
  }

  return null;
};

export default renderGameActivity;
