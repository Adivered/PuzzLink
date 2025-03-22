import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PuzzlePiece = ({ id, imageUrl, pieceData, isInBank, cellSize }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const parsedData = typeof pieceData === 'string' ? JSON.parse(pieceData) : pieceData;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    backgroundImage: `url(${imageUrl})`,
    backgroundPosition: `-${parsedData.x}px -${parsedData.y}px`,
    backgroundSize: '1000px 1000px', // Adjust this based on your image size
    backgroundRepeat: 'no-repeat',
    position: 'absolute',
    top: 0,
    left: 0,
    cursor: 'grab',
    touchAction: 'none',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute inset-0 ${isInBank ? 'rounded-lg shadow-md hover:shadow-lg' : ''} 
        ${isDragging ? 'ring-2 ring-blue-500' : ''} transition-shadow`}
      {...listeners}
      {...attributes}
    />
  );
};

export default React.memo(PuzzlePiece);