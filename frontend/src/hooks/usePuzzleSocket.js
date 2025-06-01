import { useCallback } from 'react';
import { getSocketInstance } from '../store/socketSlice';

const usePuzzleSocket = () => {
  const socket = getSocketInstance();

  const joinPuzzle = useCallback((gameId) => {
    if (socket) {
      console.log('🧩 Joining puzzle game:', gameId);
      socket.emit('join_puzzle', { gameId });
    }
  }, [socket]);

  const leavePuzzle = useCallback((gameId) => {
    if (socket) {
      console.log('🧩 Leaving puzzle game:', gameId);
      socket.emit('leave_puzzle', { gameId });
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
    joinPuzzle,
    leavePuzzle,
    movePiece,
    requestHint,
    resetPuzzle
  };
};

export default usePuzzleSocket; 