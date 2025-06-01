import { useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { emitSocketEvent } from '../store/socketSlice';

const useWhiteboardSocket = (gameId, callbacks = {}) => {
  const { isConnected } = useSelector((state) => state.socket);
  
  // Use ref to store latest callbacks without triggering re-effects
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Socket event handlers - now handled by main socket event handlers
  useEffect(() => {
    if (!gameId || !isConnected) return;

    console.log(`🎨 Whiteboard socket setup for game: ${gameId}`);
    
    // The actual socket events are now handled by useSocketEventHandlers
    // This hook just needs to set up the callback bridges
    
    // Event handlers using callbacksRef to get latest callbacks
    const handleStrokeAdded = (event) => {
      if (callbacksRef.current.onStrokeAdded) {
        callbacksRef.current.onStrokeAdded(event.detail.stroke);
      }
    };

    const handleStrokeRemoved = (event) => {
      if (callbacksRef.current.onStrokeRemoved) {
        callbacksRef.current.onStrokeRemoved(event.detail.strokeId);
      }
    };

    const handleWhiteboardCleared = (event) => {
      if (callbacksRef.current.onWhiteboardCleared) {
        callbacksRef.current.onWhiteboardCleared(event.detail);
      }
    };

    const handleStateSync = (event) => {
      if (callbacksRef.current.onStateSync) {
        callbacksRef.current.onStateSync(event.detail);
      }
    };

    const handleDrawStart = (event) => {
      if (callbacksRef.current.onDrawStart) {
        callbacksRef.current.onDrawStart(event.detail);
      }
    };

    const handleDrawMove = (event) => {
      if (callbacksRef.current.onDrawMove) {
        callbacksRef.current.onDrawMove(event.detail);
      }
    };

    const handleToolChange = (event) => {
      if (callbacksRef.current.onToolChange) {
        callbacksRef.current.onToolChange(event.detail);
      }
    };

    const handleError = (event) => {
      if (callbacksRef.current.onError) {
        callbacksRef.current.onError(event.detail);
      }
    };

    // Register event listeners for window events dispatched by main socket handler
    window.addEventListener('whiteboardStrokeAdded', handleStrokeAdded);
    window.addEventListener('whiteboardUndo', handleStrokeRemoved);
    window.addEventListener('whiteboardCleared', handleWhiteboardCleared);
    window.addEventListener('whiteboardStateSync', handleStateSync);
    window.addEventListener('whiteboardDrawStart', handleDrawStart);
    window.addEventListener('whiteboardDrawMove', handleDrawMove);
    window.addEventListener('whiteboardToolChange', handleToolChange);
    window.addEventListener('whiteboardError', handleError);

    // Cleanup function
    return () => {
      console.log(`🎨 Cleaning up whiteboard events for game: ${gameId}`);
      
      window.removeEventListener('whiteboardStrokeAdded', handleStrokeAdded);
      window.removeEventListener('whiteboardUndo', handleStrokeRemoved);
      window.removeEventListener('whiteboardCleared', handleWhiteboardCleared);
      window.removeEventListener('whiteboardStateSync', handleStateSync);
      window.removeEventListener('whiteboardDrawStart', handleDrawStart);
      window.removeEventListener('whiteboardDrawMove', handleDrawMove);
      window.removeEventListener('whiteboardToolChange', handleToolChange);
      window.removeEventListener('whiteboardError', handleError);
    };
  }, [gameId, isConnected]);

  // Socket emission functions
  const sendDrawStart = useCallback((data) => {
    emitSocketEvent('whiteboard_draw_start', { gameId, strokeData: data.strokeData });
  }, [gameId]);

  const sendDrawMove = useCallback((data) => {
    emitSocketEvent('whiteboard_draw_move', { gameId, strokeId: data.strokeId, point: data.point });
  }, [gameId]);

  const sendDrawEnd = useCallback((data) => {
    emitSocketEvent('whiteboard_draw_end', { gameId, strokeData: data.strokeData });
  }, [gameId]);

  const sendToolChange = useCallback((data) => {
    emitSocketEvent('whiteboard_tool_change', { gameId, tool: data.tool, color: data.color, size: data.size, opacity: data.opacity });
  }, [gameId]);

  const sendClear = useCallback((data) => {
    emitSocketEvent('whiteboard_clear', { gameId, clearAll: data.clearAll });
  }, [gameId]);

  const sendUndo = useCallback((data) => {
    emitSocketEvent('whiteboard_undo', { gameId, strokeId: data.strokeId });
  }, [gameId]);

  const requestGameState = useCallback(() => {
    emitSocketEvent('join_game', gameId);
  }, [gameId]);

  return {
    sendDrawStart,
    sendDrawMove,
    sendDrawEnd,
    sendToolChange,
    sendClear,
    sendUndo,
    requestGameState
  };
};

export default useWhiteboardSocket; 