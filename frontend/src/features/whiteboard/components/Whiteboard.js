import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import WhiteboardToolbar from './WhiteboardToolbar';
import WhiteboardCanvas from './WhiteboardCanvas';
import useWhiteboardSocket from '../hooks/useWhiteboardSocket';
import { setWhiteboardState, addStrokeToWhiteboard, removeStrokeFromWhiteboard, clearWhiteboard } from '../../../app/store/gameSlice';
import CenteredLoader from '../../../shared/components/ui/LoadingSpinner';

const Whiteboard = ({ gameId }) => {
  const theme = useSelector((state) => state.theme.current);
  const { user } = useSelector((state) => state.auth);
  const { isConnected } = useSelector((state) => state.socket);
  const whiteboard = useSelector((state) => state.game.whiteboard);
  const roomData = useSelector((state) => state.room.data);
  const dispatch = useDispatch();
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(() => {
    // Load saved color from localStorage or default to black
    return localStorage.getItem(`whiteboard_color_${user?._id}`) || '#000000';
  });
  const [size, setSize] = useState(() => {
    // Load saved size from localStorage or default to 2
    return parseInt(localStorage.getItem(`whiteboard_size_${user?._id}`)) || 2;
  });
  const [opacity, setOpacity] = useState(() => {
    // Load saved opacity from localStorage or default to 1
    return parseFloat(localStorage.getItem(`whiteboard_opacity_${user?._id}`)) || 1;
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan] = useState({ x: 0, y: 0 });

  // Memoize strokes and canvas size to prevent unnecessary re-renders
  const strokes = useMemo(() => whiteboard.strokes || [], [whiteboard.strokes]);
  const canvasSize = useMemo(() => whiteboard.dimensions || { width: 1920, height: 1080 }, [whiteboard.dimensions]);
  
  // Simple socket callbacks that directly update Redux state
  const onStrokeAdded = useCallback((stroke) => {
    // Ensure timestamp is serializable
    const serializableStroke = {
      ...stroke,
      timestamp: stroke.timestamp instanceof Date ? stroke.timestamp.toISOString() : stroke.timestamp
    };
    dispatch(addStrokeToWhiteboard({ stroke: serializableStroke }));
  }, [dispatch]);

  const onStrokeRemoved = useCallback((strokeId) => {
    dispatch(removeStrokeFromWhiteboard({ strokeId }));
  }, [dispatch]);

  const onWhiteboardCleared = useCallback(() => {
    dispatch(clearWhiteboard());
  }, [dispatch]);

  const onStateSync = useCallback((state) => {
    dispatch(setWhiteboardState({
      gameId,
      strokes: state.strokes || [],
      background: state.background,
      dimensions: state.dimensions,
      collaborators: state.collaborators || [],
      version: state.version
    }));
  }, [dispatch, gameId]);

  // Memoize the callbacks object
  const callbacks = useMemo(() => ({
    onStrokeAdded,
    onStrokeRemoved,
    onWhiteboardCleared,
    onStateSync
  }), [onStrokeAdded, onStrokeRemoved, onWhiteboardCleared, onStateSync]);

  // Initialize whiteboard socket
  const {
    sendDrawStart,
    sendDrawMove,
    sendDrawEnd,
    sendToolChange,
    sendClear,
    sendUndo,
    requestGameState
  } = useWhiteboardSocket(gameId, callbacks);

  // Request initial whiteboard state when connected
  useEffect(() => {
    if (isConnected && gameId && requestGameState) {
      requestGameState();
    }
  }, [isConnected, gameId, requestGameState]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        // Maintain aspect ratio while fitting container
        const aspectRatio = canvasSize.width / canvasSize.height;
        let width = rect.width - 40; // Account for padding
        let height = width / aspectRatio;
        
        if (height > rect.height - 40) {
          height = rect.height - 40;
          width = height * aspectRatio;
        }
        
        if (canvasRef.current) {
          canvasRef.current.style.width = `${width}px`;
          canvasRef.current.style.height = `${height}px`;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasSize]);

  // Generate unique stroke ID
  const generateStrokeId = useCallback(() => {
    return `${user._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, [user._id]);

  // Handle drawing start
  const handleDrawStart = useCallback((point) => {
    if (tool === 'eraser') return; // Handle eraser separately
    
    const strokeId = generateStrokeId();
    const newStroke = {
      id: strokeId,
      userId: user._id,
      tool,
      color,
      size,
      opacity,
      points: [point],
      timestamp: new Date()
    };
    
    setCurrentStroke(newStroke);
    setIsDrawing(true);
    sendDrawStart({ strokeData: newStroke });
  }, [tool, color, size, opacity, user._id, generateStrokeId, sendDrawStart]);

  // Handle drawing move
  const handleDrawMove = useCallback((point) => {
    if (!isDrawing || !currentStroke) return;
    
    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, point]
    };
    
    setCurrentStroke(updatedStroke);
    sendDrawMove({ strokeId: currentStroke.id, point });
  }, [isDrawing, currentStroke, sendDrawMove]);

  // Handle drawing end
  const handleDrawEnd = useCallback(() => {
    if (!isDrawing || !currentStroke) return;
    
    setIsDrawing(false);
    
    // Convert timestamp to string for Redux serialization
    const serializableStroke = {
      ...currentStroke,
      timestamp: currentStroke.timestamp.toISOString()
    };
    
    // Add our own stroke to Redux immediately (since server doesn't send it back to us)
    dispatch(addStrokeToWhiteboard({ stroke: serializableStroke }));
    
    // Send to server for other users
    sendDrawEnd({ strokeData: currentStroke });
    
    // Clear currentStroke since we added it to Redux
    setCurrentStroke(null);
  }, [isDrawing, currentStroke, sendDrawEnd, dispatch]);



  // Handle mouse enter/leave for canvas container
  const handleContainerMouseEnter = useCallback(() => {
    // Cursor will be shown when mouse moves over canvas
  }, []);

  const handleContainerMouseLeave = useCallback(() => {
    // Hide cursor when mouse leaves the entire container
  }, []);

  // Handle tool change
  const handleToolChange = useCallback((newTool, newColor, newSize, newOpacity) => {
    setTool(newTool);
    
    if (newColor !== undefined) {
      setColor(newColor);
      // Save color to localStorage
      localStorage.setItem(`whiteboard_color_${user?._id}`, newColor);
    }
    
    if (newSize !== undefined) {
      setSize(newSize);
      // Save size to localStorage
      localStorage.setItem(`whiteboard_size_${user?._id}`, newSize.toString());
    }
    
    if (newOpacity !== undefined) {
      setOpacity(newOpacity);
      // Save opacity to localStorage
      localStorage.setItem(`whiteboard_opacity_${user?._id}`, newOpacity.toString());
    }
    
    sendToolChange({
      tool: newTool,
      color: newColor || color,
      size: newSize || size,
      opacity: newOpacity || opacity
    });
  }, [color, size, opacity, sendToolChange, user?._id]);

  // Handle clear
  const handleClear = useCallback(() => {
    // Clear our own whiteboard immediately (since server doesn't send it back to us)
    dispatch(clearWhiteboard());
    
    // Send to server for other users
    sendClear({ clearAll: true });
  }, [sendClear, dispatch]);

  // Handle undo
  const handleUndo = useCallback(() => {
    const lastStroke = strokes[strokes.length - 1];
    if (lastStroke && lastStroke.userId === user._id) {
      sendUndo({ strokeId: lastStroke.id });
    }
  }, [strokes, user._id, sendUndo]);

  // Show loading state while connecting (after all hooks)
  if (!isConnected) {
    return <CenteredLoader statusText="Connecting to whiteboard..." />;
  }

  return (
    <div 
      className={`h-full w-full flex flex-col ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Toolbar */}
      <WhiteboardToolbar
        tool={tool}
        color={color}
        size={size}
        opacity={opacity}
        onToolChange={handleToolChange}
        onClear={handleClear}
        onUndo={handleUndo}
        zoom={zoom}
        onZoomChange={setZoom}
        isDarkTheme={theme === 'dark'}
      />
      
      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden p-5"
        onMouseEnter={handleContainerMouseEnter}
        onMouseLeave={handleContainerMouseLeave}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Room info */}
          {roomData && (
            <div className="absolute top-4 left-4 z-20">
              <div className={`px-3 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
              } border shadow-lg`}>
                <h3 className="text-sm font-semibold">{roomData.roomName}</h3>
                <p className="text-xs opacity-70">
                  {roomData.players?.length || 0} player{(roomData.players?.length || 0) !== 1 ? 's' : ''}
                </p>
                {roomData.players && roomData.players.length > 0 && (
                  <div className="flex -space-x-2 mt-2">
                    {roomData.players.slice(0, 3).map((player, index) => (
                      <div
                        key={player._id || index}
                        className={`w-6 h-6 rounded-full border-2 ${
                          theme === 'dark' ? 'border-gray-800' : 'border-white'
                        } bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-xs text-white font-bold`}
                        title={player.name || 'Anonymous'}
                      >
                        {player.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    ))}
                    {roomData.players.length > 3 && (
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        theme === 'dark' ? 'border-gray-800 bg-gray-700' : 'border-white bg-gray-300'
                      } flex items-center justify-center text-xs font-bold`}>
                        +{roomData.players.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Main Canvas */}
          <WhiteboardCanvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            strokes={strokes}
            currentStroke={currentStroke}
            tool={tool}
            color={color}
            size={size}
            opacity={opacity}
            zoom={zoom}
            pan={pan}
            onDrawStart={handleDrawStart}
            onDrawMove={handleDrawMove}
            onDrawEnd={handleDrawEnd}
            isDarkTheme={theme === 'dark'}
          />
        </div>
      </div>
    </div>
  );
};

export default Whiteboard; 