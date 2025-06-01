import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Modern puzzle piece shapes with smoother curves
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
  },
  {
    name: 'center',
    path: 'M0,5 Q0,0 5,0 L35,0 Q40,0 40,5 Q40,15 30,15 Q20,15 20,25 Q20,35 30,35 Q40,35 40,45 Q40,50 35,50 L5,50 Q0,50 0,45 L0,35 Q10,35 10,25 Q10,15 0,15 Z',
    width: 40,
    height: 50
  }
];

// Theme-aware color palettes
const getColorPalette = (theme) => {
  if (theme === 'dark') {
    return [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
    ];
  } else {
    return [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ];
  }
};

// Optimized piece generation
const generatePieces = (theme, count = 8) => {
  const colors = getColorPalette(theme);
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  
  return Array.from({ length: count }, (_, i) => {
    const shape = PUZZLE_SHAPES[Math.floor(Math.random() * PUZZLE_SHAPES.length)];
    const gradient = colors[Math.floor(Math.random() * colors.length)];
    
    return {
      id: `piece-${i}-${Date.now()}`,
      shape,
      gradient,
      transform: {
        x: Math.random() * (viewportWidth + 200) - 100,
        y: -shape.height - Math.random() * 200,
        rotation: Math.random() * 360,
        scale: 0.6 + Math.random() * 0.8,
        speed: 0.3 + Math.random() * 0.7,
        rotationSpeed: (Math.random() - 0.5) * 2,
        opacity: 0.6 + Math.random() * 0.4
      },
      physics: {
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.3 + Math.random() * 0.7,
        gravity: 0.01
      }
    };
  });
};

// Individual puzzle piece component with enhanced visuals
const PuzzlePiece = React.memo(({ piece, theme, onHover }) => {
  const gradientId = `gradient-${piece.id}`;
  
  return (
    <g 
      transform={`translate(${piece.transform.x}, ${piece.transform.y}) rotate(${piece.transform.rotation}) scale(${piece.transform.scale})`}
      opacity={piece.transform.opacity}
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => onHover?.(piece.id)}
    >
      {/* Enhanced gradient with theme awareness */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme === 'dark' ? '#60a5fa' : '#3b82f6'} stopOpacity="0.9" />
          <stop offset="50%" stopColor={theme === 'dark' ? '#a855f7' : '#8b5cf6'} stopOpacity="1" />
          <stop offset="100%" stopColor={theme === 'dark' ? '#ec4899' : '#d946ef'} stopOpacity="0.9" />
        </linearGradient>
        
        {/* Subtle shadow filter */}
        <filter id={`shadow-${piece.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.2"/>
        </filter>
        
        {/* Highlight gradient for hover effects */}
        <linearGradient id={`highlight-${piece.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {/* Main piece with enhanced styling */}
      <path
        d={piece.shape.path}
        fill={`url(#${gradientId})`}
        stroke={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
        strokeWidth="1"
        filter={`url(#shadow-${piece.id})`}
      />
      
      {/* Highlight overlay */}
      <path
        d={piece.shape.path}
        fill={`url(#highlight-${piece.id})`}
        strokeWidth="0"
      />
    </g>
  );
});

const PuzzlePieces = React.memo(({ theme = 'light' }) => {
  const [pieces, setPieces] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  
  // Memoized initial pieces generation
  const initialPieces = useMemo(() => generatePieces(theme, 4), [theme]);
  
  useEffect(() => {
    setPieces(initialPieces);
  }, [initialPieces]);

  // Optimized animation with requestAnimationFrame
  useEffect(() => {
    let animationId;
    let lastTime = 0;
    const targetFPS = 30; // Reduced from 60 to 30 FPS for better performance
    const frameInterval = 1000 / targetFPS;
    
    const animate = (currentTime) => {
      if (currentTime - lastTime >= frameInterval) {
        setPieces(prevPieces => 
          prevPieces.map(piece => {
            const { transform, physics } = piece;
            
            // Update physics
            const newVy = physics.vy + physics.gravity;
            const newX = transform.x + physics.vx;
            const newY = transform.y + newVy;
            const newRotation = transform.rotation + transform.rotationSpeed * 0.5; // Slower rotation
            
            // Reset piece if it falls off screen
            if (newY > window.innerHeight + 100) {
              const newPiece = generatePieces(theme, 1)[0];
              return {
                ...newPiece,
                id: piece.id // Keep the same ID for React key stability
              };
            }
            
            // Boundary collision for horizontal movement
            const adjustedX = newX < -100 ? window.innerWidth + 50 : 
                            newX > window.innerWidth + 100 ? -50 : newX;
            
            return {
              ...piece,
              transform: {
                ...transform,
                x: adjustedX,
                y: newY,
                rotation: newRotation
              },
              physics: {
                ...physics,
                vy: newVy
              }
            };
          })
        );
        
        lastTime = currentTime;
      }
      
      if (isVisible) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [theme, isVisible]);

  // Enhanced hover handling with animation
  const handlePieceHover = useCallback((pieceId) => {
    setPieces(prevPieces => 
      prevPieces.map(piece => 
        piece.id === pieceId 
          ? {
              ...piece,
              transform: {
                ...piece.transform,
                scale: Math.min(piece.transform.scale * 1.1, 1.2),
                opacity: Math.min(piece.transform.opacity + 0.2, 1)
              }
            }
          : piece
      )
    );
  }, []);

  // Performance: Hide animation when not in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    const heroElement = document.getElementById('hero');
    if (heroElement) {
      observer.observe(heroElement);
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <svg 
      viewBox={`0 0 ${typeof window !== 'undefined' ? window.innerWidth : 1200} ${typeof window !== 'undefined' ? window.innerHeight : 800}`}
      className="w-full h-full"
      style={{ mixBlendMode: theme === 'dark' ? 'screen' : 'multiply' }}
    >
      {/* Enhanced global effects */}
      <defs>
        {/* Atmospheric glow */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Global highlight gradient */}
        <linearGradient id="highlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {pieces.map(piece => (
        <PuzzlePiece 
          key={piece.id} 
          piece={piece} 
          theme={theme}
          onHover={handlePieceHover}
        />
      ))}
    </svg>
  );
});

export default PuzzlePieces;