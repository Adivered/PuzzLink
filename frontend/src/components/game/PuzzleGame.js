import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { ZoomIn, ZoomOut, RotateCcw, Users, Clock, Trophy, Settings, LogOut } from 'lucide-react';
import PuzzlePiece from './PuzzlePiece';
import DraggablePuzzlePiece from './DraggablePuzzlePiece';
import DroppableCell from './DroppableCell';
import { getSocketInstance } from '../../store/socketSlice';
import CenteredLoader from '../common/LoadingSpinner';

const PuzzleGame = () => {
  const { gameId } = useParams();
  const socket = getSocketInstance();
  const navigate = useNavigate();
  
  // Redux state
  const { data: game, loading, error } = useSelector(state => state.game);
  const { pieces, moves, startTime, isCompleted } = useSelector(state => state.game.puzzle);
  const gridPreferences = useSelector(state => state.game.gridPreferences);
  const { isConnected } = useSelector(state => state.socket);
  const { data: roomData } = useSelector(state => state.room);
  const theme = useSelector(state => state.theme?.current || 'light');
  
  // Local state
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(() => {
    // Load zoom from localStorage with bigger default
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

  // Use pieces directly from Redux
  const displayPieces = useMemo(() => {
    return pieces || [];
  }, [pieces]);

  // Separate pieces into grid and bank using display pieces
  const gridPieces = useMemo(() => 
    displayPieces.filter(p => p.currentPosition !== null && p.currentPosition !== undefined), 
    [displayPieces]
  );
  
  const bankPieces = useMemo(() => 
    displayPieces.filter(p => p.currentPosition === null || p.currentPosition === undefined), 
    [displayPieces]
  );

  // Calculate cell size based on zoom and screen size with adaptive sizing
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

  // Calculate bank piece size with adaptive sizing
  const bankPieceSize = useMemo(() => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const pieceCount = bankPieces.length;
    
    let bankContainerWidth;
    if (pieceCount <= 4) {
      bankContainerWidth = viewportWidth > 1280 ? 640 : viewportWidth > 1024 ? 576 : 384;
    } else if (pieceCount <= 8) {
      bankContainerWidth = viewportWidth > 1280 ? 576 : viewportWidth > 1024 ? 512 : 384;
    } else if (pieceCount <= 12) {
      bankContainerWidth = viewportWidth > 1280 ? 512 : viewportWidth > 1024 ? 448 : 384;
    } else {
      bankContainerWidth = viewportWidth > 1280 ? 448 : viewportWidth > 1024 ? 384 : 320;
    }
    
    const availableWidth = bankContainerWidth * 0.75;
    
    let columnsCount;
    if (pieceCount <= 1) {
      columnsCount = 1;
    } else if (pieceCount <= 4) {
      columnsCount = 2;
    } else if (pieceCount <= 9) {
      columnsCount = 3;
    } else {
      columnsCount = viewportWidth > 1280 ? 4 : 3;
    }
    
    const gapSpace = (columnsCount - 1) * (viewportWidth > 1024 ? 24 : 16);
    const maxPieceWidth = (availableWidth - gapSpace) / columnsCount;
    
    const baseSize = Math.min(120, maxPieceWidth);
    
    if (gridPreferences.adaptiveSizing && bankPieces.length > 0) {
      if (bankPieces.length <= 1) {
        return Math.min(160, baseSize * 1.4);
      } else if (bankPieces.length <= 4) {
        return Math.min(140, baseSize * 1.2);
      } else if (bankPieces.length <= 8) {
        return Math.min(130, baseSize * 1.1);
      }
    }
    
    return Math.max(80, baseSize);
  }, [bankPieces.length, gridPreferences.adaptiveSizing]);

  // Timer effect
  useEffect(() => {
    if (startTime && !isCompleted) {
      const interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - new Date(startTime)) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, isCompleted]);

  // Request puzzle state when game data is available and connected
  useEffect(() => {
    if (game && game.puzzle && gameId && isConnected && socket) {
      console.log('🧩 Requesting puzzle state for game:', gameId);
      socket.emit('get_puzzle_state', { gameId });
    }
  }, [game, gameId, isConnected, socket]);
  
  // Calculate adaptive bank width based on pieces remaining
  const bankWidth = useMemo(() => {
    const pieceCount = bankPieces.length;
    
    if (pieceCount <= 4) {
      return "w-full lg:w-[36rem] xl:w-[40rem]";
    } else if (pieceCount <= 8) {
      return "w-full lg:w-[32rem] xl:w-[36rem]";
    } else if (pieceCount <= 12) {
      return "w-full lg:w-[28rem] xl:w-[32rem]";
    } else {
      return "w-full lg:w-96 xl:w-[28rem]";
    }
  }, [bankPieces.length]);

  // Save zoom level to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('puzzle-zoom-level', zoomLevel.toString());
  }, [zoomLevel]);

  // Handle piece selection
  const handlePieceClick = useCallback((piece) => {
    if (isCompleted) return;
    
    if (selectedPiece?._id === piece._id) {
      setSelectedPiece(null);
    } else {
      setSelectedPiece(piece);
      setSelectedCell(null);
    }
  }, [selectedPiece, isCompleted]);

  // Handle cell selection - simplified without optimistic updates
  const handleCellClick = useCallback((row, col) => {
    if (isCompleted) return;
    
    if (selectedPiece) {
      // Move selected piece to this cell
      const fromPosition = selectedPiece.currentPosition;
      const toPosition = { row, col };
      
      // Check if it's actually a different position
      if (fromPosition && fromPosition.row === row && fromPosition.col === col) {
        setSelectedPiece(null);
        setSelectedCell(null);
        return;
      }
      
      // Just emit to server - no optimistic updates
      socket.emit('move_piece', { 
        gameId, 
        pieceId: selectedPiece._id, 
        fromPosition, 
        toPosition, 
        moveType: 'grid' 
      });
      setSelectedPiece(null);
      setSelectedCell(null);
    } else {
      setSelectedCell({ row, col });
    }
  }, [selectedPiece, gameId, socket, isCompleted]);

  // Drag and drop handlers
  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
    // Clear any selected states during drag
    setSelectedPiece(null);
    setSelectedCell(null);
  }, []);

  const handleDragOver = useCallback((event) => {
    setDragOverId(event.over?.id || null);
  }, []);

  // Handle drag end - simplified without optimistic updates  
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    setActiveId(null);
    setDragOverId(null);

    if (!over || !active) return;

    const draggedPieceId = active.id;
    const targetId = over.id;

    // Find the piece being dragged
    const piece = displayPieces.find(p => p._id === draggedPieceId);
    if (!piece) return;

    // Only move if the target is different from current position
    if (targetId.startsWith('cell-')) {
      // Moving to grid cell
      const [, row, col] = targetId.split('-').map(Number);
      const fromPosition = piece.currentPosition;
      const toPosition = { row, col };
      
      // Check if it's actually a different position
      if (!fromPosition || fromPosition.row !== row || fromPosition.col !== col) {
        // Just emit to server - no optimistic updates
        socket.emit('move_piece', { 
          gameId, 
          pieceId: draggedPieceId, 
          fromPosition, 
          toPosition, 
          moveType: 'grid' 
        });
      }
    } else if (targetId === 'piece-bank') {
      // Moving back to bank
      if (piece.currentPosition !== null) {
        // Just emit to server - no optimistic updates
        socket.emit('move_piece', { 
          gameId, 
          pieceId: draggedPieceId, 
          fromPosition: piece.currentPosition, 
          toPosition: null, 
          moveType: 'bank' 
        });
      }
    }
  }, [displayPieces, gameId, socket]);

  // Handle puzzle reset
  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the puzzle? This will move all pieces back to the bank.')) {
      socket.emit('reset_puzzle', { gameId });
      setSelectedPiece(null);
      setSelectedCell(null);
    }
  }, [gameId, socket]);

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get piece at specific grid position using display pieces
  const getPieceAtPosition = useCallback((row, col) => {
    return displayPieces.find(p => 
      p.currentPosition && 
      p.currentPosition.row === row && 
      p.currentPosition.col === col
    );
  }, [displayPieces]);

  // Handle leave room
  const handleLeaveRoom = useCallback(() => {
    if (window.confirm('Are you sure you want to leave the room? This will end the game.')) {
      socket.emit('leave_room', { gameId });
      navigate('/');
    }
  }, [gameId, socket, navigate]);

  // Time limit monitoring
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  // Calculate time remaining based on room time limit
  useEffect(() => {
    if (roomData?.timeLimit && startTime && !isCompleted) {
      const timeLimitMs = roomData.timeLimit * 60 * 1000; // Convert to milliseconds
      const startTimeMs = new Date(startTime).getTime();
      
      const interval = setInterval(() => {
        const elapsedMs = Date.now() - startTimeMs;
        const remainingMs = timeLimitMs - elapsedMs;
        
        if (remainingMs <= 0) {
          // Time's up! Emit time expired event
          socket.emit('game_time_expired', { gameId, roomId: roomData._id });
          setTimeRemaining(0);
          clearInterval(interval);
        } else {
          setTimeRemaining(Math.floor(remainingMs / 1000));
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [roomData?.timeLimit, startTime, isCompleted, gameId, roomData?._id, socket]);
  
  // Format time remaining display
  const formatTimeRemaining = (seconds) => {
    if (seconds === null) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Debug logging for game loading state
  useEffect(() => {
    console.log('🎮 Game state debug:', {
      gameId,
      hasGame: !!game,
      hasPuzzle: !!game?.puzzle,
      loading,
      error,
      piecesCount: pieces?.length || 0,
      isConnected
    });
  }, [gameId, game, loading, error, pieces, isConnected]);

  if (loading) {
    return <CenteredLoader statusText="Loading puzzle..." />;
  }

  if (error || !game?.puzzle) {
    return null; // Error will be shown via toast
  }

  return (
    <div className={`min-h-screen w-full flex flex-col ${
      theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Header */}
      <div className={`h-14 flex-shrink-0 px-3 py-2 border-b ${
        theme === 'dark' ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700' : 'bg-white/90 backdrop-blur-sm border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 h-full">
          {/* Game Info */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Clock size={14} className="text-blue-500" />
              <span className="font-medium">{formatTime(timer)}</span>
            </div>
            {timeRemaining !== null && (
              <div className={`flex items-center space-x-1 ${timeRemaining <= 300 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}>
                <Clock size={14} />
                <span className="font-medium">{formatTimeRemaining(timeRemaining)} left</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Users size={14} className="text-green-500" />
              <span className="font-medium">{roomData?.players?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy size={14} className="text-orange-500" />
              <span className="font-medium">{moves}</span>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex gap-1">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
              className="bg-blue-500 text-white p-1.5 rounded-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105 shadow-md"
              title="Zoom In"
            >
              <ZoomIn size={12} />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
              className="bg-blue-500 text-white p-1.5 rounded-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105 shadow-md"
              title="Zoom Out"
            >
              <ZoomOut size={12} />
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 shadow-md ${
                showSettings 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
              title="Settings"
            >
              <Settings size={12} />
            </button>
            
            <button
              onClick={handleReset}
              disabled={isCompleted}
              className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              title="Reset Puzzle"
            >
              <RotateCcw size={12} />
            </button>
            
            <button
              onClick={handleLeaveRoom}
              className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              title="Leave Room"
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`border-b ${
          theme === 'dark' ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700' : 'bg-white/90 backdrop-blur-sm border-gray-200'
        } p-3 transition-all duration-300`}>
          <div className="max-w-4xl mx-auto">
            <h3 className={`text-base font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Puzzle Information
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Grid Size Info */}
              <div className={`p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="text-center">
                  <div className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    4×4
                  </div>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Grid Size
                  </p>
                </div>
              </div>

              {/* Total Pieces */}
              <div className={`p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="text-center">
                  <div className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {displayPieces.length}
                  </div>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Total Pieces
                  </p>
                </div>
              </div>

              {/* Grid Pieces */}
              <div className={`p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="text-center">
                  <div className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    {gridPieces.length}
                  </div>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Placed
                  </p>
                </div>
              </div>

              {/* Bank Pieces */}
              <div className={`p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="text-center">
                  <div className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                  }`}>
                    {bankPieces.length}
                  </div>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    In Bank
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={`flex-1 flex flex-col lg:flex-row ${
          showSettings ? 'min-h-[calc(100vh-14rem)]' : 'min-h-[calc(100vh-3.5rem)]'
        }`}>
          {/* Puzzle Grid Container */}
          <div className="flex-1 flex items-center justify-center p-1 lg:p-2 overflow-hidden">
            <div className="relative max-w-full max-h-full">
              <div 
                className={`inline-block p-1 rounded-lg border-2 shadow-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-900/10 border-gray-600' 
                    : 'bg-white/10 border-gray-400'
                }`}
                style={{
                  transform: `scale(${Math.min(zoomLevel, 2)})`, // Limit zoom to prevent overflow
                  transformOrigin: 'center'
                }}
              >
                <div
                  className="grid gap-0 relative"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
                  }}
                >
                  {Array.from({ length: gridSize * gridSize }, (_, index) => {
                    const row = Math.floor(index / gridSize);
                    const col = index % gridSize;
                    const piece = getPieceAtPosition(row, col);
                    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                    const cellId = `cell-${row}-${col}`;
                    
                    return (
                      <DroppableCell
                        key={cellId}
                        id={cellId}
                        row={row}
                        col={col}
                        cellSize={cellSize}
                        isSelected={isSelected}
                        isOver={dragOverId === cellId}
                        onClick={() => handleCellClick(row, col)}
                        theme={theme}
                      >
                        {piece && (
                          <DraggablePuzzlePiece
                            id={piece._id}
                            imageUrl={game.puzzle.originalImage.url}
                            pieceData={piece.imageData}
                            isInBank={false}
                            cellSize={cellSize}
                            onClick={() => handlePieceClick(piece)}
                            isSelected={selectedPiece?._id === piece._id}
                            isCorrectlyPlaced={piece.isCorrectlyPlaced}
                            isDragging={activeId === piece._id}
                            totalPieces={displayPieces.length}
                          />
                        )}
                      </DroppableCell>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Piece Bank Container - Enhanced Layout */}
          <div className={`${bankWidth} flex flex-col min-h-0 border-t-2 lg:border-t-0 lg:border-l-2 border-gray-400 dark:border-gray-600`}>
            <DroppableCell
              id="piece-bank"
              row={-1}
              col={-1}
              cellSize="auto"
              theme={theme}
            >
              <div 
                className={`w-full h-full ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm' 
                    : 'bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-sm'
                } p-3 lg:p-4 flex flex-col shadow-inner`}
              >
                {/* Enhanced Header - Removed Icon */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className={`text-base lg:text-lg font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Piece Bank
                      </h3>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Drag pieces to the grid
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-bold shadow-md ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 border border-gray-500' 
                      : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
                  }`}>
                    {bankPieces.length} pieces
                  </div>
                </div>
                
                {/* Piece Grid - Enhanced Spacing */}
                <SortableContext 
                  items={bankPieces.map(p => p._id)} 
                  strategy={rectSortingStrategy}
                >
                  <div className="flex-1 overflow-hidden min-h-0">
                    {bankPieces.length > 0 ? (
                      <div 
                        className={`grid gap-3 lg:gap-4 h-full overflow-y-auto px-1 py-2 ${
                          theme === 'dark' 
                            ? 'scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800' 
                            : 'scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200'
                        }`}
                        style={{
                          gridTemplateColumns: (() => {
                            const pieceCount = bankPieces.length;
                            const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
                            
                            let columnsCount;
                            if (pieceCount <= 1) {
                              columnsCount = 1;
                            } else if (pieceCount <= 4) {
                              columnsCount = 2;
                            } else if (pieceCount <= 9) {
                              columnsCount = 3;
                            } else {
                              columnsCount = viewportWidth > 1280 ? 4 : 3;
                            }
                            
                            return `repeat(${columnsCount}, 1fr)`;
                          })(),
                          gridAutoRows: `${bankPieceSize + 8}px`, // Add more padding around pieces
                          paddingBottom: '1rem'
                        }}
                      >
                        {bankPieces.map((piece) => (
                          <div
                            key={piece._id}
                            className={`relative rounded-md overflow-hidden transition-transform duration-200 group flex items-center justify-center ${
                              selectedPiece?._id === piece._id 
                                ? 'ring-1 ring-blue-400 ring-opacity-60 scale-105 shadow-lg shadow-blue-500/20' 
                                : 'hover:scale-105 hover:shadow-md shadow-xs'
                            } ${
                              theme === 'dark' 
                                ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
                                : 'bg-gradient-to-br from-white to-gray-50'
                            }`}
                            style={{ 
                              aspectRatio: '1',
                              maxWidth: `${bankPieceSize}px`,
                              maxHeight: `${bankPieceSize}px`,
                              width: '100%',
                              height: 'auto'
                            }}
                          >
                            <DraggablePuzzlePiece
                              id={piece._id}
                              imageUrl={game.puzzle.originalImage.url}
                              pieceData={piece.imageData}
                              isInBank={true}
                              cellSize={bankPieceSize - 4} // Slightly smaller to ensure it fits with padding
                              onClick={() => handlePieceClick(piece)}
                              isSelected={selectedPiece?._id === piece._id}
                              isDragging={activeId === piece._id}
                              totalPieces={displayPieces.length}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center p-8">
                          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-blue-100'
                          }`}>
                            <Trophy size={40} className="text-green-500" />
                          </div>
                          <p className={`text-xl font-bold mb-2 ${
                            theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          }`}>
                            All pieces placed!
                          </p>
                          <p className={`text-base ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Excellent work! 🎉
                          </p>
                          <div className="mt-4 text-4xl animate-bounce">🏆</div>
                        </div>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            </DroppableCell>
          </div>
        </div>

        {/* Drag Overlay - Fixed z-index */}
        <DragOverlay style={{ zIndex: 9999 }}>
          {activeId ? (
            <div className="opacity-90 transform rotate-2 scale-110 shadow-2xl">
              {(() => {
                const piece = displayPieces.find(p => p._id === activeId);
                return piece ? (
                  <PuzzlePiece
                    id={piece._id}
                    imageUrl={game.puzzle.originalImage.url}
                    pieceData={piece.imageData}
                    isInBank={piece.currentPosition === null}
                    cellSize={cellSize * 0.9}
                    isSelected={false}
                    isCorrectlyPlaced={piece.isCorrectlyPlaced}
                    totalPieces={displayPieces.length}
                  />
                ) : null;
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[10000] backdrop-blur-sm">
          <div className={`p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 ${
            theme === 'dark' ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'
          }`}>
            <div className="text-center">
              <div className="relative mb-4">
                <Trophy size={60} className="text-yellow-500 mx-auto animate-bounce" />
                <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-20 animate-ping"></div>
              </div>
              <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Puzzle Completed!
              </h2>
              <div className="space-y-2 mb-6">
                <p className="text-lg">⏰ {formatTime(timer)}</p>
                <p className="text-lg">🎯 {moves} moves</p>
                <p className="text-base text-green-500">🎉 Congratulations!</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg font-semibold"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(PuzzleGame); 