import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

const WhiteboardCanvas = forwardRef(({
  width,
  height,
  strokes,
  currentStroke,
  tool,
  color,
  size,
  opacity,
  zoom,
  pan,
  onDrawStart,
  onDrawMove,
  onDrawEnd,
  onCursorMove,
  isDarkTheme
}, ref) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);

  // Expose canvas ref to parent
  useImperativeHandle(ref, () => canvasRef.current);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.imageSmoothingEnabled = true;
    contextRef.current = context;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;
  }, [width, height]);

  // Clear and redraw all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    context.fillStyle = isDarkTheme ? '#1f2937' : '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all completed strokes
    strokes.forEach(stroke => {
      drawStroke(context, stroke);
    });

    // Draw current stroke if exists
    if (currentStroke) {
      drawStroke(context, currentStroke);
    }
  }, [strokes, currentStroke, isDarkTheme]);

  // Draw a single stroke
  const drawStroke = useCallback((context, stroke) => {
    if (!stroke.points || stroke.points.length === 0) return;

    context.save();
    
    // Set stroke properties
    context.globalAlpha = stroke.opacity || 1;
    context.strokeStyle = stroke.color || '#000000';
    context.lineWidth = stroke.size || 2;
    
    // Handle different tools
    switch (stroke.tool) {
      case 'highlighter':
        context.globalCompositeOperation = 'multiply';
        context.globalAlpha = 0.3;
        break;
      case 'eraser':
        context.globalCompositeOperation = 'destination-out';
        break;
      default:
        context.globalCompositeOperation = 'source-over';
    }

    // Draw the stroke
    context.beginPath();
    
    if (stroke.points.length === 1) {
      // Single point - draw a dot
      const point = stroke.points[0];
      context.arc(point.x, point.y, (stroke.size || 2) / 2, 0, 2 * Math.PI);
      context.fill();
    } else {
      // Multiple points - draw a path
      context.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        context.lineTo(point.x, point.y);
      }
      
      context.stroke();
    }
    
    context.restore();
  }, []);

  // Redraw when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Get point coordinates from event
  const getPointFromEvent = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      pressure: e.pressure || 1
    };
  }, []);

  // Mouse/Touch event handlers
  const handleStart = useCallback((e) => {
    e.preventDefault();
    const point = getPointFromEvent(e);
    if (!point) return;

    isDrawingRef.current = true;
    lastPointRef.current = point;
    onDrawStart(point);
  }, [getPointFromEvent, onDrawStart]);

  const handleMove = useCallback((e) => {
    e.preventDefault();
    const point = getPointFromEvent(e);
    if (!point) return;

    // Always send cursor position for collaboration
    onCursorMove({ x: point.x, y: point.y, visible: true });

    if (isDrawingRef.current) {
      onDrawMove(point);
      lastPointRef.current = point;
    }
  }, [getPointFromEvent, onDrawMove, onCursorMove]);

  const handleEnd = useCallback((e) => {
    e.preventDefault();
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPointRef.current = null;
      onDrawEnd();
    }
  }, [onDrawEnd]);

  // Handle mouse leave
  const handleLeave = useCallback((e) => {
    if (isDrawingRef.current) {
      handleEnd(e);
    }
    // Hide cursor when mouse leaves canvas
    onCursorMove({ x: 0, y: 0, visible: false });
  }, [handleEnd, onCursorMove]);

  // Handle mouse enter
  const handleEnter = useCallback((e) => {
    const point = getPointFromEvent(e);
    if (point) {
      // Show cursor when mouse enters canvas
      onCursorMove({ x: point.x, y: point.y, visible: true });
    }
  }, [getPointFromEvent, onCursorMove]);

  // Prevent context menu on right click
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`border-2 rounded-lg cursor-crosshair ${
          isDarkTheme ? 'border-gray-600' : 'border-gray-300'
        }`}
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: 'center center'
        }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleLeave}
        onMouseEnter={handleEnter}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onContextMenu={handleContextMenu}
      />
      
      {/* Canvas overlay for tool preview */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: 'center center'
        }}
      >
        {/* Tool cursor preview could go here */}
      </div>
    </div>
  );
});

WhiteboardCanvas.displayName = 'WhiteboardCanvas';

export default WhiteboardCanvas; 