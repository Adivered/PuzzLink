import React, { useState, useEffect } from 'react';

const PIECE_SHAPES = [
  [[1, 0], [1, 0], [1, 1]], // L piece
  [[1], [1], [1], [1]], // I piece
  [[0, 1, 0], [1, 1, 1]], // T piece
  [[0, 1, 1], [1, 1, 0]], // S piece
  [[1, 1, 0], [0, 1, 1]], // Z piece
  [[1, 1], [1, 1]], // O piece
];

// Generate random starting position at the top with better spacing
const getStartPosition = () => ({
  x: Math.random() * window.innerWidth, // Random x position spanning the entire viewport width including negative values
  y: -50
});

const generatePath = (shape) => {
  const size = 30; // Increased size for better visibility
  let path = '';
  
  shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        path += `M${x * size},${y * size} h${size} v${size} h-${size} z `;
      }
    });
  });
  
  return path;
};

const TetrisPiece = React.memo(({ piece }) => (
  <path
    d={generatePath(piece.shape)}
    fill={piece.color}
    transform={`translate(${piece.transform.x} ${piece.transform.y}) 
               scale(${piece.transform.scale})`}
  />
));

const generatePieces = () => {
  // Random number of pieces between 5 and 12
  const numPieces = Math.floor(Math.random() * 8) + 2;
  
  return Array.from({ length: numPieces }, (_, i) => {
    const position = getStartPosition();
    const shapeIndex = Math.floor(Math.random() * PIECE_SHAPES.length);
    
    return {
      id: i,
      shape: PIECE_SHAPES[shapeIndex],
      color: `hsl(${Math.random() * 360}, ${70 + Math.random() * 20}%, ${50 + Math.random() * 20}%)`,
      transform: {
        x: position.x,
        y: position.y,
        scale: (Math.random() * 0.8 + 1.2).toFixed(2), // Slightly larger scale
        speed: 0.5 + Math.random() * 3 // Slower falling speed
      }
    };
  });
};

const PuzzlePieces = React.memo(() => {
  const [pieces, setPieces] = useState(() => generatePieces());
  
  useEffect(() => {
    let animationFrameId;
    let lastTime = 0;
    
    const animate = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      const delta = (currentTime - lastTime) / 16;
      
      setPieces(prevPieces => 
        prevPieces.map(piece => {
          const newY = piece.transform.y + (piece.transform.speed * delta);
          
          // Reset piece to top when it falls below viewport
          if (newY > 1100) {
            const newPosition = getStartPosition();
            return {
              ...piece,
              transform: {
                ...piece.transform,
                x: newPosition.x,
                y: newPosition.y
              }
            };
          }
          
          return {
            ...piece,
            transform: {
              ...piece.transform,
              y: newY
            }
          };
        })
      );
      
      lastTime = currentTime;
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Regenerate pieces every 30 seconds to maintain random count
  useEffect(() => {
    const interval = setInterval(() => {
      setPieces(generatePieces());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <svg viewBox="0 0 1000 1000">
      {pieces.map(piece => (
        <TetrisPiece key={piece.id} piece={piece} />
      ))}
    </svg>
  );
});


export default PuzzlePieces;