import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { getSocketInstance } from '../../../app/store/socketSlice';

/**
 * Puzzle Game logic hook following Single Responsibility Principle
 * Handles all puzzle game state, socket communication, and interactions
 */
export const usePuzzleGameLogic = () => {
  const { gameId } = useParams();
  const socket = getSocketInstance();
  const navigate = useNavigate();
  
  // Redux state
  const { data: game, loading, error } = useSelector(state => state.game);
  const { pieces, moves, startTime, isCompleted } = useSelector(state => state.game.puzzle);
  const gridPreferences = useSelector(state => state.game.gridPreferences);
  const { isConnected } = useSelector(state => state.socket);
  const { data: roomData } = useSelector(state => state.room);

  // Local state management
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(() => {
    const savedZoom = localStorage.getItem('puzzle-zoom-level');
    return savedZoom ? parseFloat(savedZoom) : 1.2; 
  });
  const [timer, setTimer] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const gridSize = 4;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Computed values
  const displayPieces = useMemo(() => pieces || [], [pieces]);
  
  const gridPieces = useMemo(() => 
    displayPieces.filter(p => p.currentPosition !== null && p.currentPosition !== undefined), 
    [displayPieces]
  );
  
  const bankPieces = useMemo(() => 
    displayPieces.filter(p => p.currentPosition === null || p.currentPosition === undefined), 
    [displayPieces]
  );

  // Calculate cell size based on zoom and screen size
  const cellSize = useMemo(() => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    const availableWidth = viewportWidth * 0.5;
    const availableHeight = viewportHeight * 0.55;
    const availableSpace = Math.min(availableWidth, availableHeight);
    
    const baseSize = availableSpace / 4.8;
    const minSize = 65;
    const maxSize = 120;
    
    let calculatedSize = Math.max(minSize, Math.min(maxSize, baseSize * zoomLevel));
    
    if (gridPreferences.adaptiveSizing && gridPieces.length > 0) {
      const totalGridCells = 16;
      const occupiedCells = gridPieces.length;
      const fillRatio = occupiedCells / totalGridCells;
      
      if (fillRatio < 0.5) {
        const sizeMultiplier = 1 + (0.5 - fillRatio) * 0.3;
        calculatedSize = Math.min(maxSize, calculatedSize * sizeMultiplier);
      }
    }
    
    return calculatedSize;
  }, [zoomLevel, gridPreferences.adaptiveSizing, gridPieces.length]);

  // Timer effect
  useEffect(() => {
    if (startTime && !isCompleted) {
      const interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - new Date(startTime)) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, isCompleted]);

  // Request puzzle state when ready
  useEffect(() => {
    if (game && game.puzzle && gameId && isConnected && socket) {
      console.log('🧩 Requesting puzzle state for game:', gameId);
      socket.emit('get_puzzle_state', { gameId });
    }
  }, [game, gameId, isConnected, socket]);

  // Save zoom level
  useEffect(() => {
    localStorage.setItem('puzzle-zoom-level', zoomLevel.toString());
  }, [zoomLevel]);

  // Game interactions
  const handlePieceClick = useCallback((piece) => {
    if (isCompleted) return;
    
    if (selectedPiece?._id === piece._id) {
      setSelectedPiece(null);
    } else {
      setSelectedPiece(piece);
      setSelectedCell(null);
    }
  }, [selectedPiece, isCompleted]);

  const handleCellClick = useCallback((row, col) => {
    if (isCompleted) return;
    
    if (selectedPiece) {
      const fromPosition = selectedPiece.currentPosition;
      const toPosition = { row, col };
      
      if (fromPosition && fromPosition.row === row && fromPosition.col === col) {
        setSelectedPiece(null);
        return;
      }
      
      // Emit move to server
      if (socket && gameId) {
        socket.emit('move_piece', {
          gameId,
          pieceId: selectedPiece._id,
          fromPosition,
          toPosition
        });
      }
      
      setSelectedPiece(null);
    } else {
      setSelectedCell({ row, col });
    }
  }, [selectedPiece, isCompleted, socket, gameId]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1.2);
  }, []);

  // Game controls
  const handleLeaveGame = useCallback(() => {
    // No need to emit leave_game since leaving happens via LEAVE_ROOM when room is closed
    navigate('/dashboard');
  }, [navigate]);

  // Time formatting utilities
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    game,
    loading,
    error,
    gameId,
    pieces: displayPieces,
    gridPieces,
    bankPieces,
    moves,
    startTime,
    isCompleted,
    isConnected,
    roomData,
    
    // Local state
    selectedPiece,
    selectedCell,
    zoomLevel,
    timer,
    activeId,
    dragOverId,
    showSettings,
    cellSize,
    
    // Setters
    setSelectedPiece,
    setSelectedCell,
    setActiveId,
    setDragOverId,
    setShowSettings,
    
    // Actions
    handlePieceClick,
    handleCellClick,
    handleZoomIn,
    handleZoomOut,
    resetZoom,
    handleLeaveGame,
    
    // Utilities
    formatTime,
    sensors,
    gridSize,
  };
}; 