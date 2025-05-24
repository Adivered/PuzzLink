import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import WhiteboardToolbar from './WhiteboardToolbar';
import WhiteboardCanvas from './WhiteboardCanvas';
import CollaboratorCursors from './CollaboratorCursors';
import useWhiteboardSocket from '../../hooks/useWhiteboardSocket';

const Whiteboard = ({ gameId }) => {
  const theme = useSelector((state) => state.theme.current);
  const { user } = useSelector((state) => state.auth);
  const { isConnected } = useSelector((state) => state.socket);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [strokes, setStrokes] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Memoize callback functions to prevent infinite re-renders
  const onStrokeAdded = useCallback((stroke) => {
    setStrokes(prev => [...prev, stroke]);
  }, []);

  const onStrokeRemoved = useCallback((strokeId) => {
    setStrokes(prev => prev.filter(s => s.id !== strokeId));
  }, []);

  const onWhiteboardCleared = useCallback(() => {
    setStrokes([]);
  }, []);

  const onStateSync = useCallback((state) => {
    setStrokes(state.strokes || []);
    setCollaborators(state.collaborators || []);
    if (state.dimensions) {
      setCanvasSize(state.dimensions);
    }
  }, []);

  const onCollaboratorCursor = useCallback((cursorData) => {
    // Don't update cursor for current user
    if (cursorData.userId === user._id) return;
    
    setCollaborators(prev => {
      const existingIndex = prev.findIndex(c => c.user._id === cursorData.userId);
      
      if (existingIndex >= 0) {
        // Update existing collaborator cursor
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          cursor: { 
            x: cursorData.x, 
            y: cursorData.y, 
            visible: cursorData.visible 
          }
        };
        return updated;
      } else {
        // Add new collaborator if not exists (this case shouldn't normally happen)
        return [...prev, {
          user: { _id: cursorData.userId, name: 'Unknown User' },
          cursor: { 
            x: cursorData.x, 
            y: cursorData.y, 
            visible: cursorData.visible 
          }
        }];
      }
    });
  }, [user._id]);

  // Memoize the callbacks object
  const callbacks = useMemo(() => ({
    onStrokeAdded,
    onStrokeRemoved,
    onWhiteboardCleared,
    onStateSync,
    onCollaboratorCursor
  }), [onStrokeAdded, onStrokeRemoved, onWhiteboardCleared, onStateSync, onCollaboratorCursor]);

  // Initialize whiteboard socket
  const {
    sendDrawStart,
    sendDrawMove,
    sendDrawEnd,
    sendCursorPosition,
    sendToolChange,
    sendClear,
    sendUndo
  } = useWhiteboardSocket(gameId, callbacks);

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
    setStrokes(prev => [...prev, currentStroke]);
    sendDrawEnd({ strokeData: currentStroke });
    setCurrentStroke(null);
  }, [isDrawing, currentStroke, sendDrawEnd]);

  // Handle cursor movement
  const handleCursorMove = useCallback((cursorData) => {
    sendCursorPosition(cursorData);
  }, [sendCursorPosition]);

  // Handle mouse enter/leave for canvas container
  const handleContainerMouseEnter = useCallback(() => {
    // Cursor will be shown when mouse moves over canvas
  }, []);

  const handleContainerMouseLeave = useCallback(() => {
    // Hide cursor when mouse leaves the entire container
    sendCursorPosition({ x: 0, y: 0, visible: false });
  }, [sendCursorPosition]);

  // Handle tool change
  const handleToolChange = useCallback((newTool, newColor, newSize, newOpacity) => {
    setTool(newTool);
    if (newColor !== undefined) setColor(newColor);
    if (newSize !== undefined) setSize(newSize);
    if (newOpacity !== undefined) setOpacity(newOpacity);
    
    sendToolChange({
      tool: newTool,
      color: newColor || color,
      size: newSize || size,
      opacity: newOpacity || opacity
    });
  }, [color, size, opacity, sendToolChange]);

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
    return (
      <div className={`h-full w-full flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Connecting to whiteboard...</p>
        </div>
      </div>
    );
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
          {/* Collaborator Cursors */}
          <CollaboratorCursors 
            collaborators={collaborators}
            currentUserId={user._id}
          />
          
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
            onCursorMove={handleCursorMove}
            isDarkTheme={theme === 'dark'}
          />
        </div>
      </div>
    </div>
  );
};

export default Whiteboard; 