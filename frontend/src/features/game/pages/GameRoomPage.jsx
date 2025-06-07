import React from 'react';
import { useSelector } from 'react-redux';
import { useGameRoomLogic } from '../hooks/useGameRoomLogic';
import PuzzleGameContainer from '../components/PuzzleGameContainer';
import Whiteboard from '../../whiteboard/components/Whiteboard';
import CenteredLoader from '../../../shared/components/ui/LoadingSpinner';

/**
 * Game Room Page component with clean architecture
 * Uses custom hook for logic and focuses on rendering
 */
export const GameRoomPage = () => {
  const theme = useSelector((state) => state.theme.current);
  const { 
    game, 
    gameId, 
    loading, 
    error, 
    loadingState 
  } = useGameRoomLogic();

  // Loading state
  if (loading || !loadingState.isAllDataReady) {
    const progressSteps = [
      loadingState.isGameDataReady,
      loadingState.isRoomDataReady,  
      loadingState.isChatDataReady
    ];
    
    return (
      <CenteredLoader 
        statusText={loadingState.statusText}
        showProgress={true}
        progressSteps={progressSteps}
        progressLabels={['Game', 'Room', 'Chat']}
        theme={theme}
      />
    );
  }

  // Error state - let toast notifications handle errors
  if (error) {
    return null; // Error will be shown via toast
  }

  // No game data
  if (!game) {
    return null; // Error will be shown via toast
  }

  // Render whiteboard for drawable games
  if (game.whiteboard) {
    return (
      <div className={`h-[calc(100vh-4rem)] w-full mt-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Whiteboard gameId={gameId} />
      </div>
    );
  }

  // Render puzzle game
  if (game.puzzle) {
    return <PuzzleGameContainer />;
  }

  // Invalid game type
  return (
    <div className={`h-[calc(100vh-4rem)] w-full mt-16 flex items-center justify-center ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <p className="text-xl">Invalid game type</p>
    </div>
  );
}; 