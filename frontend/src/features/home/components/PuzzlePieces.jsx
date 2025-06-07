import React, { useRef, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';

/**
 * PuzzlePieces component following Single Responsibility Principle
 * Optimized with GSAP for performance and proper memory management
 */

// SOLID: Single Responsibility - Each shape definition is focused
const PUZZLE_SHAPES = [
  {
    name: 'classic',
    path: 'M0,0 L40,0 Q45,0 45,5 Q45,15 35,15 Q25,15 25,25 Q25,35 35,35 Q45,35 45,45 Q45,50 40,50 L0,50 Q0,45 5,45 Q15,45 15,35 Q15,25 5,25 Q0,25 0,20 Z',
    width: 45,
    height: 50
  },
  {
    name: 'corner',
    path: 'M0,0 L30,0 Q35,0 35,5 L35,30 Q35,35 30,35 L5,35 Q0,35 0,30 L0,5 Q0,0 5,0 Z',
    width: 35,
    height: 35
  },
  {
    name: 'edge',
    path: 'M0,0 L50,0 Q55,0 55,5 L55,15 Q55,20 50,20 L40,20 Q35,20 35,25 Q35,30 40,30 L50,30 Q55,30 55,35 L55,45 Q55,50 50,50 L0,50 Q0,45 5,45 L5,5 Q5,0 10,0 Z',
    width: 55,
    height: 50
  }
];

// SOLID: Open/Closed - Easy to extend color palettes
const getColorPalette = (theme) => {
  const palettes = {
    dark: [
      '#667eea', '#764ba2', '#f093fb', '#f5576c',
      '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
    ],
    light: [
      '#667eea', '#764ba2', '#f093fb', '#f5576c', 
      '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
    ]
  };
  return palettes[theme] || palettes.light;
};

// SOLID: Single Responsibility - Pure function for piece generation
const generatePieceData = (index, theme, viewportWidth, viewportHeight) => {
  const shapes = PUZZLE_SHAPES;
  const colors = getColorPalette(theme);
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  
  return {
    id: `piece-${index}`,
    shape,
    color: colors[Math.floor(Math.random() * colors.length)],
    startX: Math.random() * (viewportWidth + 200) - 100,
    startY: -shape.height - Math.random() * 200,
    rotation: Math.random() * 360,
    scale: 1.2 + Math.random() * 0.8,
    speed: 8 + Math.random() * 4,
    opacity: 0.4 + Math.random() * 0.3
  };
};

// SOLID: Single Responsibility - Individual puzzle piece component
const PuzzlePiece = React.memo(({ piece, containerRef }) => {
  const pieceRef = useRef();
  const tweenRef = useRef();
  const dimensionsRef = useRef({ width: 1200, height: 800 });

  useEffect(() => {
    if (!pieceRef.current || !containerRef.current) return;

    const element = pieceRef.current;
    const container = containerRef.current;
    
    // Cache dimensions once to avoid repeated reflows
    dimensionsRef.current = {
      width: container.offsetWidth || 1200,
      height: container.offsetHeight || 800
    };

    // Set will-change for better performance
    element.style.willChange = 'transform, opacity';

    // GSAP tween for smooth animation with performance optimizations
    tweenRef.current = gsap.fromTo(element, 
      {
        x: piece.startX,
        y: piece.startY,
        rotation: piece.rotation,
        scale: piece.scale,
        opacity: piece.opacity,
        force3D: true
      },
      {
        y: dimensionsRef.current.height + piece.shape.height,
        rotation: piece.rotation + 180,
        duration: piece.speed,
        ease: "none",
        repeat: -1,
        force3D: true,
        onRepeat: () => {
          // Reset position with cached dimensions to avoid reflows
          gsap.set(element, {
            x: Math.random() * (dimensionsRef.current.width + 200) - 100,
            y: -piece.shape.height - Math.random() * 100,
            force3D: true
          });
        }
      }
    );

    // Cleanup function - CRITICAL for memory management
    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
      // Reset will-change to save memory
      if (element) {
        element.style.willChange = 'auto';
      }
    };
  }, [piece, containerRef]);

  const gradientId = `gradient-${piece.id}`;

  return (
    <g ref={pieceRef}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={piece.color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={piece.color} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path
        d={piece.shape.path}
        fill={`url(#${gradientId})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.5"
      />
    </g>
  );
});

// SOLID: Main component with single responsibility
export const PuzzlePieces = ({ theme = 'light' }) => {
  const containerRef = useRef();

  // Memoized pieces data - prevents unnecessary recalculation
  const piecesData = useMemo(() => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    return Array.from({ length: 2 }, (_, i) => 
      generatePieceData(i, theme, viewportWidth, viewportHeight)
    );
  }, [theme]);

  // Viewport dimensions for SVG
  const viewBox = useMemo(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;
    return `0 0 ${width} ${height}`;
  }, []);

  // Cleanup all animations on unmount with improved performance
  useEffect(() => {
    const container = containerRef.current;
    return () => {
      if (container) {
        gsap.killTweensOf(container);
        // Clean up any remaining will-change properties
        const elements = container.querySelectorAll('g');
        elements.forEach(el => {
          if (el.style) el.style.willChange = 'auto';
        });
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg 
        viewBox={viewBox}
        className="w-full h-full"
        style={{ 
          mixBlendMode: theme === 'dark' ? 'screen' : 'multiply',
          willChange: 'auto' // Prevent unnecessary GPU layers
        }}
      >
        {piecesData.map(piece => (
          <PuzzlePiece 
            key={piece.id} 
            piece={piece} 
            containerRef={containerRef}
          />
        ))}
      </svg>
    </div>
  );
}; 