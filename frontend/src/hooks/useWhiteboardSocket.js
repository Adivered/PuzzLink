import { useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socketService';

const useWhiteboardSocket = (gameId, callbacks = {}) => {
  const { user } = useSelector((state) => state.auth);
  const { isConnected } = useSelector((state) => state.socket);
  
  // Use ref to store latest callbacks without triggering re-effects
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Socket event handlers using custom events from WhiteboardSocketHandler
  useEffect(() => {
    if (!gameId || !isConnected) return;

    console.log(`🎨 Joining whiteboard session: ${gameId}`);
    
    // Join the whiteboard session
    socketService.joinWhiteboard(gameId);

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

    const handleCollaboratorCursor = (event) => {
      if (callbacksRef.current.onCollaboratorCursor) {
        callbacksRef.current.onCollaboratorCursor(event.detail);
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

    // Register event listeners
    window.addEventListener('whiteboardStrokeAdded', handleStrokeAdded);
    window.addEventListener('whiteboardUndo', handleStrokeRemoved);
    window.addEventListener('whiteboardCleared', handleWhiteboardCleared);
    window.addEventListener('whiteboardStateSync', handleStateSync);
    window.addEventListener('whiteboardUserCursor', handleCollaboratorCursor);
    window.addEventListener('whiteboardDrawStart', handleDrawStart);
    window.addEventListener('whiteboardDrawMove', handleDrawMove);
    window.addEventListener('whiteboardToolChange', handleToolChange);

    // Cleanup function
    return () => {
      console.log(`🎨 Leaving whiteboard session: ${gameId}`);
      
      window.removeEventListener('whiteboardStrokeAdded', handleStrokeAdded);
      window.removeEventListener('whiteboardUndo', handleStrokeRemoved);
      window.removeEventListener('whiteboardCleared', handleWhiteboardCleared);
      window.removeEventListener('whiteboardStateSync', handleStateSync);
      window.removeEventListener('whiteboardUserCursor', handleCollaboratorCursor);
      window.removeEventListener('whiteboardDrawStart', handleDrawStart);
      window.removeEventListener('whiteboardDrawMove', handleDrawMove);
      window.removeEventListener('whiteboardToolChange', handleToolChange);
      
      // Leave the whiteboard session
      socketService.leaveWhiteboard(gameId);
    };
  }, [gameId, isConnected]); // Removed callbacks from dependency array

  // Socket emission functions using socketService methods
  const sendDrawStart = useCallback((data) => {
    socketService.sendWhiteboardDrawStart(gameId, data.strokeData);
  }, [gameId]);

  const sendDrawMove = useCallback((data) => {
    socketService.sendWhiteboardDrawMove(gameId, data.strokeId, data.point);
  }, [gameId]);

  const sendDrawEnd = useCallback((data) => {
    socketService.sendWhiteboardDrawEnd(gameId, data.strokeData);
  }, [gameId]);

  const sendCursorPosition = useCallback((data) => {
    socketService.sendWhiteboardCursorPosition(gameId, data.x, data.y, data.visible);
  }, [gameId]);

  const sendToolChange = useCallback((data) => {
    socketService.sendWhiteboardToolChange(gameId, data.tool, data.color, data.size, data.opacity);
  }, [gameId]);

  const sendClear = useCallback((data) => {
    socketService.sendWhiteboardClear(gameId, data.clearAll);
  }, [gameId]);

  const sendUndo = useCallback((data) => {
    socketService.sendWhiteboardUndo(gameId, data.strokeId);
  }, [gameId]);

  const requestGameState = useCallback(() => {
    socketService.requestWhiteboardState(gameId);
  }, [gameId]);

  return {
    sendDrawStart,
    sendDrawMove,
    sendDrawEnd,
    sendCursorPosition,
    sendToolChange,
    sendClear,
    sendUndo,
    requestGameState
  };
};

export default useWhiteboardSocket; 