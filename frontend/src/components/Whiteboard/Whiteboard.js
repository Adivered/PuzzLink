import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import WhiteboardToolbar from './WhiteboardToolbar';
import WhiteboardCanvas from './WhiteboardCanvas';
import useWhiteboardSocket from '../../hooks/useWhiteboardSocket';
import { setWhiteboardState } from '../../store/gameSlice';
import CenteredLoader from '../common/LoadingSpinner';

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
  
  // Memoize callback functions to prevent infinite re-renders
  const onStrokeAdded = useCallback((stroke) => {
    // This will be handled by Redux via socket events
    console.log('Stroke added via socket:', stroke);
  }, []);

  const onStrokeRemoved = useCallback((strokeId) => {
    // This will be handled by Redux via socket events
    console.log('Stroke removed via socket:', strokeId);
  }, []);

  const onWhiteboardCleared = useCallback(() => {
    // This will be handled by Redux via socket events
    console.log('Whiteboard cleared via socket');
  }, []);

  const onStateSync = useCallback((state) => {
    // Update Redux state when receiving state sync
    dispatch(setWhiteboardState({
      gameId,
      strokes: state.strokes || [],
      background: state.background,
      dimensions: state.dimensions,
      collaborators: state.collaborators || [],
      version: state.version
    }));
  }, [dispatch, gameId]);

  // Handle real-time drawing events from other users
  const onDrawStart = useCallback((data) => {
    // Don't process our own drawing events
    if (data.strokeData?.userId === user._id) return;
    
    console.log('👥 Other user started drawing:', data);
    // You could show a visual indicator that someone else is drawing
  }, [user._id]);

  const onDrawMove = useCallback((data) => {
    // Don't process our own drawing events
    if (data.userId === user._id) return;
    
    console.log('👥 Other user drawing move:', data);
    // Here you could update a temporary stroke for real-time preview
    // For now, we'll wait for the completed stroke
  }, [user._id]);

  const onToolChange = useCallback((data) => {
    // Don't process our own tool changes
    if (data.userId === user._id) return;
    
    console.log('👥 Other user changed tool:', data);
    // You could show what tool other users are using
  }, [user._id]);

  // Handle whiteboard errors
  const onError = useCallback((data) => {
    console.error('Whiteboard error:', data);
    
    if (data.strokeId && currentStroke && currentStroke.id === data.strokeId) {
      console.log('❌ Stroke save failed, clearing current stroke');
      
      setCurrentStroke(null);
    }
  }, [currentStroke]);

  // Memoize the callbacks object
  const callbacks = useMemo(() => ({
    onStrokeAdded,
    onStrokeRemoved,
    onWhiteboardCleared,
    onStateSync,
    onDrawStart,
    onDrawMove,
    onToolChange,
    onError
  }), [onStrokeAdded, onStrokeRemoved, onWhiteboardCleared, onStateSync, onDrawStart, onDrawMove, onToolChange, onError]);

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
    // Join whiteboard as soon as we have connection and gameId
    // The backend will handle authorization checks
    if (isConnected && gameId && requestGameState) {
      console.log('🎨 Requesting whiteboard state for game:', gameId);
      requestGameState();
      
      // Also request state again after a short delay to ensure we get the latest state
      const retryTimeout = setTimeout(() => {
        console.log('🎨 Retrying whiteboard state request for game:', gameId);
        requestGameState();
      }, 1000);
      
      return () => clearTimeout(retryTimeout);
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
    
    console.log('🖌️ Drawing ended, sending stroke:', {
      strokeId: currentStroke.id,
      pointCount: currentStroke.points.length,
      tool: currentStroke.tool,
      color: currentStroke.color
    });
    
    setIsDrawing(false);
    sendDrawEnd({ strokeData: currentStroke });
    
    // Don't clear currentStroke immediately - wait for the stroke to be added to Redux
  }, [isDrawing, currentStroke, sendDrawEnd]);

  // Clear currentStroke when a new stroke is added to Redux that matches our current stroke
  useEffect(() => {
    if (currentStroke && strokes.length > 0) {
      const matchingStroke = strokes.find(s => s.id === currentStroke.id);
      if (matchingStroke) {
        console.log('✅ Current stroke found in Redux store, clearing local currentStroke');
        setCurrentStroke(null);
      }
    }
  }, [currentStroke, strokes]);

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
    sendClear({ clearAll: true });
  }, [sendClear]);

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