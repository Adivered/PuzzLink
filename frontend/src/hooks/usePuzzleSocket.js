import { useCallback } from 'react';
import { getSocketInstance } from '../app/store/socketSlice';

const usePuzzleSocket = () => {
  const socket = getSocketInstance();

  const requestPuzzleState = useCallback((gameId) => {
    if (socket) {
      console.log('🧩 Requesting puzzle state:', gameId);
      socket.emit('request_game_state', { gameId });
    }
  }, [socket]);

  const movePiece = useCallback((gameId, pieceId, fromPosition, toPosition, moveType = 'grid') => {
    if (socket) {
      console.log('🧩 Moving piece:', { gameId, pieceId, fromPosition, toPosition, moveType });
      socket.emit('move_piece', {
        gameId,
        pieceId,
        fromPosition,
        toPosition,
        moveType
      });
    }
  }, [socket]);

  const requestHint = useCallback((gameId) => {
    if (socket) {
      console.log('💡 Requesting hint for game:', gameId);
      socket.emit('request_hint', { gameId });
    }
  }, [socket]);

  const resetPuzzle = useCallback((gameId) => {
    if (socket) {
      console.log('🔄 Resetting puzzle:', gameId);
      socket.emit('reset_puzzle', { gameId });
    }
  }, [socket]);

  return {
    requestPuzzleState,
    movePiece,
    requestHint,
    resetPuzzle
  };
};

export default usePuzzleSocket; 