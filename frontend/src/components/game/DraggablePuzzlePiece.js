import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import PuzzlePiece from './PuzzlePiece';

const DraggablePuzzlePiece = ({ 
  id, 
  imageUrl, 
  pieceData, 
  isInBank, 
  cellSize, 
  onClick,
  isSelected = false,
  isCorrectlyPlaced = false,
  isDragging = false,
  totalPieces = 16
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingFromKit,
  } = useDraggable({
    id: id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDraggingFromKit ? 1000 : 'auto',
    opacity: isDraggingFromKit ? 0.8 : 1,
    transition: isDraggingFromKit ? 'none' : 'all 0.2s ease-in-out',
  } : {
    transition: 'all 0.2s ease-in-out',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${isDraggingFromKit ? 'cursor-grabbing' : 'cursor-grab'} ${isDraggingFromKit ? 'z-50' : ''}`}
    >
      <PuzzlePiece
        id={id}
        imageUrl={imageUrl}
        pieceData={pieceData}
        isInBank={isInBank}
        cellSize={cellSize}
        onClick={!isDraggingFromKit ? onClick : undefined}
        isSelected={isSelected && !isDraggingFromKit}
        isCorrectlyPlaced={isCorrectlyPlaced}
        totalPieces={totalPieces}
      />
    </div>
  );
};

export default React.memo(DraggablePuzzlePiece); 