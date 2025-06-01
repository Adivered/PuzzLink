import React from "react";

const PuzzlePiece = ({ 
  id, 
  imageUrl, 
  pieceData, 
  isInBank, 
  cellSize, 
  onClick,
  isSelected = false,
  isCorrectlyPlaced = false,
  totalPieces = 16
}) => {
  const parsedData = typeof pieceData === 'string' ? JSON.parse(pieceData) : pieceData;

  // Fixed background positioning and sizing calculation
  const originalImageSize = 1000; // The source image is 1000x1000
  
  // Calculate the grid size dynamically based on total pieces
  const gridSize = Math.sqrt(totalPieces);
  const originalPieceSize = originalImageSize / gridSize;
  
  // Scale factor to fit the piece into the current cell size
  const scaleFactor = cellSize / originalPieceSize;
  
  const style = {
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    backgroundImage: `url(${imageUrl})`,
    // Position the background image correctly - the x,y values are already in pixels from the original image
    backgroundPosition: `-${parsedData.x * scaleFactor}px -${parsedData.y * scaleFactor}px`,
    // Scale the entire image proportionally
    backgroundSize: `${originalImageSize * scaleFactor}px ${originalImageSize * scaleFactor}px`,
    backgroundRepeat: 'no-repeat',
    position: 'absolute',
    top: 0,
    left: 0,
    cursor: onClick ? 'pointer' : 'default',
    touchAction: 'none',
    // Ensure perfect alignment
    boxSizing: 'border-box',
    imageRendering: 'crisp-edges',
  };

  const getClassName = () => {
    let className = 'absolute inset-0 transition-all duration-200 ease-in-out';
    
    // Remove all borders, shadows, and rounded corners for seamless puzzle fit
    if (isInBank) {
      // Keep styling for bank pieces since they need to be visible as individual pieces
      className += ' rounded-xl shadow-lg hover:shadow-xl transform border-2 border-gray-400 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500';
    } else {
      // Grid pieces should be completely seamless - no borders, shadows, or rounded corners
      className += '';
    }
    
    // Selection and correctness states - keep these for functionality
    if (isSelected && !isInBank) {
      className += ' ring-2 ring-blue-500 ring-opacity-75 z-20';
    } else if (isCorrectlyPlaced && !isInBank) {
      className += ' ring-1 ring-green-500 ring-opacity-50';
    }
    
    // Enhanced hover and interaction states only for bank pieces
    if (onClick && !isSelected && isInBank) {
      className += ' hover:brightness-110 cursor-pointer transform hover:scale-[1.02] hover:shadow-lg transition-all duration-200';
    } else if (onClick && !isInBank) {
      className += ' cursor-pointer hover:brightness-105';
    }
    
    return className;
  };

  return (
    <div
      style={style}
      className={getClassName()}
      onClick={onClick}
      data-piece-id={id}
    />
  );
};

export default PuzzlePiece;